import {readFile, writeFile, mkdir} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path,root),'utf8');
const assets = {};
for (const [path,file,type] of [
  ['/','index.html','text/html'],['/app.js','app.js','text/javascript'],
  ['/style.css','style.css','text/css'],['/admin','admin.html','text/html'],
  ['/admin.js','admin.js','text/javascript'],['/schema.js','schema.js','text/javascript']
]) {
  assets[path] = [await read('handbook-source/web/'+file),type];
}
assets['/logo.png'] = [(await readFile(new URL('handbook-source/web/logo.png',root))).toString('base64'),'image/png',true];
const seed = (await read('handbook-source/web/data.js')).trim().replace(/^const DATA=/,'').replace(/;$/,'');
JSON.parse(seed);
const code = [
  await read('handbook-source/web/schema.js'),
  'const assets = '+JSON.stringify(assets)+';',
  'const seed = '+seed+';',
  await read('handbook-source/worker/password.js'),
  (await read('handbook-source/worker/index.js')).replace('export default {','const handbook = {'),
  'export async function onRequest({request,env}) { return handbook.fetch(request,env); }'
].join('\n');
await mkdir(new URL('functions/handbook/',root),{recursive:true});
await writeFile(new URL('functions/handbook/[[path]].js',root),code);
