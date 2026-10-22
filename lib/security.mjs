import {createHmac,timingSafeEqual,scryptSync,randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
export function hashPassword(password,salt=randomBytes(16).toString('hex')) {return salt+':'+scryptSync(password,salt,64).toString('hex')}
export function verifyPassword(password,stored) {try {const [salt,hash]=stored.split(':');const a=Buffer.from(hash,'hex'),b=scryptSync(password,salt,64);return a.length===b.length&&timingSafeEqual(a,b)}catch{return false}}
const sign=s=>createHmac('sha256',process.env.SESSION_SECRET).update(s).digest('base64url');
export function makeSession(){if((process.env.SESSION_SECRET||'').length<64)throw Error('Configure SESSION_SECRET');const p=Buffer.from(JSON.stringify({exp:Date.now()+8*3600000,role:'admin',nonce:randomBytes(16).toString('hex')})).toString('base64url');return p+'.'+sign(p)}
export function validSession(s){try{const [p,h]=s.split('.');const a=Buffer.from(h),b=Buffer.from(sign(p));return a.length===b.length&&timingSafeEqual(a,b)&&JSON.parse(Buffer.from(p,'base64url')).exp>Date.now()}catch{return false}}
function key(){const k=Buffer.from(process.env.SETTINGS_ENCRYPTION_KEY||'','hex');if(k.length!==32)throw Error('Configure SETTINGS_ENCRYPTION_KEY');return k}
export function encrypt(value){const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',key(),iv);const data=Buffer.concat([c.update(value,'utf8'),c.final()]);return [iv.toString('hex'),c.getAuthTag().toString('hex'),data.toString('hex')].join('.')}
export function decrypt(value){const [iv,tag,data]=value.split('.');const c=createDecipheriv('aes-256-gcm',key(),Buffer.from(iv,'hex'));c.setAuthTag(Buffer.from(tag,'hex'));return c.update(Buffer.from(data,'hex'),'buffer','utf8')+c.final('utf8')}
export function totalFor(items,products){if(!Array.isArray(items)||!items.length||items.length>30)throw Error('Carrito no válido');const seen=new Set();return items.reduce((total,item)=>{if(seen.has(item.id)||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>10)throw Error('Cantidad no válida');seen.add(item.id);const p=products.find(p=>p.id===item.id&&p.active);if(!p)throw Error('Producto no disponible');return total+p.price*item.quantity},0)}

let cachedAdminPassword, cachedAdminHash;
export function adminPasswordConfigured(env=process.env) {
  if (env.ADMIN_PASSWORD_HASH) return /^[a-f0-9]{32}:[a-f0-9]{128}$/i.test(env.ADMIN_PASSWORD_HASH);
  return typeof env.ADMIN_PASSWORD==='string' && env.ADMIN_PASSWORD.length>=14 && env.ADMIN_PASSWORD.length<=200;
}
export function verifyAdminPassword(password,env=process.env) {
  if(typeof password!=='string'||password.length>200||!adminPasswordConfigured(env))return false;
  if(env.ADMIN_PASSWORD_HASH)return verifyPassword(password,env.ADMIN_PASSWORD_HASH);
  // Derive and cache a salted hash on the server; never send the environment secret to clients.
  if(cachedAdminPassword!==env.ADMIN_PASSWORD) {
    cachedAdminHash=hashPassword(env.ADMIN_PASSWORD);
    cachedAdminPassword=env.ADMIN_PASSWORD;
  }
  return verifyPassword(password,cachedAdminHash);
}
