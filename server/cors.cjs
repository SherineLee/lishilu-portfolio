'use strict';
const ORIGIN='https://sherinelee.github.io';
module.exports=function(req,res){if(req.headers.origin!==ORIGIN)return false;res.setHeader('Access-Control-Allow-Origin',ORIGIN);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');if(req.method==='OPTIONS'){res.status(204).end();return true;}return false;};
