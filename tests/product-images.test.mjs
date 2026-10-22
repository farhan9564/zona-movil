import test from 'node:test';
import assert from 'node:assert/strict';
import {productImages,encodeImages,validImageUrl} from '../lib/product-images.mjs';
const a='https://res.cloudinary.com/demo/image/upload/a.jpg',b='https://res.cloudinary.com/demo/image/upload/b.jpg';
test('legacy single-image products retain their cover',()=>assert.deepEqual(productImages({id:'old',image:a}),{id:'old',image:a,images:[a]}));
test('multiple images round-trip through database text with selected cover',()=>{const saved=encodeImages({images:[b,a]});assert.deepEqual(productImages({image:saved}),{image:b,images:[b,a]})});
test('removing all images does not resurrect old cover',()=>assert.deepEqual(productImages({image:encodeImages({image:a,images:[]})}),{image:'',images:[]}));
test('gallery rejects invalid URLs and excess images',()=>{for(const url of ['javascript:alert(1)','https://res.cloudinary.com.evil.test/a','http://res.cloudinary.com/a','https://user:pass@res.cloudinary.com/a']){assert.equal(validImageUrl(url),false);assert.throws(()=>encodeImages({images:[url]}))}assert.throws(()=>encodeImages({images:Array(11).fill(a)}))});
test('duplicates removed and empty legacy products supported',()=>{assert.deepEqual(productImages({image:encodeImages({images:[a,a]})}).images,[a]);assert.deepEqual(productImages({image:''}).images,[])});
