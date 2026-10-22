import './globals.css';
import {siteOrigin} from '../lib/seo.mjs';
export const metadata={metadataBase:new URL(siteOrigin()),title:{default:'ZONA MÓVIL · Móviles y reparaciones en Castelldefels',template:'%s | ZONA MÓVIL'},description:'Móviles, accesorios, reparaciones, tarjetas SIM, recargas, envíos de dinero e impresión en Castelldefels.',icons:{icon:'/logo.png'},robots:{index:true,follow:true}};
export default function Layout({children}){return <html lang="es"><body>{children}</body></html>}
