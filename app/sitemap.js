import {siteOrigin,publicRoutes} from '../lib/seo.mjs';
import {query} from '../lib/db';
export const dynamic='force-dynamic';
export default async function sitemap(){const routes=publicRoutes.map(p=>({url:siteOrigin()+'/'+p}));if(process.env.DATABASE_URL){try{const r=await query('select id from products where active=true');for(const p of r.rows)routes.push({url:siteOrigin()+'/producto/'+encodeURIComponent(p.id)})}catch{console.error('Sitemap product lookup unavailable')}}return routes}
