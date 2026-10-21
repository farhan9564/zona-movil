import pg from 'pg';import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw Error('Set DATABASE_URL in .env.local');const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});try{await pool.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));console.log('Database ready. No demo products or reviews inserted.')}finally{await pool.end()}
