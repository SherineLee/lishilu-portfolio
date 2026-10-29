'use strict';
(()=>{
if(new URLSearchParams(location.search).get('edit')!=='1')return;
const KEY='shilu-portfolio-draft-v1';
let patches={};try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))patches=saved;}catch{}
let undo=[],redo=[],selected=null,preview=false,initial='';
const bar=document.createElement('aside');bar.className='draft-bar';bar.setAttribute('aria-label','草稿编辑工具');bar.innerHTML=`<div class="draft-bar-top"><strong>作品集草稿</strong><span id="draft-status" role="status">保存在当前浏览器</span><button data-draft="preview">预览草稿</button><button data-draft="undo">撤销</button><button data-draft="redo">重做</button><button data-draft="export">导出修改</button><a href="${location.pathname}" target="_blank" rel="noopener">查看正式版 ↗</a></div><div class="draft-bar-bottom"><span id="draft-tip">点击文字直接修改；点击图片或空白选中内容，再删除。</span><button data-draft="image">替换选中图片</button><button data-draft="parent">选择外层内容</button><button data-draft="delete">删除选中内容</button><button data-draft="reset">清空草稿</button></div>`;
document.body.append(bar);document.body.classList.add('draft-active');
const status=bar.querySelector('#draft-status');
function key(){let r=location.hash.slice(1)||'home';return r==='aigc/scroll'?'aigc':r;}
function path(el){const parts=[];while(el&&el!==main){const tag=el.tagName.toLowerCase();let seg=tag+':nth-of-type('+([...el.parentElement.children].filter(x=>x.tagName===el.tagName).indexOf(el)+1)+')';if(el.id==='scroll-content')seg='#scroll-content[data-draft-theme="'+state.scroll+'"]';parts.unshift(seg);el=el.parentElement;}return 'main > '+parts.join(' > ');}
function save(){try{localStorage.setItem(KEY,JSON.stringify(patches));status.textContent='草稿已保存 · '+Object.values(patches).reduce((n,x)=>n+Object.keys(x).length,0)+' 处修改';}catch{status.textContent='保存失败：浏览器存储空间不足，请导出备份';}}
function snapshot(){undo.push(JSON.stringify(patches));if(undo.length>100)undo.shift();redo=[];}
function select(el){selected?.classList.remove('draft-selected');selected=el;selected?.classList.add('draft-selected');bar.querySelector('#draft-tip').textContent=el?'已选中：'+(el.tagName.toLowerCase())+' · '+(el.textContent||el.querySelector('img')?.alt||'图片').trim().slice(0,38):'点击文字直接修改；点击图片选中内容。';}
function render(){select(null);const sc=document.querySelector('#scroll-content');if(sc)sc.dataset.draftTheme=state.scroll;
 for(const [selector,change]of Object.entries(patches[key()]||{})){try{const el=document.querySelector(selector);if(!el||!main.contains(el))continue;if(typeof change.image==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(change.image)){const img=el.tagName==='IMG'?el:el.querySelector('img');if(img){img.src=change.image;img.removeAttribute('srcset');}}if(typeof change.text==='string')el.textContent=change.text;if(change.hidden)el.hidden=true;}catch{}}
 main.querySelectorAll('[contenteditable]').forEach(el=>el.removeAttribute('contenteditable'));
 if(!preview){const nodes=[...main.querySelectorAll('h1,h2,h3,p,figcaption,li,dt,dd,time,.timeline-name,.tag,.role,.file-name,.module-card h2,.module-card p,.scroll-caption > span')].filter(el=>!el.matches('.plain-timeline > li'));for(const el of nodes){if(el.closest('[hidden]')||nodes.some(other=>other!==el&&other.contains(el))||el.querySelector('button,a,img,input,select,canvas'))continue;el.setAttribute('contenteditable','plaintext-only');el.setAttribute('spellcheck','false');}}
 document.body.classList.toggle('draft-preview',preview);bar.querySelector('[data-draft="preview"]').textContent=preview?'继续编辑':'预览草稿';bar.querySelector('[data-draft="undo"]').disabled=!undo.length;bar.querySelector('[data-draft="redo"]').disabled=!redo.length;
}
function refresh(){route(true);}
main.addEventListener('focusin',e=>{if(e.target.isContentEditable){initial=e.target.textContent;select(e.target);}});
main.addEventListener('focusout',e=>{const el=e.target;if(!el.isContentEditable||el.textContent===initial)return;snapshot();const selector=path(el);patches[key()]||={};patches[key()][selector]={...patches[key()][selector],text:el.textContent};save();bar.querySelector('[data-draft="undo"]').disabled=false;});
main.addEventListener('paste',e=>{if(e.target.isContentEditable){e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));}});
document.addEventListener('click',e=>{if(preview||!main.contains(e.target))return;const editable=e.target.closest('[contenteditable]');if(editable){if(e.target.closest('a'))e.preventDefault();e.stopImmediatePropagation();return;}if(e.target.closest('a,button,input,select,textarea'))return;const el=e.target.closest('figure,p,h1,h2,h3,section,article,li,div');if(el&&el!==main){select(el);e.preventDefault();e.stopImmediatePropagation();}},true);
bar.addEventListener('mousedown',e=>{if(e.target.closest('button'))e.preventDefault();});
bar.addEventListener('click',e=>{const action=e.target.closest('[data-draft]')?.dataset.draft;if(!action)return;document.activeElement?.blur();
 if(action==='image'){const img=selected?.tagName==='IMG'?selected:selected?.querySelector('img');if(!img){status.textContent='请先点击要替换的图片';return;}const selector=path(img);const page=key();const picker=document.createElement('input');picker.type='file';picker.accept='image/png,image/jpeg,image/webp';picker.onchange=async()=>{const file=picker.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)){status.textContent='请选择 JPG、PNG 或 WebP 图片';return;}if(file.size>3*1024*1024){status.textContent='请上传小于 3 MB 的图片，以便保存浏览器草稿';return;}try{await createImageBitmap(file).then(b=>b.close());const reader=new FileReader();reader.onload=()=>{snapshot();patches[page]||={};patches[page][selector]={...patches[page][selector],image:reader.result};save();refresh();};reader.readAsDataURL(file);}catch{status.textContent='图片无法读取，请更换文件';}};picker.click();}
 if(action==='preview'){preview=!preview;refresh();}
 if(action==='parent'&&selected&&selected.parentElement!==main){const parent=selected.parentElement;if(main.contains(parent))select(parent);}
 if(action==='delete'&&selected&&!preview){snapshot();const selector=path(selected);patches[key()]||={};patches[key()][selector]={...patches[key()][selector],hidden:true};save();refresh();}
 if(action==='undo'&&undo.length){redo.push(JSON.stringify(patches));patches=JSON.parse(undo.pop());save();refresh();}
 if(action==='redo'&&redo.length){undo.push(JSON.stringify(patches));patches=JSON.parse(redo.pop());save();refresh();}
 if(action==='reset'&&confirm('清空所有页面的本地草稿，恢复已发布内容？此操作仍可撤销。')){snapshot();patches={};save();refresh();}
 if(action==='export'){const blob=new Blob([JSON.stringify({format:'shilu-portfolio-draft',version:1,site:'https://lishilu-portfolio.vercel.app/',exportedAt:new Date().toISOString(),patches},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='作品集修改-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
});
window.addEventListener('beforeunload',()=>document.activeElement?.blur());
window.portfolioDraft={render};save();render();
})();
