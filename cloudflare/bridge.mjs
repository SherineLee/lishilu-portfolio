export async function invokeNode(handler, request) {
  const headers = Object.fromEntries(request.headers);
  const origin = new URL(request.url).origin;
  if (Number(headers['content-length']) > 4800000) return Response.json({error:'图片较大，请压缩后重试。'}, {status:413});
  let body;
  if (!['GET','HEAD','OPTIONS'].includes(request.method)) {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > 4800000) return Response.json({error:'图片较大，请压缩后重试。'}, {status:413});
    try { body = text ? JSON.parse(text) : null; }
    catch { return Response.json({error:'请求格式有误，请刷新后重试。'}, {status:400}); }
  }
  let status=200, payload=null;
  const output = new Headers({'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  const res={setHeader(k,v){if(Array.isArray(v)){output.delete(k);for(const value of v)output.append(k,value)}else output.set(k,String(v));return this},status(n){status=n;return this},json(data){payload=JSON.stringify(data);return this},end(){return this}};
  const req={method:request.method,headers,body,url:request.url,trustedOrigin:headers.origin===origin,socket:{remoteAddress:headers['cf-connecting-ip']||'unknown'}};
  try { await handler(req,res); }
  catch { status=500;payload=JSON.stringify({error:'服务暂时未完成请求，请稍后再试。'}); }
  return new Response(request.method==='HEAD'||[204,304].includes(status)?null:payload,{status,headers:output});
}
