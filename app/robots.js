import {siteOrigin} from '../lib/seo.mjs';
export default function robots(){return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/admin']},sitemap:siteOrigin()+'/sitemap.xml'}}
