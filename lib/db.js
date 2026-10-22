import {productImages} from './product-images.mjs';
import pg from 'pg';
const globalDB=globalThis;
export function db(){if(!process.env.DATABASE_URL)throw Error('Base de datos no configurada');if(!globalDB.zonaPool)globalDB.zonaPool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:3});return globalDB.zonaPool}
export const query=(text,params=[])=>db().query(text,params);
export async function catalog(){if(!process.env.DATABASE_URL){const d=await import('./data.js');return {products:d.demoProducts,categories:d.categories,reviews:[],demo:true}}const [p,c,r]=await Promise.all([query('select * from products where active=true order by created_at desc'),query('select * from categories order by name'),query('select id,name,rating,text from reviews where published=true order by created_at desc limit 12')]);return {products:p.rows.map(productImages),categories:c.rows,reviews:r.rows,demo:false}}
