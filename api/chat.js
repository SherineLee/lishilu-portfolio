'use strict';
const crypto = require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const policy=require('./answer-policy.cjs');
const knowledgeDir=fs.existsSync(path.join(__dirname,'knowledge'))?path.join(__dirname,'knowledge'):path.join(process.cwd(),'api/knowledge');
const supplement=fs.readFileSync(path.join(knowledgeDir,'shilu.md'),'utf8');
const aigc=fs.readFileSync(path.join(knowledgeDir,'aigc.md'),'utf8');
const DOC_ID = 'JNkNdRWnCo0awmxLBXEcp6tjnbb';
let tokenCache={token:'',until:0}, docCache={text:'',until:0};
const visitors=new Map();let inFlight=0;
class ServiceError extends Error{constructor(status,message){super(message);this.status=status;}}
async function jsonFetch(url,options={},timeout=12000){let res;try{res=await fetch(url,{...options,signal:AbortSignal.timeout(timeout)});}catch{throw new ServiceError(502,'知识库或模型连接暂时不可用，请稍后重试。');}let data;try{data=await res.json();}catch{throw new ServiceError(502,'问答服务返回异常，请稍后重试。');}if(!res.ok)throw new ServiceError(502,'问答服务暂时不可用，请稍后重试。');return data;}
async function knowledge(){if(docCache.text&&docCache.until>Date.now())return docCache.text;
 if(tokenCache.until<Date.now()){const data=await jsonFetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({app_id:process.env.FEISHU_APP_ID,app_secret:process.env.FEISHU_APP_SECRET})});if(data.code!==0||!data.tenant_access_token)throw new ServiceError(503,'知识库连接尚未就绪，请稍后再来。');tokenCache={token:data.tenant_access_token,until:Date.now()+Math.max(0,(Number(data.expire)||3600)-120)*1000};}
 const id=process.env.FEISHU_DOCUMENT_ID||DOC_ID;
 if(!/^[a-zA-Z0-9]+$/.test(id))throw new ServiceError(503,'知识库配置需要检查。');
 const data=await jsonFetch(`https://open.feishu.cn/open-apis/docx/v1/documents/${id}/raw_content`,{headers:{Authorization:`Bearer ${tokenCache.token}`}});
 if(data.code!==0||typeof data.data?.content!=='string')throw new ServiceError(503,'知识库暂时无法读取，请稍后再来。');
 // Keep raw private documents server-side. Refresh every five minutes.
 docCache={text:data.data.content.slice(0,500000),until:Date.now()+300000};return docCache.text;
}
function chunks(text){const out=[];for(let i=0;i<text.length;i+=550)out.push(text.slice(i,i+750));return out;}
function terms(text){const normalized=text.toLowerCase().replace(/\s/g,'');const set=new Set(normalized.match(/[a-z0-9]{2,}/g)||[]);for(const c of normalized.match(/[\u4e00-\u9fff]+/g)||[])for(let i=0;i<c.length-1;i++)set.add(c.slice(i,i+2));return [...set].filter(t=>!['什么','的是','你有','你的','一个','可以','如何','多少'].includes(t));}
function retrieve(text,question){const query=terms(question);if(!query.length)return [];return chunks(text).map((content,index)=>({content,index,score:query.reduce((n,t)=>n+(content.toLowerCase().includes(t)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,6).sort((a,b)=>a.index-b.index).map(x=>x.content);}
function allowed(req){const origin=req.headers.origin;return (origin==='https://lishilu-portfolio.vercel.app'||origin==='https://sherinelee.github.io'||origin==='https://lishilu-portfolio.netlify.app'||(!!process.env.URL&&origin===process.env.URL))||/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin||'');}
function throttle(req){const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0];const key=crypto.createHash('sha256').update(ip).digest('hex');const now=Date.now();for(const[k,v]of visitors)if(v.until<now)visitors.delete(k);let value=visitors.get(key)||{count:0,until:now+60000};if(value.count>=8||inFlight>=4||visitors.size>2000)throw new ServiceError(429,'提问有些频繁，请稍等一分钟再试。');value.count++;visitors.set(key,value);}
module.exports=async function handler(req,res){if(require('../server/cors.cjs')(req,res))return;res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'请通过对话框提问。'});}if(!allowed(req))return res.status(403).json({error:'请从作品集网站发起提问。'});
 let active=false;try{
 if(!(process.env.DEEPSEEK_API_KEY||process.env.ARK_API_KEY||process.env.DASHSCOPE_API_KEY))throw new ServiceError(503,'分身正在连接个人知识库，请稍后再来聊聊。');
 if(Number(req.headers['content-length'])>15000)throw new ServiceError(413,'消息过长，请精简后再试。');
 let body=req.body;if(typeof body==='string'){try{body=JSON.parse(body);}catch{throw new ServiceError(400,'消息格式不正确。');}}
 if(!body||typeof body.question!=='string'||!body.question.trim()||body.question.length>600)throw new ServiceError(400,'请输入 1–600 字的问题。');
 const question=body.question.trim();const history=policy.useHistory(question)&&Array.isArray(body.history)?body.history.slice(-6).filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.slice(0,1200)})):[];
 throttle(req);inFlight++;active=true;
 const boundary=policy.preflight(question);if(boundary)return res.status(200).json(boundary);
 if(policy.metricQuestion(question))return res.status(200).json({answer:policy.METRICS,grounded:false});
 const text=process.env.FEISHU_APP_ID&&process.env.FEISHU_APP_SECRET?await knowledge():'';const context=retrieve(supplement,history.filter(m=>m.role==='user').slice(-1).map(m=>m.content).join('\n')+'\n'+question).concat(retrieve(text,question).slice(0,3));
 if(/AIGC|长卷|生图|ComfyUI|生成式|最近.*尝试/i.test(question))context.unshift(aigc);
 if(!context.length)return res.status(200).json({answer:policy.UNKNOWN,grounded:false});
 const useDeepSeek=!!(process.env.DEEPSEEK_API_KEY||process.env.ARK_API_KEY);
 const data=await jsonFetch(useDeepSeek?'https://api.deepseek.com/chat/completions':'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${process.env.DEEPSEEK_API_KEY||process.env.ARK_API_KEY||process.env.DASHSCOPE_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:useDeepSeek?(process.env.DEEPSEEK_MODEL||'deepseek-flash'):(process.env.AVATAR_MODEL||'qwen3-vl-plus'),...(useDeepSeek?{thinking:{type:'disabled'}}:{}),messages:[{role:'system',content:policy.SYSTEM+'参考内容：'+JSON.stringify(context)},...history,{role:'user',content:question}],max_tokens:300,stream:false})},25000);
 const answer=data.choices?.[0]?.message?.content;if(typeof answer!=='string'||!answer.trim())throw new ServiceError(502,'分身暂时没有生成回复，请稍后再试。');return res.status(200).json(policy.finish(answer,question));
 }catch(error){return res.status(error.status||500).json({error:error instanceof ServiceError?error.message:'暂时无法回答，请稍后再试。'});}finally{if(active)inFlight--;}
};
module.exports._test={terms,retrieve,chunks};
