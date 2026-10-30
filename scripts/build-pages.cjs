const fs=require('node:fs'),path=require('node:path');
const out='pages-site',base='/lishilu-portfolio/';fs.rmSync(out,{recursive:true,force:true});fs.cpSync('dist',out,{recursive:true});
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(html|js|css)$/.test(e.name)){let s=fs.readFileSync(p,'utf8');s=s.replace(/(["'`(])\/(assets|scrolls|published\.json)/g,'$1'+base+'$2');if(e.name==='index.html'&&dir===out)s=s.replace('<head>','<head><script src="pages-runtime.js"></script>');fs.writeFileSync(p,s);}}}walk(out);
fs.copyFileSync('scripts/pages-runtime.js',out+'/pages-runtime.js');fs.writeFileSync(out+'/.nojekyll','');
