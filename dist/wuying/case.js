'use strict';

const WY_PAINS = [
  {
    tab: '商品细节变了',
    problem: '精修或改图后，文字、纹样、材质和主色可能变化，整张图因此无法交付。',
    choice: '精修与场景分开确认',
    how: '原图保留；精修候选先对比确认，场景阶段再合成确认后的商品。'
  },
  {
    tab: '不知道怎么描述',
    problem: '知道“不好看”，却说不出是背景太杂、对比不足，还是留白不够。',
    choice: '把感受变成可选的修改',
    how: '提供问题选项，自由输入由 AI 转成具体修改说明，确认后再执行。'
  },
  {
    tab: '没有合适素材',
    problem: '随手拍带着手部、杂物和环境色偏，也没有合适的场景图可用。',
    choice: '从精修和参考图开始',
    how: '先处理商品本身，再上传一张背景参考图，由 AI 提取场景风格。'
  }
];

const WY_STEPS = [
  {
    image: 'original',
    title: '从随手拍开始',
    copy: '上传商品照片，原图始终保留。没有素材时，一键载入发圈示例。',
    action: '上传商品 → 选择精修',
    reason: '先解决素材门槛，用户不用从模型参数和提示词开始。',
    checks: ['原图保留', '可载入示例']
  },
  {
    image: 'refined',
    title: '确认精修，再继续',
    copy: '精修去掉环境背景、整理光影与颜色。放大对比原图，检查款式、纹样、主色，再决定用精修图还是保留原图。',
    action: '放大对比 → 使用精修 / 保留原图',
    reason: '把“看着更精致”和“还是不是同一件商品”分开检查，错误不流向后续场景。',
    checks: ['款式与轮廓', '纹样与标签', '商品主色']
  },
  {
    image: 'reference',
    title: '参考图与标签，融合生成',
    copy: '上传一张背景参考图，AI 自动提取风格、配色、材质、光照等提示词标签。标签可增删修改，确认后与整张参考图、上一步的精修商品图一起交给模型，融合生成商品效果图。',
    action: '上传背景参考图 → 查看 / 修改标签 → 融合生成',
    reason: '参考图贴近用户已有的视觉判断，标签把风格说清楚；融合时保住商品、迁移氛围。',
    checks: ['标签可编辑', '整图作为输入', '与精修商品融合'],
    tags: ['柔和家居', '粉米色调', '自然光照', '绿植点缀', '浅色织物']
  },
  {
    image: 'result',
    title: '逐版修改，检查后导出',
    copy: '选择“背景太杂”这类问题，或写下自己的想法；确认修改说明再生成。旧版本随时回看，检查通过后导出。',
    action: '选择问题 → 确认调整 → 对比版本 → 检查导出',
    reason: '每一轮改稿都有明确目标，也能发现非目标的变化。',
    checks: ['修改有方向', '版本可回退']
  }
];

const WY_METRICS = [
  ['商品一致性', '关键细节全部通过的候选数 ÷ 已检查的候选数。', '文字、纹样、轮廓任一关键项错误即不通过；场景图还要对照确认后的商品图。'],
  ['改稿遵循率', '达成修改要求且无越界改动的版本数 ÷ 评审的改稿版本数。', '分别记录“没改到位”和“改了不该改的”，不只看画面有没有变。'],
  ['任务完成率', '限定时间与预算内得到可用图的任务数 ÷ 全部启动任务数。', '失败与放弃计入分母；氛围满意不能替代商品准确性检查。'],
  ['完整任务耗时', '从开始上传到确认可用图的总时间。', '包含模型等待、修边、比较、检查与返工，单独记录人工操作时间。'],
  ['可用图成本', '全部生成与处理费用 ÷ 被采用的图片数。', '失败、重试与检查调用都计入；无可用图时单独报告。']
];

const WY_LOOPS = [
  ['记录问题', '收集失败图、对应版本与用户反馈，关联原图、指令、遮罩与费用。', '可复现的问题单'],
  ['定位原因', '区分输入模糊、精修失真、意图偏差、编辑越界或合成不自然。', '根因假设与证据'],
  ['人工复核', '确认是否真的错误、严重程度与影响范围，不把审美偏好当作事实。', '复核标签与优先级'],
  ['进入回归集', '去重并建立变体，固定失败输入、预期行为与判断标准。', '版本化用例'],
  ['同批复测', '同一批任务比较改前改后，看目标问题是否改善、其他部分是否退化。', '复测差异报告'],
  ['更新或回滚', '通过后更新提示词与流程，保留旧版本，出现退化可回滚。', '变更与复测记录']
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
    <header class="wy-hero">
      <div>
        <h1 id="wy-title">物映</h1>
        <p>小物件商品图改稿助手——从一张随手拍开始，先确认商品没被改坏，再生成场景、逐版调整。</p>
      </div>
      <a class="button primary" href="wuying/demo/?demo=1" target="_blank" rel="noopener">体验示例 ↗</a>
    </header>

    <section class="wy-brief" aria-label="项目概览">
      <article><span>需求场景</span><p>小商家要一张商品准确、氛围合适的宣传图，卡在“判断哪里不对、下一步怎么改”。</p></article>
      <article><span>目标用户</span><p>自己拍图、自己上新的小物件商家：卖发饰、饰品，缺少设计与拍摄条件。</p></article>
      <article><span>关键痛点</span><p>商品细节失真、说不清怎么改、没有合适素材。</p></article>
      <article><span>产品切入点</span><p>把模糊感受变成具体修改，每一步保留可对照、可回退的结果。</p></article>
    </section>

    <div class="wy-compare" aria-label="商品原图与场景成片对比">
      <figure><img src="wuying/assets/original.webp" alt="手持格纹发圈的原始照片"><figcaption><b>随手拍</b></figcaption></figure>
      <span class="wy-compare-arrow" aria-hidden="true">→</span>
      <figure><img src="wuying/assets/result.webp" alt="格纹发圈放在木桌上的场景成片"><figcaption><b>场景成片</b></figcaption></figure>
    </div>

    <div class="wy-body">
      <nav class="wy-rail" aria-label="案例章节">
        <a href="#wy-scenario" data-wy-nav="wy-scenario"><b>01</b>需求与痛点</a>
        <a href="#wy-process" data-wy-nav="wy-process"><b>02</b>产品流程</a>
        <a href="#wy-evaluation" data-wy-nav="wy-evaluation"><b>03</b>评测与迭代</a>
      </nav>

      <div class="wy-main">
        <section class="wy-section" id="wy-scenario">
          <div class="wy-section-head">
            <h2>图片不满意，却说不清怎么改</h2>
            <p>商品图的难点既有“做出来”，也有“判断哪里不对、下一步怎么改”。产品从后者切入。</p>
          </div>
          <div class="flow" aria-label="一次常见的作图任务">
            <span>手机拍商品</span><i aria-hidden="true">→</i><span>找参考图</span><i aria-hidden="true">→</i><span>生成候选</span><i aria-hidden="true">→</i><span>挑出问题</span><i aria-hidden="true">→</i><span>改提示词</span><i aria-hidden="true">→</i><span>重新生成</span>
          </div>
          <div class="wy-pain-tabs" role="tablist" aria-label="问题与产品选择">
            <button class="is-active" role="tab" aria-selected="true" data-wy-pain="0">商品细节变了</button>
            <button role="tab" aria-selected="false" data-wy-pain="1">不知道怎么描述</button>
            <button role="tab" aria-selected="false" data-wy-pain="2">没有合适素材</button>
          </div>
          <div class="wy-decision" aria-live="polite">
            <div><span>问题</span><h3 id="wy-pain-title"></h3><p id="wy-pain-text"></p></div>
            <i aria-hidden="true">→</i>
            <div><span>产品选择</span><h3 id="wy-choice-title"></h3><p id="wy-choice-text"></p></div>
          </div>
        </section>

        <section class="wy-section" id="wy-process">
          <div class="wy-section-head">
            <h2>把一次改稿，拆成看得懂的步骤</h2>
            <p>先确认商品，再确认场景。每一步保留可见结果，让用户有依据地作决定。</p>
          </div>
          <div class="wy-process-tabs" role="tablist" aria-label="产品操作流程">
            <button class="is-active" role="tab" aria-selected="true" data-wy-step="0"><b>1</b><span>上传商品</span></button>
            <button role="tab" aria-selected="false" data-wy-step="1"><b>2</b><span>精修确认</span></button>
            <button role="tab" aria-selected="false" data-wy-step="2"><b>3</b><span>融合生成</span></button>
            <button role="tab" aria-selected="false" data-wy-step="3"><b>4</b><span>调整导出</span></button>
          </div>
          <div class="wy-walkthrough">
            <div class="wy-visual">
              <div class="wy-visual-frame">
                <img id="wy-step-image" src="wuying/assets/original.webp" alt="手持格纹发圈的原始照片">
                <div class="wy-tags-overlay" id="wy-tags-overlay" hidden></div>
              </div>
              <div class="wy-fusion" id="wy-fusion" hidden>
                <span>背景参考图</span><i aria-hidden="true">＋</i><span>提示词标签</span><i aria-hidden="true">＋</i><span>精修商品图</span><i aria-hidden="true">→</i><b>融合生成</b><i aria-hidden="true">→</i><span>商品效果图</span>
              </div>
            </div>
            <div class="wy-step-info" aria-live="polite">
              <span class="wy-step-number" id="wy-step-number">STEP 01</span>
              <h3 id="wy-step-title"></h3>
              <p id="wy-step-copy"></p>
              <p class="wy-action" id="wy-step-action"></p>
              <div class="wy-inset"><strong>设计取舍</strong><span id="wy-step-reason"></span></div>
              <div class="wy-checks" id="wy-step-checks"></div>
              <button class="button" id="wy-next-step">下一步 <span aria-hidden="true">→</span></button>
            </div>
          </div>
          <div class="wy-role-strip">
            <span><b>AI</b>精修、场景提取与改稿</span>
            <span><b>程序</b>保存版本、合成与导出</span>
            <span><b>用户</b>核对商品、确认结果</span>
          </div>
        </section>

        <section class="wy-section" id="wy-evaluation">
          <div class="wy-section-head">
            <h2>先定义能交付，再评价好不好看</h2>
            <p>商品出现关键错误时，背景再漂亮也不能抵消。以下评测体系将在 30 个真实任务上检验。</p>
          </div>
          <div class="wy-metrics" role="tablist" aria-label="评测指标">
            <button class="is-active" role="tab" aria-selected="true" data-wy-metric="0"><b>01</b><span>商品一致性</span></button>
            <button role="tab" aria-selected="false" data-wy-metric="1"><b>02</b><span>改稿遵循率</span></button>
            <button role="tab" aria-selected="false" data-wy-metric="2"><b>03</b><span>任务完成率</span></button>
            <button role="tab" aria-selected="false" data-wy-metric="3"><b>04</b><span>完整任务耗时</span></button>
            <button role="tab" aria-selected="false" data-wy-metric="4"><b>05</b><span>可用图成本</span></button>
          </div>
          <div class="wy-metric-detail" aria-live="polite">
            <div><span>怎么算</span><p id="wy-metric-definition"></p></div>
            <div><span>怎么用</span><p id="wy-metric-use"></p></div>
          </div>
          <label class="wy-gate"><input type="checkbox" id="wy-detail-error" checked><span>发现标签文字或商品纹样不一致</span><strong id="wy-verdict">退回修改</strong></label>

          <div class="wy-subhead"><h3>让失败案例进入下一次验证</h3></div>
          <div class="wy-loop-tabs" role="tablist" aria-label="问题案例回流">
            <button class="is-active" role="tab" aria-selected="true" data-wy-loop="0"><b>01</b><span>记录问题</span></button>
            <button role="tab" aria-selected="false" data-wy-loop="1"><b>02</b><span>定位原因</span></button>
            <button role="tab" aria-selected="false" data-wy-loop="2"><b>03</b><span>人工复核</span></button>
            <button role="tab" aria-selected="false" data-wy-loop="3"><b>04</b><span>进入回归集</span></button>
            <button role="tab" aria-selected="false" data-wy-loop="4"><b>05</b><span>同批复测</span></button>
            <button role="tab" aria-selected="false" data-wy-loop="5"><b>06</b><span>更新或回滚</span></button>
          </div>
          <div class="wy-loop-detail" aria-live="polite">
            <div><span>动作</span><p id="wy-loop-action"></p></div>
            <div><span>产出</span><p id="wy-loop-output"></p></div>
          </div>

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
        </section>
      </div>
    </div>

    <div class="case-next">
      <a href="#design">← 返回项目展示</a>
      <a class="button primary" href="wuying/demo/?demo=1" target="_blank" rel="noopener">打开发圈示例 ↗</a>
    </div>
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
  const imageAlts = {
    original: '手持格纹发圈的原始照片',
    refined: '白底格纹发圈精修图',
    reference: '粉色与灰绿色家居背景参考图',
    result: '格纹发圈场景成片'
  };
  let step = 0;

  function renderStep(index) {
    step = index;
    const item = WY_STEPS[index];
    select('data-wy-step', index);
    const image = $('#wy-step-image');
    image.src = `wuying/assets/${item.image}.webp`;
    image.alt = imageAlts[item.image];
    $('#wy-step-number').textContent = `STEP 0${index + 1}`;
    $('#wy-step-title').textContent = item.title;
    $('#wy-step-copy').textContent = item.copy;
    $('#wy-step-action').textContent = `用户操作：${item.action}`;
    $('#wy-step-reason').textContent = item.reason;
    $('#wy-step-checks').innerHTML = item.checks.map(text => `<span>✓ ${text}</span>`).join('');
    $('#wy-next-step').innerHTML = index === WY_STEPS.length - 1 ? '回到第一步 <span aria-hidden="true">↺</span>' : '下一步 <span aria-hidden="true">→</span>';
    const overlay = $('#wy-tags-overlay');
    const fusion = $('#wy-fusion');
    if (item.tags) {
      overlay.hidden = false;
      overlay.innerHTML = `<span class="wy-tags-label">AI 提取</span>` + item.tags.map(text => `<span>${text}</span>`).join('');
      fusion.hidden = false;
    } else {
      overlay.hidden = true;
      overlay.innerHTML = '';
      fusion.hidden = true;
    }
  }

  function renderPain(index) {
    select('data-wy-pain', index);
    const item = WY_PAINS[index];
    $('#wy-pain-title').textContent = item.tab;
    $('#wy-pain-text').textContent = item.problem;
    $('#wy-choice-title').textContent = item.choice;
    $('#wy-choice-text').textContent = item.how;
  }

  function renderMetric(index) {
    select('data-wy-metric', index);
    $('#wy-metric-definition').textContent = WY_METRICS[index][1];
    $('#wy-metric-use').textContent = WY_METRICS[index][2];
  }

  function renderLoop(index) {
    select('data-wy-loop', index);
    const item = WY_LOOPS[index];
    $('#wy-loop-action').textContent = item[1];
    $('#wy-loop-output').textContent = item[2];
  }

  function renderIssue(index) {
    select('data-wy-issue', index);
    const item = WY_ISSUES[index];
    $('#wy-issue-problem').textContent = item.problem;
    $('#wy-issue-action').textContent = item.action;
    $('#wy-issue-result').textContent = item.result;
  }

  $$('[data-wy-step]').forEach(button => button.addEventListener('click', () => renderStep(Number(button.dataset.wyStep))));
  $$('[data-wy-pain]').forEach(button => button.addEventListener('click', () => renderPain(Number(button.dataset.wyPain))));
  $$('[data-wy-metric]').forEach(button => button.addEventListener('click', () => renderMetric(Number(button.dataset.wyMetric))));
  $$('[data-wy-loop]').forEach(button => button.addEventListener('click', () => renderLoop(Number(button.dataset.wyLoop))));
  $$('[data-wy-issue]').forEach(button => button.addEventListener('click', () => renderIssue(Number(button.dataset.wyIssue))));
  $('#wy-next-step').addEventListener('click', () => renderStep((step + 1) % WY_STEPS.length));
  $('#wy-detail-error').addEventListener('change', event => {
    $('#wy-verdict').textContent = event.target.checked ? '退回修改' : '继续检查其他项';
    $('#wy-verdict').classList.toggle('is-pass', !event.target.checked);
  });

  $$('[data-wy-nav]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    document.getElementById(link.dataset.wyNav)?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
  }));

  let navFrame = null;
  function updateRail() {
    navFrame = null;
    let current = 'wy-scenario';
    $$('.wy-section').forEach(section => {
      if (section.getBoundingClientRect().top <= 200) current = section.id;
    });
    $$('[data-wy-nav]').forEach(link => link.classList.toggle('is-active', link.dataset.wyNav === current));
  }
  window.addEventListener('scroll', () => { if (navFrame === null) navFrame = requestAnimationFrame(updateRail); }, {passive: true});

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
  renderPain(0);
  renderMetric(0);
  renderLoop(0);
  renderIssue(0);
  updateRail();
}
