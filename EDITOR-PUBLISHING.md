# 本人编辑与发布

编辑入口：https://lishilu-portfolio.vercel.app/?edit=1#home

编辑文字、删除组件或替换图片 → 预览草稿 → 一键发布 → 本人密码登录 → 确认发布。先提交 GitHub main，再等待 Vercel；界面确认线上 published.json 的版本已更新才显示成功。草稿先保存在当前浏览器，发布失败不清除；提交成功但部署未完成时会保留待检查状态，刷新继续检查。

服务端仅接受受限 main 内选择器与纯文本、隐藏、PNG/JPEG/WebP 替换；不接受 HTML、JS、任意文件路径或 SVG。图片校验文件头，按内容散列写 dist/assets/published；整次请求小于 3.5 MB、单张图片小于 2.2 MB。不能通过编辑器改源码或服务端配置。内容保存在 dist/published.json，因此所有访客可见且 Git 有历史记录。更改页面 DOM 结构时应核对旧选择器是否仍对应原内容。

## 环境变量

- EDITOR_PASSWORD：至少 16 位随机强密码，仅本人通过 Vercel Secret 表单设置。
- EDITOR_GITHUB_TOKEN：fine-grained PAT，只限 SherineLee/lishilu-portfolio，Contents read/write + Metadata read-only。创建日期 2026-10-29，到期 2026-11-28；到期前需在 GitHub 续期或更换，再更新 Vercel 并重新部署。

密码不进入 Git，也不由前端保存；登录会话为 Secure/HttpOnly/SameSite=Strict 签名 Cookie，八小时有效。所有写入请求核对正式域名 Origin，未登录不能发布；使用 SHA 基线及非强制 Git ref 更新避免覆盖并发提交。登录限流是单实例，强密码仍是必要条件。修改任一服务端凭证会使既有会话失效。

构建：npm run build。测试：npm test。

## PDF 发布与阅读

PDF 不再使用 50 MB 检查。原文件先存 IndexedDB 供当前浏览器预览；“一键发布”会将 PDF 按 2 MiB 分块上传，服务端验证首块 PDF 签名并签发每块收据，提交时核对顺序与总大小，将分块文件和 published.json 在一次 Git 提交中发布。所有访客直接进入 #design/portfolio 即加载在线分块、合并并通过 PDF.js 阅读；不依赖上传者电脑或本地路径。当前实现最多 512 块以控制资源耗用，单次 HTTP 请求始终小于平台请求限制。桌面原文件删除不会影响已经发布的网站。

## 访问性能

当前分身首图使用约 137 KiB 的 JPEG，通过 preload + fetchpriority 优先获取；默认与已发布配置共用同一地址。published.json 使用协商缓存，带散列或唯一版本路径的发布素材长期缓存。

当前作品集额外提供逐页 WebP 预览，默认仅获取当前页，原 PDF 分段及校验值仍保留。“高清原件”切换 PDF.js 按需字节读取；分段缓存控制在约 24 MiB。后续替换 PDF 后若未生成逐页预览，则自动走原件按需读取，不沿用旧文档预览。
