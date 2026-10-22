import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {randomUUID,randomBytes,createHash,createHmac} from 'node:crypto';
import {z} from 'zod';
import {query,catalog} from '../../../lib/db';
import {makeSession,validSession,adminPasswordConfigured,verifyAdminPassword,encrypt,totalFor} from '../../../lib/security.mjs';
import {settings,paypal,isPaid} from '../../../lib/paypal';
import {defaults,shippingSchema,quoteShipping,paypalUnit} from '../../../lib/shipping.mjs';
async function shippingSettings(){const r=await query("select value from settings where id='shipping'");return r.rows[0]?shippingSchema.parse(JSON.parse(r.rows[0].value)):defaults}
export const runtime='nodejs';export const dynamic='force-dynamic';
const json=(v,status=200)=>NextResponse.json(v,{status,headers:{'Cache-Control':'no-store'}});
const text=(max=200)=>z.string().trim().min(1).max(max);
const cartItems=z.array(z.object({id:text(100),quantity:z.number().int().min(1).max(10)})).min(1).max(30);
const tokenHash=t=>createHash('sha256').update(t).digest('hex');
const product=z.object({id:z.string().optional(),name:text(120),category:text(80),price:z.number().int().min(1).max(1000000),condition:z.enum(['Nuevo','Reacondicionado']),description:text(4000),image:z.string().max(1500).refine(s=>s===''||s.startsWith('/phone')||/^https:\/\/res\.cloudinary\.com\//.test(s)),active:z.boolean()});
const review=z.object({id:z.string().optional(),name:text(80),rating:z.number().int().min(1).max(5),text:text(1500),published:z.boolean()});
async function admin(){return validSession((await cookies()).get('zona_admin')?.value||'')}
function origin(req){const expected=new URL(process.env.APP_URL||req.url).origin;if(req.headers.get('origin')!==expected)throw Error('Origen no autorizado')}
async function handle(req,ctx){try{
const path=(await ctx.params).path.join('/');const method=req.method;
if(method==='GET'){
 if(path==='catalog')return json(await catalog());
 if(path==='config'){if(!process.env.DATABASE_URL)return json({demo:true,enabled:false});const s=await settings();return json({shipping:await shippingSettings(),enabled:!!(s.enabled&&s.legalReady&&s.clientId&&s.secret),mode:s.mode,businessName:s.businessName||'',taxId:s.taxId||'',returns:s.returns||'',privacy:s.privacy||'',legalReady:!!s.legalReady,demo:false})}
 if(path==='admin/shipping'){if(!await admin())return json({error:'No autorizado'},401);return json(await shippingSettings())}
 if(path==='admin/session')return json({authenticated:await admin(),demo:!process.env.DATABASE_URL});
 if(path==='admin/data'){if(!await admin())return json({error:'No autorizado'},401);const [p,c,r,o,s]=await Promise.all([query('select * from products order by created_at desc'),query('select * from categories order by name'),query('select * from reviews order by created_at desc'),query('select id,customer,items,total,status,paypal_mode,fulfilled,created_at from orders order by created_at desc limit 200'),settings()]);return json({products:p.rows,categories:c.rows,reviews:r.rows,orders:o.rows,settings:{...s,secret:'',hasSecret:!!s.secret}})}
 return json({error:'No encontrado'},404)
}
origin(req);
if(Number(req.headers.get('content-length')||0)>50000)return json({error:'Solicitud demasiado grande'},413);
const raw=await req.text();if(raw.length>50000)return json({error:'Solicitud demasiado grande'},413);const b=raw?JSON.parse(raw):{};
if(path==='admin/login'){
 if(!process.env.DATABASE_URL||!adminPasswordConfigured()||!process.env.ADMIN_EMAIL||(process.env.SESSION_SECRET||'').length<64)return json({error:'Configura la base de datos y las variables de administrador.'},503);
 const ip=process.env.VERCEL?req.headers.get('x-vercel-forwarded-for')||'unknown':'local';const key=createHmac('sha256',process.env.SESSION_SECRET||'login').update(ip).digest('hex');
 const r=await query("insert into login_attempts(ip,count) values($1,1) on conflict(ip) do update set count=case when login_attempts.window_start<now()-interval '15 minutes' then 1 else login_attempts.count+1 end,window_start=case when login_attempts.window_start<now()-interval '15 minutes' then now() else login_attempts.window_start end returning count",[key]);if(r.rows[0].count>10)return json({error:'Demasiados intentos. Espera 15 minutos.'},429);
 if(b.email!==process.env.ADMIN_EMAIL||typeof b.password!=='string'||b.password.length>200||!verifyAdminPassword(b.password))return json({error:'Credenciales incorrectas'},401);
 const response=json({ok:true});response.cookies.set('zona_admin',makeSession(),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:28800});return response
}
if(path==='admin/logout'){const response=json({ok:true});response.cookies.set('zona_admin','',{maxAge:0,path:'/'});return response}
if(path.startsWith('admin/')){
 if(!await admin())return json({error:'No autorizado'},401);
 if(path==='admin/shipping'){const v=shippingSchema.parse(b);await query("insert into settings(id,value) values('shipping',$1) on conflict(id) do update set value=$1",[JSON.stringify(v)]);return json({ok:true})}
 if(path==='admin/products'){const p=product.parse(b);const id=p.id||randomUUID();await query('insert into products(id,name,category,price,condition,description,image,active) values($1,$2,$3,$4,$5,$6,$7,$8) on conflict(id) do update set name=$2,category=$3,price=$4,condition=$5,description=$6,image=$7,active=$8',[id,p.name,p.category,p.price,p.condition,p.description,p.image,p.active]);return json({ok:true,id})}
 if(path==='admin/categories'){const name=text(80).parse(b.name);const id=b.id?z.string().regex(/^[a-z0-9-]{1,80}$/).parse(b.id):name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');await query('insert into categories(id,name) values($1,$2) on conflict(id) do update set name=$2',[id,name]);return json({ok:true})}
 if(path==='admin/reviews'){const r=review.parse(b);await query('insert into reviews(id,name,rating,text,published) values($1,$2,$3,$4,$5) on conflict(id) do update set name=$2,rating=$3,text=$4,published=$5',[r.id||randomUUID(),r.name,r.rating,r.text,r.published]);return json({ok:true})}
 if(path==='admin/delete'){const table={products:'products',categories:'categories',reviews:'reviews'}[b.type];if(!table)throw Error('Tipo no válido');await query(`delete from ${table} where id=$1`,[text(100).parse(b.id)]);return json({ok:true})}
 if(path==='admin/fulfill'){const id=text(100).parse(b.id);await query("update orders set fulfilled=$2 where id=$1 and status='PAID'",[id,z.boolean().parse(b.fulfilled)]);return json({ok:true})}
 if(path==='admin/settings'){const s=z.object({enabled:z.boolean(),mode:z.enum(['sandbox','live']),clientId:z.string().max(300),secret:z.string().max(300),businessName:z.string().max(200),taxId:z.string().max(80),returns:z.string().max(8000),privacy:z.string().max(8000),legalReady:z.boolean()}).parse(b);const old=await settings();s.secret=s.secret?encrypt(s.secret):old.secret||'';if(s.enabled&&(!s.secret||!s.clientId||!s.businessName||!s.taxId||!s.returns||!s.privacy||!s.legalReady))throw Error('Completa las credenciales y los textos legales antes de activar los pagos.');if(old.mode!==s.mode||old.clientId!==s.clientId||b.secret){const pending=await query("select id from orders where status in ('PENDING','PAYMENT_REVIEW') and paypal_id is not null limit 1");if(pending.rows.length)throw Error('Reconcilia los pedidos pendientes antes de cambiar las credenciales o el modo.')}await query("insert into settings(id,value) values('shop',$1) on conflict(id) do update set value=$1",[JSON.stringify(s)]);return json({ok:true})}
 if(path==='admin/upload-signature'){const cloud=process.env.CLOUDINARY_CLOUD_NAME,key=process.env.CLOUDINARY_API_KEY,secret=process.env.CLOUDINARY_API_SECRET;if(!cloud||!key||!secret)throw Error('Configura Cloudinary en las variables del servidor.');const timestamp=Math.floor(Date.now()/1000);const signature=createHash('sha1').update(`folder=zona-movil&timestamp=${timestamp}${secret}`).digest('hex');return json({cloud,api_key:key,timestamp,signature,folder:'zona-movil'})}
 if(path==='admin/reconcile'){const r=await query('select * from orders where id=$1',[text(100).parse(b.id)]);const o=r.rows[0];if(!o?.paypal_id)throw Error('Pedido sin referencia PayPal');const data=await paypal('/v2/checkout/orders/'+encodeURIComponent(o.paypal_id));if(isPaid(data,o))await query("update orders set status='PAID' where id=$1",[o.id]);else if(data.status==='VOIDED')await query("update orders set status='CANCELLED' where id=$1 and status!='PAID'",[o.id]);return json({ok:true,message:isPaid(data,o)?'Pago confirmado':`Estado PayPal: ${data.status}. No se ha marcado como pagado.`})}
 return json({error:'No encontrado'},404)
}
if(path==='checkout/quote'){
 if(!process.env.DATABASE_URL)return json({error:'Modo demostración: entrega no disponible.'},400);
 const items=cartItems.parse(b.items);const ps=await query('select * from products where id=any($1::text[]) and active=true',[items.map(i=>i.id)]);const subtotal=totalFor(items,ps.rows);
 try{const delivery=quoteShipping(await shippingSettings(),b.method,b.postcode||'',subtotal);return json({subtotal,delivery,total:subtotal+delivery.fee})}catch(e){return json({error:e.message},400)}
}
if(path==='checkout/create'){
 const ip=process.env.VERCEL?req.headers.get('x-vercel-forwarded-for')||'unknown':'local';const rateKey='checkout:'+createHash('sha256').update(ip).digest('hex');const limit=await query("insert into login_attempts(ip,count) values($1,1) on conflict(ip) do update set count=case when login_attempts.window_start<now()-interval '15 minutes' then 1 else login_attempts.count+1 end,window_start=case when login_attempts.window_start<now()-interval '15 minutes' then now() else login_attempts.window_start end returning count",[rateKey]);if(limit.rows[0].count>20)return json({error:'Demasiados intentos de compra. Espera 15 minutos.'},429);
 const s=await settings();if(!s.enabled||!s.legalReady)throw Error('Los pagos online no están disponibles. Contacta con la tienda.');
 const customer=z.object({name:text(100),email:z.email().max(200),phone:z.string().regex(/^[+\d\s()-]{7,25}$/),terms:z.literal(true)}).parse(b.customer);
 const items=z.array(z.object({id:text(100),quantity:z.number().int().min(1).max(10)})).min(1).max(30).parse(b.items);
 const ps=await query('select * from products where id=any($1::text[]) and active=true',[items.map(i=>i.id)]);const subtotal=totalFor(items,ps.rows);
 const method=z.enum(['pickup','delivery']).parse(b.method||'pickup');
 const address=method==='delivery'?z.object({line1:text(150),line2:z.string().trim().max(100).default(''),city:text(100),province:text(100),postcode:z.string().regex(/^[0-9]{5}$/),country:z.literal('ES')}).parse(b.address):undefined;
 let delivery;try{delivery=quoteShipping(await shippingSettings(),method,address?.postcode||'',subtotal)}catch(e){return json({error:e.message},400)}
 const total=subtotal+delivery.fee;if(b.expectedTotal!==total)return json({error:'El importe ha cambiado. Actualiza el cálculo antes de pagar.'},409);
 customer.delivery={...delivery,address,subtotal};
 const id=randomUUID(),token=randomBytes(32).toString('hex');
 const lines=items.map(i=>({id:i.id,name:ps.rows.find(p=>p.id===i.id).name,price:ps.rows.find(p=>p.id===i.id).price,quantity:i.quantity}));
 await query('insert into orders(id,token_hash,customer,items,total,paypal_mode) values($1,$2,$3,$4,$5,$6)',[id,tokenHash(token),JSON.stringify(customer),JSON.stringify(lines),total,s.mode]);
 const base=process.env.APP_URL;if(!base)throw Error('Configura APP_URL');
 const data=await paypal('/v2/checkout/orders',{method:'POST',requestId:id,config:s,body:{intent:'CAPTURE',purchase_units:[paypalUnit(id,total,subtotal,customer)],payment_source:{paypal:{experience_context:{brand_name:'ZONA MÓVIL',shipping_preference:method==='delivery'?'SET_PROVIDED_ADDRESS':'NO_SHIPPING',user_action:'PAY_NOW',return_url:base+'/pago?order='+id,cancel_url:base+'/carrito?cancelado=1'}}}}});
 await query('update orders set paypal_id=$2 where id=$1',[id,data.id]);const approval=data.links?.find(l=>l.rel==='payer-action'||l.rel==='approve')?.href;if(!approval)throw Error('PayPal no devolvió un enlace de pago');return json({id,token,approval})
}
if(path==='checkout/capture'){
 const id=text(100).parse(b.id),token=z.string().regex(/^[a-f0-9]{64}$/).parse(b.token);const r=await query('select * from orders where id=$1 and token_hash=$2',[id,tokenHash(token)]);const o=r.rows[0];if(!o?.paypal_id)return json({error:'Pedido no encontrado'},404);if(o.status==='PAID')return json({ok:true,id});
 let data;try{data=await paypal('/v2/checkout/orders/'+encodeURIComponent(o.paypal_id)+'/capture',{method:'POST',body:{},requestId:'capture-'+id})}catch{data=await paypal('/v2/checkout/orders/'+encodeURIComponent(o.paypal_id))}
 if(!isPaid(data,o)){await query("update orders set status='PAYMENT_REVIEW' where id=$1 and status!='PAID'",[id]);return json({error:'El pago todavía no está confirmado. Reintenta la comprobación o contacta con la tienda con tu referencia.'},409)}
 await query("update orders set status='PAID' where id=$1",[id]);return json({ok:true,id})
}
return json({error:'No encontrado'},404)
}catch(e){if(e instanceof z.ZodError)return json({error:'Revisa los datos introducidos.'},400);console.error('Request failed:',e.code||e.name);return json({error:e.code==='23503'?'La categoría contiene productos o no existe.':e.message?.includes('configur')||e.message?.includes('PayPal')||e.message?.includes('pedido')||e.message?.includes('Completa')||e.message?.includes('Reconcilia')?e.message:'No se pudo completar la operación. Revisa los datos y la configuración.'},400)}}
export const GET=handle;export const POST=handle;
