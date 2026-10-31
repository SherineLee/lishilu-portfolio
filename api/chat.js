'use strict';
const fs=require('node:fs'),path=require('node:path');
const dir=fs.existsSync(path.join(__dirname,'knowledge'))?path.join(__dirname,'knowledge'):path.join(process.cwd(),'api/knowledge');
module.exports=require('./avatar-handler.cjs')({supplement:fs.readFileSync(path.join(dir,'shilu.md'),'utf8'),aigc:fs.readFileSync(path.join(dir,'aigc.md'),'utf8')});
