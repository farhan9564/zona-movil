import test from 'node:test';import assert from 'node:assert/strict';
import {hashPassword,verifyPassword,adminPasswordConfigured,verifyAdminPassword,makeSession,validSession,encrypt,decrypt,totalFor} from '../lib/security.mjs';import {isPaid} from '../lib/paypal.js';
process.env.SESSION_SECRET='ab'.repeat(32);process.env.SETTINGS_ENCRYPTION_KEY='cd'.repeat(32);
test('password verification rejects wrong and malformed credentials',()=>{const h=hashPassword('a-long-unique-password');assert.equal(verifyPassword('a-long-unique-password',h),true);assert.equal(verifyPassword('wrong',h),false);assert.equal(verifyPassword('x','invalid'),false)});
test('admin sessions reject tampered signatures',()=>{const token=makeSession();assert.equal(validSession(token),true);assert.equal(validSession(token+'x'),false);assert.equal(validSession(''),false)});
test('payment secret authenticated encryption',()=>{const encrypted=encrypt('paypal-private-secret');assert.ok(!encrypted.includes('paypal-private-secret'));assert.equal(decrypt(encrypted),'paypal-private-secret');const parts=encrypted.split('.');parts[2]='00'+parts[2].slice(2);assert.throws(()=>decrypt(parts.join('.')))});
test('checkout ignores client price and totals server catalog',()=>{assert.equal(totalFor([{id:'one',quantity:2,price:1}],[{id:'one',price:34900,active:true}]),69800)});
test('checkout rejects unavailable, duplicated, fractional and oversized quantities',()=>{const p=[{id:'one',price:1000,active:true},{id:'off',price:1000,active:false}];for(const items of [[],[{id:'off',quantity:1}],[{id:'one',quantity:1},{id:'one',quantity:1}],[{id:'one',quantity:1.5}],[{id:'one',quantity:11}],[{id:'one',quantity:-1}]])assert.throws(()=>totalFor(items,p))});
const order={id:'local-1',paypal_id:'PP123',total:34900};const paid={id:'PP123',status:'COMPLETED',purchase_units:[{reference_id:'local-1',payments:{captures:[{status:'COMPLETED',amount:{currency_code:'EUR',value:'349.00'}}]}}]};
test('payment verification requires exact completed capture, currency, amount and order binding',()=>{assert.equal(isPaid(paid,order),true);for(const mutate of [d=>d.status='APPROVED',d=>d.id='other',d=>d.purchase_units[0].reference_id='other',d=>d.purchase_units[0].payments.captures[0].status='PENDING',d=>d.purchase_units[0].payments.captures[0].amount.value='3.49',d=>d.purchase_units[0].payments.captures[0].amount.currency_code='USD',d=>d.purchase_units.push(d.purchase_units[0])]){const d=structuredClone(paid);mutate(d);assert.equal(isPaid(d,order),false)}});

test('simple admin password accepts correct input and rejects wrong, short or missing secrets',()=>{
 const env={ADMIN_PASSWORD:'a-unique-admin-password-2026'};
 assert.equal(adminPasswordConfigured(env),true);
 assert.equal(verifyAdminPassword(env.ADMIN_PASSWORD,env),true);
 assert.equal(verifyAdminPassword('wrong-password',env),false);
 assert.equal(verifyAdminPassword(undefined,env),false);
 assert.equal(verifyAdminPassword('short',{ADMIN_PASSWORD:'short'}),false);
 assert.equal(adminPasswordConfigured({}),false);
});
test('existing admin hash takes priority and malformed hash fails closed',()=>{
 const hashed='the-hashed-password-2026',plain='the-other-password-2026';
 const env={ADMIN_PASSWORD:plain,ADMIN_PASSWORD_HASH:hashPassword(hashed)};
 assert.equal(verifyAdminPassword(hashed,env),true);
 assert.equal(verifyAdminPassword(plain,env),false);
 assert.equal(verifyAdminPassword(plain,{...env,ADMIN_PASSWORD_HASH:'invalid'}),false);
});
test('changing the environment password refreshes the derived hash',()=>{
 assert.equal(verifyAdminPassword('first-password-2026',{ADMIN_PASSWORD:'first-password-2026'}),true);
 assert.equal(verifyAdminPassword('first-password-2026',{ADMIN_PASSWORD:'second-password-2026'}),false);
 assert.equal(verifyAdminPassword('second-password-2026',{ADMIN_PASSWORD:'second-password-2026'}),true);
});
