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

test('案例保留预置素材与待验证事实边界', () => {
  const source = read('dist/wuying/case.js');
  assert.match(source, /预置素材/);
  assert.match(source, /仍待验证/);
  assert.doesNotMatch(source, /目标用户假设|为什么这样设计|产品机会|赋能|抓手|闭环/);
});

test('物映本地图片与体验页资源都存在', () => {
  for (const name of ['original', 'refined', 'reference', 'result']) {
    assert.ok(fs.statSync(path.join(root, 'dist/wuying/assets', `${name}.webp`)).size > 1000);
  }
  for (const file of ['demo.css', 'demo.js']) {
    assert.ok(fs.existsSync(path.join(root, 'dist/wuying/demo', file)));
  }
});

test('公开体验页明确说明不调用生图并提供示例下载', () => {
  const html = read('dist/wuying/demo/index.html');
  assert.match(html, /不上传、不调用生图/);
  assert.match(html, /download="物映-发圈场景示例\.webp"/);
  assert.match(html, /精修与成片为预置素材/);
});
