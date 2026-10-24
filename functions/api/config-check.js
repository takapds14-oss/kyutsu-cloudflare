import {json} from './_shared.js';
export function onRequestGet({env}){
 return json({resultsSheetConfigured:!!env.GOOGLE_SHEET_CSV_URL,playersSheetConfigured:!!env.GOOGLE_PLAYERS_SHEET_CSV_URL,web3FormsConfigured:!!env.WEB3FORMS_ACCESS_KEY,platform:'cloudflare-pages'},200,0);
}
