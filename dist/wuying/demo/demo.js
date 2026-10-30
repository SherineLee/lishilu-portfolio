'use strict';
const demoSteps = [
  {image: 'original', label: '原始照片', title: '从一张随手拍开始', copy: '原图会保留。后续精修如果不像原来的商品，可以随时退回来。', detail: '格纹、颜色、轮廓', action: '查看精修示例 →'},
  {image: 'refined', label: '预置精修图', title: '先确认还是同一件商品', copy: '对照格纹、颜色和轮廓。这里使用预置精修图，便于直接查看后续流程。', detail: '不像，就保留原图', action: '使用精修示例，继续 →'},
  {image: 'reference', label: '风格参考图', title: '用参考图说明想要的场景', copy: '参考图用来确认风格、配色、材质和光照，画面描述仍可修改。', detail: '浅色家居 · 自然光 · 木桌', action: '查看示例成片 →'},
  {image: 'result', label: '预置场景成片', title: '得到场景，再决定改哪里', copy: '选择下面的修改方向，查看它如何被写成具体说明。旧版本应保留，商品细节仍需人工检查。', detail: '商品准确，才进入导出', action: '回到第一步 ↺'}
];
let demoIndex = 0;
const $ = selector => document.querySelector(selector);
function renderDemo(index) {
  demoIndex = index;
  const item = demoSteps[index];
  document.querySelectorAll('[data-demo-step]').forEach((button, i) => {
    button.classList.toggle('is-active', i === index);
    if (i === index) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  const image = $('#demo-image');
  image.src = `../assets/${item.image}.webp`;
  image.alt = {original: '手持格纹发圈的原始照片', refined: '白底格纹发圈预置精修图', reference: '浅色家居风格参考图', result: '格纹发圈预置场景成片'}[item.image];
  $('#demo-image-label').textContent = item.label;
  $('#demo-count').textContent = `0${index + 1} / 04`;
  $('#demo-title').textContent = item.title;
  $('#demo-copy').textContent = item.copy;
  $('#demo-detail p').textContent = item.detail;
  $('#demo-next').textContent = item.action;
  $('#demo-revise').hidden = index !== 3;
  $('#demo-download').hidden = index !== 3;
}
document.querySelectorAll('[data-demo-step]').forEach(button => button.addEventListener('click', () => renderDemo(Number(button.dataset.demoStep))));
document.querySelectorAll('[data-revise]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-revise]').forEach(other => other.classList.toggle('is-selected', other === button));
  $('#demo-revise-copy').textContent = `修改说明：${button.dataset.revise}`;
}));
$('#demo-next').addEventListener('click', () => renderDemo((demoIndex + 1) % demoSteps.length));
renderDemo(0);
