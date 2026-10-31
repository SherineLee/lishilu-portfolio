# Cloudflare 部署（2026-10-31）

作品集：https://lishilu-portfolio.pages.dev/ ，项目介绍 #commerce。
独立工具：https://product-scene-assistant.pages.dev/ 。

## 当前架构

Cloudflare Pages 托管前端，Advanced Mode Worker 提供同源 /api/*。静态来源 dist/；入口 cloudflare/worker.mjs；主要配置 wrangler.jsonc。私有知识文档仅编译到服务端 _worker.js，不放进公开静态目录。

```sh
npm ci
npm run deploy:cloudflare
```

部署脚本先检查代码、通过 wrangler.workers.jsonc 打包后端，再由 scripts/build-cloudflare-pages.mjs 组装 work/cloudflare-pages-site，最后运行测试并上传 Pages。首次需要官方 wrangler login，账号具有 Pages Write 权限。两个同名 Pages 项目已创建，生产分支 main；现为 CLI 直接部署，Git push 不等于上线，必须单独部署并验收正式 URL。

## 服务端配置

使用 wrangler pages secret put KEY --project-name PROJECT 设置密钥。密钥只在 Cloudflare 服务端绑定，不进入前端、Git、日志或部署配置；.dev.vars*、.wrangler/ 与 work/ 已忽略。

商品助手：DASHSCOPE_API_KEY；可选 COMMERCE_IMAGE_MODEL、COMMERCE_VISION_MODEL。
作品集分身：DEEPSEEK_API_KEY（或旧 ARK_API_KEY）；无此配置时可使用 DASHSCOPE_API_KEY 与 AVATAR_MODEL。当前使用 DeepSeek 与已核对的本地知识。只有配置 FEISHU_APP_ID、FEISHU_APP_SECRET 才启用飞书。可选 FEISHU_DOCUMENT_ID、DEEPSEEK_MODEL。
编辑接口仅在 EDITOR_PASSWORD、EDITOR_GITHUB_TOKEN 有效时启用；当前未配置，不视为已验收功能。

/api/health 只返回配置状态，不返回密钥或知识原文。迁移模型凭据时保留为 Cloudflare Secret；不将已有 Secret 改成明文变量。

## 网络与历史入口

当前网络无法访问 workers.dev（包括授权成功后的欢迎页）；该欢迎页报错不代表 OAuth 失败。已改为上述 pages.dev 地址。wrangler.workers.jsonc 和 deploy:cloudflare-worker 留作备用部署方案，不作为当前正式入口。
Netlify 旧站保留；账号曾返回 credit usage exceeded，不能假定可继续部署。Vercel、GitHub Pages 也是历史入口。

## 发布验收

检查正式页面、分身气泡自动发送与真实回复、商品助手真实接口、功能体验与返回链接。功能体验使用预置结果，不能代替真实生成验收。不要把构建通过、模型已配置或 CLI 上传成功当成全部功能验证通过。
