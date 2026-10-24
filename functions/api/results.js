import {json,fetchCSV,sheetRowsToResults} from './_shared.js';
export async function onRequestGet({env}){
 try {const rows=sheetRowsToResults(await fetchCSV(env.GOOGLE_SHEET_CSV_URL));if(!rows.length)throw Error('no result data');return json(rows,200,300)}
 catch(e){console.error('results:',e);return json({error:'試合結果の読み込みに失敗しました'},503,0)}
}
