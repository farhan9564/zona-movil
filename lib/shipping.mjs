import {z} from 'zod';
export const defaults={enabled:false,pickup:true,zones:[]};
export const postcodeValid=p=>/^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/.test(p);
export function patterns(value){return value.split(/[\s,;]+/).filter(Boolean)}
function validPattern(p){if(p==='*')return true;if(/^\d{1,4}\*$/.test(p))return true;if(postcodeValid(p))return true;const a=p.split('-');return a.length===2&&a.every(postcodeValid)&&a[0]<=a[1]}
export const shippingSchema=z.object({enabled:z.boolean(),pickup:z.boolean(),zones:z.array(z.object({id:z.string().min(1).max(100),name:z.string().trim().min(1).max(100),postcodes:z.string().min(1).max(2000).refine(v=>patterns(v).length>0&&patterns(v).every(validPattern)),price:z.number().int().min(0).max(100000),freeAbove:z.number().int().min(0).max(10000000).nullable(),estimate:z.string().trim().max(100),active:z.boolean()})).max(50)}).refine(s=>s.pickup||s.enabled,{message:'Activa al menos una modalidad'}).refine(s=>!s.enabled||s.zones.some(z=>z.active),{message:'Añade una zona activa'});
export function matches(postcode,pattern){if(pattern==='*')return true;if(pattern.endsWith('*'))return postcode.startsWith(pattern.slice(0,-1));if(pattern.includes('-')){const [a,b]=pattern.split('-');return postcode>=a&&postcode<=b}return postcode===pattern}
export function quoteShipping(settings,method,postcode,subtotal){
 if(method==='pickup'){if(!settings.pickup)throw Error('La recogida no está disponible.');return {method,fee:0,name:'Recogida en tienda',estimate:''}}
 if(method!=='delivery'||!settings.enabled)throw Error('El envío no está disponible.');
 if(!postcodeValid(postcode))throw Error('Introduce un código postal español de cinco cifras.');
 const zone=settings.zones.find(z=>z.active&&patterns(z.postcodes).some(p=>matches(postcode,p)));
 if(!zone)throw Error('No hay envío disponible para este código postal.');
 return {method,zoneId:zone.id,name:zone.name,estimate:zone.estimate,fee:zone.freeAbove!==null&&subtotal>=zone.freeAbove?0:zone.price};
}
export function paypalUnit(id,total,subtotal,customer){const d=customer.delivery;return {reference_id:id,amount:{currency_code:'EUR',value:(total/100).toFixed(2),breakdown:{item_total:{currency_code:'EUR',value:(subtotal/100).toFixed(2)},shipping:{currency_code:'EUR',value:(d.fee/100).toFixed(2)}}},description:'Zona Móvil · '+(d.method==='delivery'?'Envío a domicilio':'Recogida en tienda'),...(d.method==='delivery'?{shipping:{name:{full_name:customer.name},address:{address_line_1:d.address.line1,address_line_2:d.address.line2||undefined,admin_area_2:d.address.city,admin_area_1:d.address.province,postal_code:d.address.postcode,country_code:'ES'}}}:{})}}
