# 本人编辑与发布

编辑入口：https://lishilu-portfolio.vercel.app/?edit=1#home

编辑文字、删除组件或替换图片 → 预览草稿 → 一键发布 → 本人密码登录 → 确认发布。先提交 GitHub main，再等待 Vercel；界面确认线上 published.json 的版本已更新才显示成功。草稿先保存在当前浏览器，发布失败不清除；提交成功但部署未完成时会保留待检查状态，刷新继续检查。

服务端仅接受受限 main 内选择器与纯文本、隐藏、PNG/JPEG/WebP 替换；不接受 HTML、JS、任意文件路径或 SVG。图片校验文件头，按内容散列写 dist/assets/published；整次请求小于 3.5 MB、单张图片小于 2.2 MB。不能通过编辑器改源码或服务端配置。内容保存在 dist/published.json，因此所有访客可见且 Git 有历史记录。更改页面 DOM 结构时应核对旧选择器是否仍对应原内容。

## 环境变量

- EDITOR_PASSWORD：至少 16 位随机强密码，仅本人通过 Vercel Secret 表单设置。
- EDITOR_GITHUB_TOKEN：fine-grained PAT，只限 SherineLee/lishilu-portfolio，Contents read/write + Metadata read-only。创建日期 2026-10-29，到期 2026-11-28；到期前需在 GitHub 续期或更换，再更新 Vercel 并重新部署。

密码不进入 Git，也不由前端保存；登录会话为 Secure/HttpOnly/SameSite=Strict 签名 Cookie，八小时有效。所有写入请求核对正式域名 Origin，未登录不能发布；使用 SHA 基线及非强制 Git ref 更新避免覆盖并发提交。登录限流是单实例，强密码仍是必要条件。修改任一服务端凭证会使既有会话失效。

构建：npm run build。测试：npm test。
