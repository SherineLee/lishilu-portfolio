# 当前正式入口：Cloudflare Pages（2026-10-31）

作品集：https://lishilu-portfolio.pages.dev/
独立工具：https://product-scene-assistant.pages.dev/

部署命令：npm run deploy:cloudflare。完整配置与验收步骤见 CLOUDFLARE.md。以下 Netlify / Vercel 记录仅为历史，不作为当前发布指令。

---

# 正式入口更新（2026-10-30）

作品集：https://lishilu-portfolio.netlify.app/ ，项目介绍 #commerce。
独立工具：https://product-scene-assistant.netlify.app/ 。
独立源码：https://github.com/SherineLee/product-scene-assistant （私有）。
工具站点 ID：2d8cc028-b648-4def-badf-e85462053053。
作品集保留原 site ID 530a4c0e-bf41-4644-8497-89530488f928，已重命名域名。
工具独立发布，百炼配置只在服务端；作品集旧工具路径跳转新工具。

---
# 当前正式部署：Netlify（2026-10-30）

用户已将正式网站迁移为 Netlify 全端部署。
- 网站：https://lishilu-portfolio.netlify.app/
- 项目介绍：https://lishilu-portfolio.netlify.app/#commerce
- 工具：https://lishilu-portfolio.netlify.app/wuying/demo/
- Netlify 项目 ID：530a4c0e-bf41-4644-8497-89530488f928
- 前端 dist/；接口 netlify/functions/commerce.cjs 复用 api/commerce.js。
- 服务端环境变量：DASHSCOPE_API_KEY、COMMERCE_IMAGE_MODEL、COMMERCE_VISION_MODEL。不得写入前端或 Git。
- npm run build 与 npm test 后，以 Netlify CLI 执行 netlify deploy --prod --no-build；需已登录并关联上述项目。
- 当前为 CLI 部署；Git 推送不代表 Netlify 自动发布成功，必须单独部署与验收。
- GitHub/Vercel 为历史入口，后续验收以 Netlify 为准。

---
以下保留历史部署记录：

# 部署与更新

- 正式网站：https://lishilu-portfolio.vercel.app/
- GitHub私有仓库：https://github.com/SherineLee/lishilu-portfolio
- 正式分支：main
- Vercel项目：https://vercel.com/sheri-ne/lishilu-portfolio
- Vercel项目ID：prj_qlO3uDW9cQsKYsM51aO2sjulleiU
- Vercel团队：sheri-ne
- 输出目录：dist
- 构建检查：npm run build
- 初次CLI生产部署：dpl_FvDbDfzUgwYomeXrsMX3tsGd9dgN，READY

GitHub与Vercel已连接；main提交应触发生产构建。每次必须核对对应提交的部署状态和正式网站，不把本地修改当上线。

后续修改使用npm run publish -- "简短变更说明"，执行检查、提交和推送。随后等待Vercel对应版本Ready并验证正式页面。无需持续文件监控，不在写文件过程中自动提交未完成内容。

图片和PDF的浏览器本地上传不会自动写入GitHub；需要共享给所有访客的内容，应纳入dist/assets并重新发布。不要改动既定域名。

## 首次Git自动部署验收

Git提交：1f2413f602818bca1e605c3f0429057113b41038。
对应Vercel生产部署：dpl_Gkxd1w81i4UN88S7MjL7RVSLhkAG，READY。
API已确认Git连接为SherineLee/lishilu-portfolio，productionBranch=main。
正式域名已返回HTTP 200并在浏览器打开；案例目录与长卷切换已核对。
Git提交使用Github账号对应的noreply地址，不公开私人邮箱。
