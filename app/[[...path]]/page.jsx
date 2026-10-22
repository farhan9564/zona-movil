import Store from '../../components/Store';
import {services} from '../../lib/data';
import {notFound} from 'next/navigation';
import {routeMetadata,businessSchema} from '../../lib/seo.mjs';
import {query} from '../../lib/db';
const pages=['','tienda','carrito','contacto','nosotros','privacidad','condiciones','admin','pago','servicios'];
export async function generateMetadata({params}){const p=(await params).path||[];let product;if(p[0]==='producto'&&process.env.DATABASE_URL){try{const r=await query('select name,description from products where id=$1 and active=true',[p[1]]);product=r.rows[0]}catch{console.error('Product metadata unavailable')}}return routeMetadata(p,product)}
export default async function Page({params}){const p=(await params).path||[];if(!(pages.includes(p.join('/'))||p.length===1&&services.some(s=>s.slug===p[0])||p.length===2&&(p[0]==='producto'||p[0]==='tienda'&&['moviles','accesorios','tarjetas-sim'].includes(p[1]))))notFound();return <>{(!p.length||p[0]==='contacto')&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(businessSchema()).replace(/</g,'\\u003c')}}/>}<Store path={p}/></>}
