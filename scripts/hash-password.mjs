import {hashPassword} from '../lib/security.mjs';const p=process.argv[2];if(!p||p.length<14)throw Error('Use a unique password of at least 14 characters.');console.log(hashPassword(p));
