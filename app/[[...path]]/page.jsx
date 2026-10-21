import Store from '../../components/Store';
import {services} from '../../lib/data';
import {notFound} from 'next/navigation';
const pages=['','tienda','carrito','contacto','nosotros','privacidad','condiciones','admin','pago','servicios'];
export async function generateMetadata({params}){const p=(await params).path||[];const name=services.find(s=>s.slug===p[0])?.name||({contacto:'Contacto',nosotros:'Nosotros',privacidad:'Privacidad',condiciones:'Condiciones de compra',tienda:'Tienda',admin:'Administración',carrito:'Tu carrito',pago:'Confirmación de pago'})[p[0]];return {title:name, ...(p[0]==='admin'||p[0]==='pago'?{robots:{index:false,follow:false}}:{})}}
export default async function Page({params}){const p=(await params).path||[];if(!(pages.includes(p.join('/'))||p.length===1&&services.some(s=>s.slug===p[0])||p.length===2&&p[0]==='producto'))notFound();return <Store path={p}/>}
