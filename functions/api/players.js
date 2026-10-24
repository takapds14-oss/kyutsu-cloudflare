import {json,fetchCSV,sheetRowsToPlayers} from './_shared.js';
export async function onRequestGet({env}){
 try {return json(sheetRowsToPlayers(await fetchCSV(env.GOOGLE_PLAYERS_SHEET_CSV_URL)),200,300)}
 catch(e){console.error('players:',e);return json({error:'選手名鑑の読み込みに失敗しました'},503,0)}
}
