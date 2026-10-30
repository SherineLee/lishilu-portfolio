'use strict';
/* 公开交互示例：忠实还原原工具的流程与状态机。
   所有「生成/精修」均为预置结果，不调用任何后端或 AI 服务。 */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const ASSET = { original: '../assets/original.webp', refined: '../assets/refined.webp', reference: '../assets/reference.webp', result: '../assets/result.webp' };

const STYLE_TAGS = ['柔和家居', '粉米色调', '自然光照', '绿植点缀', '浅色织物'];
const STYLE_SCENE = '浅色木桌上，柔和自然光，绿植点缀的家居氛围';

let stage = 0;              // 0=初始空白  1=已载入示例(原始图)  2=精修预览  3=已生成成片
let useRefined = false;
let showResults = false;
let instruction = '';
let ratio = '3:4';
let toastTimer;

function say(t) {
  $('#toast').textContent = t;
  $('#toast').style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').style.display = 'none', 6000);
}

function setStep(n) {
  $$('.steps .step').forEach((el, i) => el.classList.toggle('active', i === n));
}

function drawStyle() {
  $('#analysis').innerHTML = STYLE_TAGS.map(t => `<span class="style-tag">${t}</span>`).join('') + `<p>${STYLE_SCENE}</p>`;
}

function render() {
  const isSetup = !showResults;
  $('#workspace').classList.toggle('is-setup', isSetup);
  $('#workspace').classList.toggle('is-result', showResults);

  const loaded = stage >= 1;
  // 商品图片区
  $('#cutoutStatus').textContent = !loaded ? '等待上传' : (stage >= 2 ? '已精修' : '已上传');
  $('#thumb').innerHTML = loaded
    ? `<img alt="当前商品图层" src="${useRefined && stage >= 2 ? ASSET.refined : ASSET.original}" style="width:100%;height:100%;object-fit:contain;background:transparent">`
    : '<span class="upload-placeholder"><span class="upload-plus">＋</span>上传商品图片</span>';
  $('#filename').textContent = loaded ? '格纹发圈（示例）' : 'PNG 或 JPEG';
  $('#originalSetup').disabled = !loaded;
  $('#retouchBtn').disabled = !loaded || stage >= 2;
  $('#retouchBtn').textContent = stage >= 2 ? '精修示例已展示' : '精修商品';
  $('#confirmMask').disabled = !loaded;
  $('#confirmMask').checked = stage >= 2;
  $('#confirmBtn').disabled = !(loaded && stage >= 2);

  // 精修预览面板
  $('#retouchPanel').classList.toggle('hidden', stage < 2);
  if (stage >= 2) $('#retouchedPreview').src = ASSET.refined;

  // 参考图区
  const hasRef = stage >= 2;
  $('#refState').textContent = hasRef ? '已识别' : '上传后自动识别';
  $('#refPreview').innerHTML = hasRef
    ? `<img alt="风格参考图" src="${ASSET.reference}" style="width:100%;height:100%;object-fit:contain">`
    : '<span class="upload-placeholder"><span class="upload-plus">＋</span>上传喜欢的图片</span>';
  $('#refName').textContent = hasRef ? '参考图片的配色、材质和场景' : '参考图片的配色、材质和场景';
  $('#analyzeBtn').disabled = !hasRef;
  if (hasRef) drawStyle(); else $('#analysis').innerHTML = '';
  if (!$('#background').value) $('#background').value = hasRef ? STYLE_SCENE : '';

  // 生成按钮
  const canGenerate = stage >= 2 && !!$('#background').value.trim();
  $('#generate').disabled = !canGenerate;
  $('#generate').textContent = showResults ? '重新生成' : (stage >= 3 ? '查看示例成片' : '生成宣传图');
  $('#formHint').textContent = !loaded ? '上传两张图片，确认商品后即可生成。' : (stage < 2 ? '查看精修示例，确认商品。' : '确认商品和画面描述后，即可生成。');

  // 画布
  $('#projectTitle').textContent = !loaded ? '先放入你的商品' : (showResults ? '格纹发圈' : '格纹发圈');
  $('#emptyArt').classList.toggle('hidden', showResults);
  $('#result').classList.toggle('hidden', !showResults);
  if (showResults) {
    $('#result').src = ASSET.result;
    $('#art').style.aspectRatio = ratio === '1:1' ? '1/1' : '3/4';
    $('#artTitle').textContent = $('#titleInput').value || '';
  }
  $('#originalBtn').disabled = !loaded;
  $('#selectRegion').disabled = !showResults;

  // 右侧调整
  const canRevise = showResults;
  $$('#options button').forEach(b => b.disabled = !canRevise);
  $('#feedback').disabled = !canRevise;
  $('#interpretBtn').disabled = !canRevise;
  $('#revise').disabled = !canRevise || !instruction;
  $('#checkBtn').disabled = !canRevise;
  $('#exportBtn').classList.toggle('hidden', !canRevise);

  // 步骤条
  setStep(showResults ? 3 : (stage >= 2 ? 2 : (stage >= 1 ? 1 : 0)));
}

// 体验示例：载入预置发圈
$('#demoBtn').addEventListener('click', () => {
  if (stage === 0) {
    stage = 1;
    $('#demoNotice').classList.remove('hidden');
    say('示例已准备好，先查看商品精修');
  }
  // 强化引导：直接推进到精修预览
  stage = 2;
  useRefined = true;
  render();
  say('这是预置精修图，请核对颜色、纹样和文字');
});

// 上传按钮（公开示例：不能真上传，点击提示用体验示例）
$('#uploadBtn').addEventListener('click', () => {
  say('公开示例不支持上传，请点「体验示例」查看预置流程');
});
$('#refBtn').addEventListener('click', () => {
  say('公开示例不支持上传，请点「体验示例」查看预置流程');
});

// 精修商品
$('#retouchBtn').addEventListener('click', () => {
  stage = 2;
  useRefined = true;
  render();
  say('精修示例已展示，请与原图对照确认');
});

// 放大对比
$('#compareRetouch').addEventListener('click', () => {
  say('原图与精修图对比：请核对颜色、形状、纹样和标签文字');
});

// 使用精修 / 保留原图
$('#acceptRetouch').addEventListener('click', () => { useRefined = true; render(); say('已使用精修图'); });
$('#keepOriginal').addEventListener('click', () => { useRefined = false; render(); say('已保留原图'); });

// 确认商品
$('#confirmBtn').addEventListener('click', () => { render(); say('商品已确认'); });

// 识别参考图
$('#analyzeBtn').addEventListener('click', () => { drawStyle(); say('已提取画面描述，可以继续修改'); });

// 比例
$('#ratios').addEventListener('click', e => {
  const b = e.target.closest('[data-ratio]');
  if (!b) return;
  ratio = b.dataset.ratio;
  $$('#ratios button').forEach(x => x.classList.toggle('selected', x === b));
  if (showResults) $('#art').style.aspectRatio = ratio === '1:1' ? '1/1' : '3/4';
});

// 生成宣传图（预置成片）
$('#generate').addEventListener('click', () => {
  showResults = true;
  $('#jobStatus').classList.remove('hidden');
  $('#jobStatus').textContent = '正在生成…';
  setTimeout(() => {
    $('#jobStatus').textContent = '图片已保存';
    setTimeout(() => $('#jobStatus').classList.add('hidden'), 2000);
  }, 900);
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
  say('示例成片已生成，可在右侧调整或直接下载');
});

// 右侧调整选项
$('#options').addEventListener('click', e => {
  const b = e.target.closest('[data-edit]');
  if (!b) return;
  instruction = b.dataset.edit;
  $$('#options button').forEach(x => x.classList.toggle('selected', x === b));
  $('#editSummary').textContent = instruction;
  $('#revise').disabled = false;
});

// AI 帮我说明白
$('#interpretBtn').addEventListener('click', () => {
  const v = $('#feedback').value.trim();
  if (!v) { say('请先说说想改哪里'); return; }
  instruction = '按你的描述调整背景，保持商品不变。';
  $('#editSummary').textContent = '已理解：' + v + '。公开示例不会重新生成图片。';
  $('#revise').disabled = false;
  say('公开示例不会重新生成，这里展示「说明白」的流程');
});

// 确认调整
$('#revise').addEventListener('click', () => {
  say('改稿已保存，原版本仍可查看（公开示例使用预置结果）');
});

// AI 辅助检查
$('#checkBtn').addEventListener('click', () => {
  $('#checkResult').textContent = '检查建议\n• 商品主色、纹样与原图一致\n• 边缘完整，无缺失\n• 背景氛围符合参考图';
  say('辅助检查完成，请对照原图人工确认');
});

// 三项检查
$$('[data-check]').forEach(c => c.addEventListener('change', () => {
  const all = $$('[data-check]').every(x => x.checked);
  $('#exportBtn').classList.toggle('is-ready', all);
  $('#checksHint').textContent = all ? '检查完成，可以下载。' : '完成三项检查后可下载。';
}));

// 查看原图
$('#originalBtn').addEventListener('click', () => { say('商品原图：手持格纹发圈，请放大核对纹样、连接处和边缘'); });
$('#originalSetup').addEventListener('click', () => { say('商品原图：手持格纹发圈'); });

// 初始渲染
render();
