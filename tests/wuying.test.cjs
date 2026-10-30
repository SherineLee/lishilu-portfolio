'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('commerce 路由渲染物映案例并初始化交互', () => {
  const app = read('dist/app.js');
  const html = read('dist/index.html');
  assert.match(app, /commerce:commerceComing/);
  assert.match(app, /if\(top==='commerce'\)initWuyingCase\(\)/);
  assert.match(html, /wuying\/case\.js/);
  assert.match(html, /wuying\/case\.css/);
});

test('案例与体验入口不使用本机地址或占位页', () => {
  const source = read('dist/wuying/case.js') + read('dist/wuying/demo/index.html');
  assert.doesNotMatch(source, /localhost|127\.0\.0\.1|项目内容即将更新/);
  assert.match(source, /wuying\/demo\/\?demo=1/);
});

test('案例页保留开场概览卡、竖排章节导航与融合生成步骤', () => {
  const source = read('dist/wuying/case.js');
  for (const field of ['需求场景', '目标用户', '关键痛点', '产品切入点']) {
    assert.match(source, new RegExp(field));
  }
  assert.match(source, /data-wy-nav/);
  assert.match(source, /提示词标签/);
  assert.match(source, /融合生成/);
  assert.doesNotMatch(source, /产品规划 · 交互设计|参考与成片可切换|碎碎念|赋能|抓手/);
});

test('案例页不再包含旁白式标注', () => {
  const source = read('dist/wuying/case.js');
  assert.doesNotMatch(source, /预置素材|已分别跑通|仍待验证|真实商家访谈/);
});

test('物映本地图片与体验页资源都存在', () => {
  for (const name of ['original', 'refined', 'reference', 'result']) {
    assert.ok(fs.statSync(path.join(root, 'dist/wuying/assets', `${name}.webp`)).size > 1000);
  }
  for (const file of ['demo.css', 'demo.js']) {
    assert.ok(fs.existsSync(path.join(root, 'dist/wuying/demo', file)));
  }
});

test('公开体验页初始为空白待输入态，点体验示例才载入示例，并明确预置边界', () => {
  const html = read('dist/wuying/demo/index.html');
  const js = read('dist/wuying/demo/demo.js');
  assert.match(html, /体验示例/);
  assert.match(html, /class="workspace is-setup"/);
  assert.match(html, /demo-entry/);
  assert.match(html, /download="物映-发圈场景示例\.webp"/);
  assert.match(js, /体验示例：精修与成片使用预置结果|预置结果/);
  assert.doesNotMatch(html + js, /localhost|127\.0\.0\.1|项目内容即将更新/);
});
