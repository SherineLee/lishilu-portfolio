'use strict';

const WY_STEPS = [
  {
    image: 'original',
    title: '上传一张随手拍',
    copy: '保留原图，再决定是否精修。没有素材时，可以直接载入格纹发圈。',
    checks: ['原图不覆盖', '可载入示例']
  },
  {
    image: 'refined',
    title: '先核对商品，再继续',
    copy: '放大对比原图，检查款式、纹样和主色。精修不合适，就保留原图。',
    checks: ['细节对照', '可保留原图']
  },
  {
    image: 'reference',
    title: '用参考图确定场景',
    copy: '提取风格、配色和光照。描述可以修改，确认后再生成。',
    checks: ['描述可编辑', '参考与成片可切换']
  },
  {
    image: 'result',
    title: '逐版修改，检查后导出',
    copy: '选择问题或写下想法，确认修改说明再生成。旧版本随时可以回看。',
    checks: ['修改有方向', '版本可回退']
  }
];

const WY_METRICS = [
  ['商品一致性', '文字、纹样、轮廓等关键项，错一个就退回。'],
  ['改稿遵循率', '既要改到位，也不能误改其他区域。'],
  ['任务完成率', '在限定时间和预算内，得到至少一张愿意采用的图。'],
  ['完整任务耗时', '把等待、修边、检查和返工都算进去。'],
  ['可用图成本', '全部生成费用 ÷ 最终被采用的图片数。']
];

const WY_ISSUES = [
  {
    title: '透明背景丢失',
    problem: '真实戒指照片保存后，透明通道消失。',
    action: '拆开 RGB 解码与遮罩合成，增加透明区域检查。',
    result: '重跑抠图与生成，并补了对应回归测试。'
  },
  {
    title: '指令没有执行',
    problem: '要求移除布料，返回图片却仍保留布料。',
    action: '保留失败版本，不再把“接口返回图片”当作完成。',
    result: '将指令、模型和编辑范围放进同批用例复测。'
  }
];

function commerceCase() {
  return `<article class="wy-case" aria-labelledby="wy-title">
    <section class="wy-hero">
      <div class="wy-hero-head">
        <div>
          <p class="wy-kicker">AI PRODUCT · PERSONAL PROJECT</p>
          <div class="wy-title-line"><h1 id="wy-title">物映</h1><span>小物件商品图改稿助手</span></div>
        </div>
        <a class="wy-button wy-primary" href="wuying/demo/?demo=1" target="_blank" rel="noopener">体验示例 <span aria-hidden="true">↗</span></a>
      </div>
      <p class="wy-lead">从一张随手拍开始，先确认商品没被改坏，再生成场景、逐版调整。</p>
      <p class="wy-meta">产品规划 · 交互设计 · 可运行原型</p>
      <div class="wy-compare" aria-label="商品原图与场景成片对比">
        <figure><img src="wuying/assets/original.webp" alt="手持格纹发圈的原始照片"><figcaption><b>01</b> 随手拍</figcaption></figure>
        <span class="wy-compare-arrow" aria-hidden="true">→</span>
        <figure><img src="wuying/assets/result.webp" alt="格纹发圈放在木桌上的预置场景成片"><figcaption><b>02</b> 场景成片</figcaption></figure>
      </div>
      <p class="wy-note">示例精修与成片为预置素材。</p>
    </section>

    <nav class="wy-chapter-nav" aria-label="案例章节">
      <button data-wy-scroll="wy-scenario">01 需求</button>
      <button data-wy-scroll="wy-process">02 流程</button>
      <button data-wy-scroll="wy-evaluation">03 评测与迭代</button>
    </nav>

    <section class="wy-section" id="wy-scenario">
      <div class="wy-section-head"><span>01 / 需求</span><h2>先保住商品，再谈氛围</h2><p>面向自己拍图、自己上新的小商家。真正让图片无法使用的，往往不是背景不够漂亮。</p></div>
      <div class="wy-pains">
        <article><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 7h22v18H5zM8 21l6-7 5 5 3-4 3 6M11 12h.01"/></svg><h3>商品变了</h3><p>刻字、纹样、细链容易失真。</p><strong>精修后先核对细节</strong></article>
        <article><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 6h20v15H14l-6 5v-5H6zM11 12h10M11 16h6"/></svg><h3>说不清怎么改</h3><p>只知道“太乱”“不好看”。</p><strong>把感受变成可选修改</strong></article>
        <article><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 8h22v17H5zM8 21l7-8 5 5 3-3 2 6M11 12h.01"/></svg><h3>没有合适素材</h3><p>手部、杂物、色偏一起入镜。</p><strong>从精修和参考图开始</strong></article>
      </div>
      <p class="wy-note">这些判断来自项目拆解，仍需真实商家访谈验证。</p>
    </section>

    <section class="wy-section" id="wy-process">
      <div class="wy-section-head"><span>02 / 流程</span><h2>四步完成一张图</h2><p>每一步都有可见结果，也都有回退的余地。</p></div>
      <div class="wy-process-tabs" role="tablist" aria-label="产品操作流程">
        <button class="is-active" role="tab" aria-selected="true" data-wy-step="0"><b>1</b><span>上传商品</span></button>
        <button role="tab" aria-selected="false" data-wy-step="1"><b>2</b><span>精修确认</span></button>
        <button role="tab" aria-selected="false" data-wy-step="2"><b>3</b><span>生成场景</span></button>
        <button role="tab" aria-selected="false" data-wy-step="3"><b>4</b><span>调整导出</span></button>
      </div>
      <div class="wy-walkthrough">
        <div class="wy-visual">
          <img id="wy-step-image" src="wuying/assets/original.webp" alt="手持格纹发圈的原始照片">
          <div class="wy-visual-tools" id="wy-visual-tools"></div>
        </div>
        <div class="wy-step-info" aria-live="polite">
          <span class="wy-step-number" id="wy-step-number">STEP 01</span>
          <h3 id="wy-step-title"></h3>
          <p id="wy-step-copy"></p>
          <div class="wy-checks" id="wy-step-checks"></div>
          <button class="wy-button" id="wy-next-step">下一步 <span aria-hidden="true">→</span></button>
        </div>
      </div>
      <div class="wy-role-strip"><span><b>AI</b> 精修、场景与改稿</span><span><b>程序</b> 保存版本、合成与导出</span><span><b>用户</b> 核对商品、确认结果</span></div>
      <p class="wy-note">真实上传、精修、生成与下载已分别跑通；上图发圈精修与成片为预置素材。</p>
    </section>

    <section class="wy-section" id="wy-evaluation">
      <div class="wy-section-head"><span>03 / 评测与迭代</span><h2>先定义什么不能用</h2><p>接下来用 30 个真实任务检验。商品细节错了，场景再好看也不通过。</p></div>
      <div class="wy-metrics" role="tablist" aria-label="评测指标">
        <button class="is-active" role="tab" aria-selected="true" data-wy-metric="0"><b>01</b><span>商品一致性</span></button>
        <button role="tab" aria-selected="false" data-wy-metric="1"><b>02</b><span>改稿遵循率</span></button>
        <button role="tab" aria-selected="false" data-wy-metric="2"><b>03</b><span>任务完成率</span></button>
        <button role="tab" aria-selected="false" data-wy-metric="3"><b>04</b><span>完整任务耗时</span></button>
        <button role="tab" aria-selected="false" data-wy-metric="4"><b>05</b><span>可用图成本</span></button>
      </div>
      <div class="wy-metric-detail" aria-live="polite"><span>怎么判断</span><p id="wy-metric-copy"></p></div>
      <label class="wy-gate"><input type="checkbox" id="wy-detail-error" checked><span>发现标签文字或纹样不一致</span><strong id="wy-verdict">退回修改</strong></label>

      <div class="wy-subhead"><h3>失败案例怎么回来</h3><p>不直接拿反馈训练，先复核，再复测。</p></div>
      <ol class="wy-loop">
        <li><b>01</b><span>收集失败</span><small>原图 · 版本 · 反馈</small></li>
        <li><b>02</b><span>人工归因</span><small>区分失真与误改</small></li>
        <li><b>03</b><span>加入回归集</span><small>固定输入与标准</small></li>
        <li><b>04</b><span>同批复测</span><small>看改善，也看退化</small></li>
      </ol>

      <div class="wy-subhead"><h3>两个已经遇到的问题</h3></div>
      <div class="wy-issue-tabs" role="tablist" aria-label="真实问题案例">
        <button class="is-active" role="tab" aria-selected="true" data-wy-issue="0">透明背景丢失</button>
        <button role="tab" aria-selected="false" data-wy-issue="1">指令没有执行</button>
      </div>
      <div class="wy-issue" aria-live="polite">
        <div><span>现象</span><p id="wy-issue-problem"></p></div>
        <div><span>处理</span><p id="wy-issue-action"></p></div>
        <div><span>回流</span><p id="wy-issue-result"></p></div>
      </div>
      <p class="wy-note">30 个任务、商家独立完成情况和实际成本，仍待验证。</p>
    </section>

    <footer class="wy-case-footer"><a href="#design">← 返回项目展示</a><a class="wy-button wy-primary" href="wuying/demo/?demo=1" target="_blank" rel="noopener">打开发圈示例 ↗</a></footer>
  </article>`;
}

function initWuyingCase() {
  const root = document.querySelector('.wy-case');
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const $$ = selector => [...root.querySelectorAll(selector)];
  const select = (attribute, index) => $$(`[${attribute}]`).forEach(button => {
    const active = Number(button.getAttribute(attribute)) === index;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });
  let step = 0;

  function renderStep(index) {
    step = index;
    const item = WY_STEPS[index];
    select('data-wy-step', index);
    const image = $('#wy-step-image');
    image.src = `wuying/assets/${item.image}.webp`;
    image.alt = {original: '手持格纹发圈的原始照片', refined: '白底格纹发圈预置精修图', reference: '粉色与灰绿色家居风格参考图', result: '格纹发圈预置场景成片'}[item.image];
    $('#wy-step-number').textContent = `STEP 0${index + 1}`;
    $('#wy-step-title').textContent = item.title;
    $('#wy-step-copy').textContent = item.copy;
    $('#wy-step-checks').innerHTML = item.checks.map(text => `<span>✓ ${text}</span>`).join('');
    $('#wy-next-step').innerHTML = index === 3 ? '回到第一步 <span aria-hidden="true">↺</span>' : '下一步 <span aria-hidden="true">→</span>';
    $('#wy-visual-tools').innerHTML = index === 2 ? '<button class="is-active" data-wy-image="reference">参考图</button><button data-wy-image="result">示例成片</button>' : '';
    $$('[data-wy-image]').forEach(button => button.addEventListener('click', () => {
      image.src = `wuying/assets/${button.dataset.wyImage}.webp`;
      image.alt = button.dataset.wyImage === 'reference' ? '粉色与灰绿色家居风格参考图' : '格纹发圈预置场景成片';
      $$('[data-wy-image]').forEach(other => other.classList.toggle('is-active', other === button));
    }));
  }

  function renderMetric(index) {
    select('data-wy-metric', index);
    $('#wy-metric-copy').textContent = WY_METRICS[index][1];
  }

  function renderIssue(index) {
    select('data-wy-issue', index);
    const item = WY_ISSUES[index];
    $('#wy-issue-problem').textContent = item.problem;
    $('#wy-issue-action').textContent = item.action;
    $('#wy-issue-result').textContent = item.result;
  }

  $$('[data-wy-step]').forEach(button => button.addEventListener('click', () => renderStep(Number(button.dataset.wyStep))));
  $$('[data-wy-metric]').forEach(button => button.addEventListener('click', () => renderMetric(Number(button.dataset.wyMetric))));
  $$('[data-wy-issue]').forEach(button => button.addEventListener('click', () => renderIssue(Number(button.dataset.wyIssue))));
  $$('[data-wy-scroll]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.wyScroll)?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'})));
  $('#wy-next-step').addEventListener('click', () => renderStep((step + 1) % WY_STEPS.length));
  $('#wy-detail-error').addEventListener('change', event => {
    $('#wy-verdict').textContent = event.target.checked ? '退回修改' : '继续检查其他项';
    $('#wy-verdict').classList.toggle('is-pass', !event.target.checked);
  });
  $$('[role="tablist"]').forEach(list => list.addEventListener('keydown', event => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  }));
  renderStep(0);
  renderMetric(0);
  renderIssue(0);
}
