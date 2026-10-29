'use strict';
// Serve PDF.js byte ranges from published, immutable pieces. Never preload the whole document.
(()=>{
const cache=new Map();let cacheBytes=0;
window.pdfRangeSource=async(pdf,lib)=>{
 let offset=0;const parts=pdf.parts.map(p=>{if(!/^assets\/published\/pdf\/[a-f0-9-]{36}\/\d{4}\.bin$/.test(p.path)||!Number.isSafeInteger(p.size)||p.size<=0)throw Error('Invalid PDF part');const item={...p,start:offset};offset+=p.size;return item;});if(offset!==pdf.size)throw Error('Invalid PDF length');
 function read(part){let entry=cache.get(part.path);if(entry){cache.delete(part.path);cache.set(part.path,entry);return entry.promise;}entry={size:part.size,promise:fetch(part.path,{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error('PDF part unavailable');return r.arrayBuffer();}).then(b=>{if(b.byteLength!==part.size)throw Error('Incomplete PDF part');return new Uint8Array(b);}).catch(e=>{if(cache.get(part.path)===entry){cache.delete(part.path);cacheBytes-=entry.size;}throw e;})};cache.set(part.path,entry);cacheBytes+=part.size;while(cacheBytes>24*1024*1024&&cache.size>1){const oldest=cache.keys().next().value;const old=cache.get(oldest);cache.delete(oldest);cacheBytes-=old.size;}return entry.promise;}
 const initial=await read(parts[0]);
 class PieceTransport extends lib.PDFDataRangeTransport{
  constructor(){super(pdf.size,initial.slice(),false,pdf.name);this.stopped=false;}
  requestDataRange(begin,end){if(this.stopped)return;const selected=parts.filter(p=>p.start<end&&p.start+p.size>begin);Promise.all(selected.map(read)).then(data=>{if(this.stopped)return;const out=new Uint8Array(end-begin);selected.forEach((p,i)=>{const from=Math.max(begin,p.start),to=Math.min(end,p.start+p.size);out.set(data[i].subarray(from-p.start,to-p.start),from-begin);});this.onDataRange(begin,out);}).catch(()=>{const el=document.getElementById('pdf-read-status');if(el)el.textContent='当前页加载失败，请刷新重试。';});}
  abort(){this.stopped=true;}
 }
 return {range:new PieceTransport(),length:pdf.size,disableAutoFetch:true,disableStream:true,rangeChunkSize:262144};
};
})();
