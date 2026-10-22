import {wa} from './data.js';
export const directions='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent('Av. Manuel Girona 14, Bajo 2, Castelldefels, Barcelona, España');
export const whatsapp=message=>wa+'?text='+encodeURIComponent(message);
export function inquiryMessage(kind,values){
 const clean=(key,max=300)=>String(values[key]||'').trim().slice(0,max);
 const details=clean('details',800),brand=clean('brand',80),model=clean('model',100),problem=clean('problem',100),name=clean('name',80),reason=clean('reason',100);
 if(kind==='repair'){if(!brand||!model||!problem)throw Error('Indica la marca, el modelo y el problema del dispositivo.');return `Hola, Zona Móvil. Quiero consultar una reparación.\nMarca: ${brand}\nModelo: ${model}\nProblema: ${problem}${details?'\nDetalles: '+details:''}\n¿Podéis indicarme el siguiente paso para una valoración?`}
 if(kind==='purchase'){if(!model)throw Error('Indica el modelo o el tipo de móvil que buscas.');return `Hola, Zona Móvil. Busco un móvil: ${model}.\nEstado preferido: ${clean('condition',60)||'Sin preferencia'}${clean('budget',60)?'\nPresupuesto orientativo: '+clean('budget',60):''}${details?'\nDetalles: '+details:''}\nQuisiera confirmar disponibilidad, precio y condiciones de garantía.`}
 if(!reason||!details)throw Error('Elige el motivo y escribe tu consulta.');return `Hola, Zona Móvil.${name?' Soy '+name+'.':''}\nConsulta: ${reason}\n${details}`;
}
export function conversionEvent(href,service='general'){if(href.startsWith(wa))return service==='repair'?'repair_inquiry':service==='purchase'?'purchase_inquiry':'whatsapp_click';if(href.startsWith('tel:+34642837030'))return 'phone_click';if(href.startsWith('https://www.google.com/maps/'))return 'directions_click';return null}
