'use strict';
(()=>{
let content={revision:'initial',patches:{}};
window.publishedPortfolio={get pdf(){return content.pdf;},get revision(){return content.revision||'initial';},apply(){const page=(location.hash.slice(1)||'home').replace(/^aigc\/scroll$/,'aigc');for(const[selector,p]of Object.entries(content.patches?.[page]||{})){try{const el=document.querySelector(selector);if(!el||!document.querySelector('main').contains(el))continue;if(typeof p.text==='string')el.textContent=p.text;if(p.hidden===true)el.hidden=true;if(typeof p.image==='string'&&/^assets\/published\/[a-f0-9]{64}\.(png|jpg|webp)$/.test(p.image)){const img=el.matches('img')?el:el.querySelector('img');if(img){img.src=p.image;img.removeAttribute('srcset');}}}catch{}}}};
window.publishedReady=fetch('published.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{content=data;window.publishedPortfolio.apply();window.portfolioDraft?.render();window.dispatchEvent(new Event('portfolio-published-ready'));}).catch(()=>{});
})();
