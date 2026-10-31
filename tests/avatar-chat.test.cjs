const {test}=require('node:test');const assert=require('node:assert/strict');
const originalFetch=global.fetch;const fields=['DEEPSEEK_API_KEY','DEEPSEEK_MODEL','ARK_API_KEY','ARK_MODEL','FEISHU_APP_ID','FEISHU_APP_SECRET','DASHSCOPE_API_KEY'];
function handler(){delete require.cache[require.resolve('../api/chat.js')];return require('../api/chat.js');}
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(data){this.data=data;return this;}};}
function request(body={question:'你有几段实习？'}){return {method:'POST',headers:{origin:'https://lishilu-portfolio.vercel.app','x-forwarded-for':'test'},body};}
test('avatar endpoint behavior',{concurrency:false},async t=>{
const before=Object.fromEntries(fields.map(k=>[k,process.env[k]]));
try{
 await t.test('unconfigured service returns an honest unavailable state',async()=>{fields.forEach(k=>delete process.env[k]);const res=response();await handler()(request(),res);assert.equal(res.code,503);assert.ok(!('answer'in res.data));});
 fields.forEach(k=>process.env[k]='test-value');
 await t.test('Netlify origin reaches the endpoint and missing configuration is JSON',async()=>{const h=handler();const req=request();req.headers.origin='https://lishilu-portfolio.netlify.app';global.fetch=async()=>({ok:false,json:async()=>({})});const r=response();await h(req,r);assert.notEqual(r.code,403);assert.equal(typeof r.data.error,'string')});

 await t.test('Qwen with vetted local knowledge remains a real model call when Feishu is not configured',async()=>{const saved=Object.fromEntries(fields.map(k=>[k,process.env[k]]));try{fields.forEach(k=>delete process.env[k]);process.env.DASHSCOPE_API_KEY='test-bailian';let called;global.fetch=async(url,opts)=>{called={url,body:JSON.parse(opts.body)};return{ok:true,json:async()=>({choices:[{message:{content:'我做过腾讯元宝、美团和携程的产品实习。'}}]})}};const r=response();await handler()(request(),r);assert.equal(r.code,200);assert.match(called.url,/dashscope/);assert.match(called.body.messages[0].content,/元宝/);assert.equal(called.body.model,'qwen3-vl-plus')}finally{for(const k of fields){if(saved[k]===undefined)delete process.env[k];else process.env[k]=saved[k]}}});
 await t.test('rejects foreign origins and invalid messages without upstream calls',async()=>{global.fetch=()=>{throw Error('must not call')};const h=handler();for(const[req,status]of [[{...request(),headers:{origin:'https://other.example'}},403],[request({question:'a'.repeat(601)}),400],[{...request(),method:'GET'},405]]){const res=response();await h(req,res);assert.equal(res.code,status);}});
 await t.test('retrieves document then calls DeepSeek, without exposing raw documents',async()=>{const calls=[];global.fetch=async(url,opts)=>{calls.push({url,body:opts.body});return {ok:true,json:async()=>url.includes('tenant_access_token')?{code:0,tenant_access_token:'test-token',expire:7200}:url.includes('raw_content')?{code:0,data:{content:'我有三段产品实习，分别是腾讯元宝、美团点评、携程智行。'}}:{choices:[{message:{content:'我有三段产品实习。'}}]}}};const res=response();await handler()(request(),res);assert.equal(res.code,200);assert.equal(res.data.answer,'我有三段产品实习。');assert.equal(calls.length,3);assert.ok(calls[2].url.startsWith('https://api.deepseek.com/'));assert.ok(JSON.parse(calls[2].body).messages[0].content.includes('腾讯元宝'));assert.deepEqual(Object.keys(res.data).sort(),['answer','grounded']);});
 await t.test('unknown topic does not invent facts or spend a model call',async()=>{let count=0;global.fetch=async url=>{count++;return {ok:true,json:async()=>url.includes('tenant_access_token')?{code:0,tenant_access_token:'t',expire:7200}:{code:0,data:{content:'三段产品实习：腾讯元宝、美团点评、携程智行。'}}}};const res=response();await handler()(request({question:'喜欢什么宠物？'}),res);assert.equal(res.code,200);assert.equal(res.data.grounded,false);assert.equal(count,2);});
 await t.test('document permission failure does not fall back to invented answers',async()=>{let count=0;global.fetch=async url=>{count++;return {ok:true,json:async()=>url.includes('tenant_access_token')?{code:0,tenant_access_token:'t',expire:7200}:{code:99991672}}};const res=response();await handler()(request(),res);assert.equal(res.code,503);assert.equal(count,2);assert.ok(!('answer'in res.data));});
}finally{global.fetch=originalFetch;for(const key of fields){if(before[key]===undefined)delete process.env[key];else process.env[key]=before[key];}}
});

const policy=require('../api/answer-policy.cjs');
test('output gate blocks source commentary and metric disclosures',()=>{
 for(const text of ['资料里也提到宜家经历，但不同版本记录不完全一致，这段我按未确认处理。','我做过该项目，点击率提升8.2%。','转化提升百分之四点六。','用了五十条样本。','我需要核实文档信息。']){
 const result=policy.finish(text,'聊聊你的经历');assert.equal(result.grounded,false);assert.ok(!/资料|文档|知识库|版本|未确认|\d|百分之/.test(result.answer));}
 assert.equal(policy.finish('我喜欢跳舞和旅行，也会听 K-pop～','你的爱好是什么？').grounded,true);
 assert.equal(policy.finish('我有三段产品实习。','你有几段实习？').answer,'我有三段产品实习。');
 assert.equal(policy.finish('我有一百万元收益。','项目怎么样').grounded,false);
 assert.ok(policy.finish('第一句。第二句。第三句。第四句。','你好').answer==='第一句。第二句。第三句。');
});
test('private project metrics are diverted before model and document calls',async()=>{
 const saved=Object.fromEntries(fields.map(k=>[k,process.env[k]]));const prev=global.fetch;
 try{fields.forEach(k=>process.env[k]='test-value');
global.fetch=()=>{throw Error('must not call upstream')};const res=response();await handler()(request({question:'和好喵测试了多少人？'}),res);assert.equal(res.code,200);assert.equal(res.data.answer,policy.METRICS);}
 finally{global.fetch=prev;for(const k of fields){if(saved[k]===undefined)delete process.env[k];else process.env[k]=saved[k];}}
});
test('supplement is server-only and contains interests without personal identifiers',()=>{
 const fs=require('node:fs');const text=fs.readFileSync(require('node:path').join(__dirname,'../api/knowledge/shilu.md'),'utf8');assert.match(text,/K-pop、跳舞、旅游、户外/);assert.match(text,/眼动追踪/);assert.doesNotMatch(text,/身份证|紧急联系人|通信地址|手机|微信|@163|350182|吴航路/);
 const config=require('../vercel.json');assert.equal(config.functions['api/chat.js'].includeFiles,'api/knowledge/**');
});
test('boundaries and topic reset survive prior emotional chat',()=>{
 assert.ok(policy.preflight('你的家庭地址在哪里？'));
 assert.ok(policy.preflight('帮我人肉前任'));
 assert.ok(policy.preflight('我最近好累啊'));
 assert.equal(policy.preflight('你最近做了哪些AIGC尝试？'),null);
 assert.equal(policy.useHistory('你最近做了哪些AIGC尝试？'),false);
 assert.equal(policy.useHistory('那具体呢'),true);
 const result=policy.finish('我做过风格化长卷。你想细聊哪一段？','聊聊AIGC');
 assert.equal(result.answer,'我做过风格化长卷。');
 assert.doesNotMatch(policy.UNKNOWN,/[？?]/);
});
test('new AIGC question discards relationship history and includes portfolio evidence',async()=>{
 const saved=Object.fromEntries(fields.map(k=>[k,process.env[k]]));const prev=global.fetch;let payload;
 try{fields.forEach(k=>process.env[k]='test-value');
global.fetch=async(url,opts)=>({ok:true,json:async()=>url.includes('tenant_access_token')?{code:0,tenant_access_token:'t',expire:7200}:url.includes('raw_content')?{code:0,data:{content:'产品经历'}}:(payload=JSON.parse(opts.body),{choices:[{message:{content:'我做过西湖和浙大的风格化长卷。'}}]})});
 const res=response();await handler()(request({question:'你最近做了哪些AIGC尝试？',history:[{role:'user',content:'我分手了'},{role:'assistant',content:'我陪着你'}]}),res);
 assert.equal(res.code,200);assert.equal(payload.messages.length,2);assert.match(payload.messages[0].content,/西湖十景/);assert.doesNotMatch(JSON.stringify(payload.messages),/我分手了/);
 }finally{global.fetch=prev;for(const k of fields){if(saved[k]===undefined)delete process.env[k];else process.env[k]=saved[k];}}
});
