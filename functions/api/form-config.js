import {json} from './_shared.js';
export function onRequestGet({env}){
 // Public Web3Forms client key; never expose private tokens or email credentials.
 return json({accessKey:env.WEB3FORMS_ACCESS_KEY||''},200,0);
}
