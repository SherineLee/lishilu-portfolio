'use strict';
(()=>{
let busy=false;let session=0;let history=[];
window.addEventListener('hashchange',()=>{session++;history=[];busy=false;});
function message(role,text){const log=document.querySelector('#avatar-chat');if(!log)return;const el=document.createElement('div');el.className='avatar-message '+role;const p=document.createElement('p');p.textContent=text;el.append(p);log.append(el);log.scrollTop=log.scrollHeight;return el;}
async function send(question){if(busy)return;const input=document.querySelector('#avatar-input');if(!input||!question.trim())return;const form=document.querySelector('#avatar-form');if(form.closest('body.draft-active:not(.draft-preview)')){document.querySelector('#avatar-status').textContent='请先点击“预览草稿”，再试用对话。';return;}
const current=++session;busy=true;const button=document.querySelector('#avatar-send');const status=document.querySelector('#avatar-status');input.value='';input.disabled=true;button.disabled=true;document.querySelectorAll('[data-avatar-question]').forEach(b=>b.disabled=true);message('user',question);status.textContent='让我想想…';const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),55000);
try{const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,history:history.slice(-6)}),signal:controller.signal});const data=await res.json();if(current!==session)return;if(!res.ok)throw Error(data.error||'暂时无法回答，请稍后重试。');message('assistant',data.answer);history.push({role:'user',content:question},{role:'assistant',content:data.answer});status.textContent='';}
catch(error){if(current!==session)return;status.textContent=error.name==='AbortError'?'这次查询耗时较长，请稍后重试。':error.message;input.value=question;}
finally{clearTimeout(timer);if(current===session){busy=false;input.disabled=false;button.disabled=false;document.querySelectorAll('[data-avatar-question]').forEach(b=>b.disabled=false);input.focus({preventScroll:true});}}}
document.addEventListener('submit',e=>{if(e.target.id!=='avatar-form')return;e.preventDefault();send(document.querySelector('#avatar-input').value.trim());});
document.addEventListener('click',e=>{if(e.target.closest('[data-self-chat]')){const input=document.querySelector('#avatar-input');input?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});input?.focus({preventScroll:true});return;}const b=e.target.closest('[data-avatar-question]');if(b)send(b.dataset.avatarQuestion);});
document.addEventListener('keydown',e=>{if(e.target.id==='avatar-input'&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();e.target.form.requestSubmit();}});
})();

// A small pointer response; no simulated model connectivity or biometric claims.
document.addEventListener('pointermove',e=>{const stage=e.target.closest('.self-character');if(!stage||e.pointerType==='touch'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=stage.getBoundingClientRect();stage.style.setProperty('--self-x',((e.clientX-r.left)/r.width-.5)*10+'px');stage.style.setProperty('--self-y',((e.clientY-r.top)/r.height-.5)*6+'px');});
document.addEventListener('pointerout',e=>{const stage=e.target.closest('.self-character');if(stage&&!stage.contains(e.relatedTarget)){stage.style.setProperty('--self-x','0px');stage.style.setProperty('--self-y','0px');}});
