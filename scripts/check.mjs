import {existsSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
for (const file of ['dist/index.html','dist/styles.css','dist/app.js','dist/content.js','dist/published.json','dist/assets/cabin-internship-art.jpg','dist/assets/portrait.png','dist/assets/pdfjs/pdf.min.mjs','dist/assets/pdfjs/pdf.worker.min.mjs']) {
  if(!existsSync(file))throw new Error(`Missing required file: ${file}`);
}
for(const file of ['dist/app.js','dist/content.js','dist/avatar-chat.js','dist/draft-editor.js','api/chat.js','api/editor/auth.js','api/editor/publish.js','api/editor/pdf.js','server/pdf-publish.cjs','server/editor.cjs','dist/pdf-range.js','dist/published-content.js','dist/editor-publisher.js'])execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
const source=readFileSync('dist/app.js','utf8')+readFileSync('dist/content.js','utf8');
const refs=new Set([...source.matchAll(/["']([a-z][a-z0-9-]*\.(?:png|webp|json|md))["']/g)].map(m=>m[1]));
for(const ref of refs)if(!existsSync(`dist/assets/${ref}`))throw new Error(`Missing asset: ${ref}`);
console.log(`Portfolio checked: JS syntax and ${refs.size} local asset references.`);
