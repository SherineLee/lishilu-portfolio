# 交接提示词 · 李诗璐个人作品集网站

复制下面「提示词正文」整段给另一个 AI，即可让它接手修改。最后一节 `[本次任务]` 替换成实际需求。

---

## 提示词正文

你接手修改一个已上线的个人作品集网站（纯静态，Vercel 部署）。请严格遵守下列项目事实与流程，不要凭猜测改动。

### 一、项目位置

- **站点源码仓库（唯一正式来源）**：
  `/Users/lishilu/Documents/Codex/2026-10-28/https-xhslink-cn-o-1k4dhmivzau-x20/outputs/portfolio`
  - 网站文件全部在 `dist/`，已纳入 git，Vercel 直接发布 `dist`，`outputDirectory: dist`。
  - GitHub 私有仓 `SherineLee/lishilu-portfolio`，正式分支 `main`。
  - 正式地址：https://lishilu-portfolio.vercel.app/
- **3D 入口源码（另一个目录）**：
  `/Users/lishilu/WorkBuddy/2026-10-28-21-59-43/red-cabin`
  - 源码在 `src/`：`main3.js` 主流程、`hall2.js` 木屋内景、`paintings.js` 画作、`snowScene2.js` 雪地外景。
  - `node build3.mjs` 把 `src/main3.js` 打包输出到上面仓库的 `dist/cabin.js`（约 690KB，three 已内联）。
  - **`dist/cabin.js` 是构建产物，禁止手改**；改 3D 一律改 `red-cabin/src` 后重新执行 `node build3.mjs`。

### 二、动手前先读

`README.md`（页面与文件职责）、`AGENTS.md`（提交部署约定，必读）、`DEPLOYMENT.md`（Vercel 信息）、`dist/index.html`、`dist/styles.css`、`dist/app.js`、`dist/content.js`。

> 注意：`DESIGN.md` 描述的是早期的「手账剪贴」风格，**已过时**。现行视觉是「雪原 + 红木屋」，以 `styles.css` / `cabin.css` 的实际代码为准，不要照 `DESIGN.md` 改回去。`README.md` 的部分页面描述也早于 3D 入口。

### 三、架构要点

- 纯静态，无框架、无打包器（3D 除外）。hash 路由：`#home` / `#internships` / `#vibe` / `#aigc` / `#design`。
- `dist/content.js` 文案数据；`app.js` 布局与交互；`styles.css` 全站样式；`assets/` 素材；`scrolls/` 三条长卷（xihu / zju / ningbo）。
- 3D 入口由 `cabin-boot.js` 按需加载：无 hash 或 `#home` 才加载 3D；深层 hash 只挂右下「回到小屋」浮标；URL 带 `?edit=1` 完全不加载 3D 和浮标（草稿编辑模式）。`sessionStorage` 记 visited 后二次访问直接进屋内。
- 屋内墙上 5 幅画对应 `ROUTES=['home','internships','vibe','aigc','design']`；画作贴图是 `dist/art/p1–p5.jpg`（3:4，768×1024），由 `paintings.js#makeArtTexture` 加载并按封面裁切，再叠中央标题牌。换画只需替换同名文件，不用改代码。
- 调试接口：`window.__ready`、`window.Cabin.state`、`window.Cabin.debug.toHall()`、`window.Cabin.debug.openWork(i)`。

### 四、常用命令

```bash
# 本地预览
python3 -m http.server 4188 --directory dist      # http://127.0.0.1:4188/
# 检查（语法 + 本地资源引用）
npm run build
# 发布（检查 + commit + push main）
npm run publish -- "本次改动说明"
# 改 3D 后重建
cd /Users/lishilu/WorkBuddy/2026-10-28-21-59-43/red-cabin && node build3.mjs
```

### 五、视觉红线（近期已确定，不要回退）

- 雪原底 `#EDF0F4`；红屋红 `#A31A17` 是唯一强调色；金色 `#D4A94E` 只用于编号与作品；圆角 10 / 16 / 22 / 999；缓动 `cubic-bezier(.65,0,.35,1)`。
- 已移除的手账装饰（胶带、图钉、倾斜、虚线边框）不要重新加回。
- 屋内 5 幅画：**等高悬挂**（`FRAME_DY` 全为 0）、**平面无浮雕**（不要给画作材质加 normalMap 或几何位移）、标题只在画面正中一块深色玻璃牌上，下方不再重复。
- 篝火已压低并前移以保证不遮挡中间那幅画；若改动火焰高度或画框挂高，需重新确认遮挡关系。

### 六、协作偏好

- 每次修改必须提交 GitHub，等 Vercel 对应提交 Ready，再打开正式站验收；回报**提交哈希 + 部署状态 + 正式地址 + 验收范围**。不要把本地完成当成上线。
- 迭代产出一律另存新版本（v1→v2→v3 或带日期），不覆盖已有文件。
- 不编造数据：严格区分「已上线成果 / 实验中 / 方案设想」，不写未核验指标，不虚构用户与营收。
- 用简体中文沟通，结论先行、善用表格，不写冗长段落。

### 七、本次任务

`[在这里写你这次要改的需求，尽量具体到页面 / 元素 / 预期效果]`

### 八、验收清单

`npm run build` 通过 → 本地 4188 预览（桌面 1440 与手机 390 各看一遍）→ `npm run publish -- "说明"` → 等 Vercel Ready → 打开 https://lishilu-portfolio.vercel.app/ 逐条核对 → 回报提交哈希与验收结果。

---

## 当前状态（交接时的事实，2026-10-29）

- 最新提交 `f4a2a59`：墙面画作换成抽象艺术画，去掉浮雕改平面，五幅等高悬挂，压低篝火避免遮挡。
- 待办/风险：`dist/art/p1–p5.jpg` 来自用户提供的参考图，可能涉及第三方版权，长期建议换成自绘或自生成版本；左右两幅（实习经历、软硬件）本身色调偏暗，若需可给边侧画灯单独提亮；`README.md` / `DESIGN.md` 部分描述已过时。
