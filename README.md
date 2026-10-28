# 李诗璐 · 产品与设计手记

个人作品集初稿。纯前端，无构建依赖。

## 查看
在此目录运行 `python3 -m http.server 4188 --directory dist`，浏览器打开 `http://127.0.0.1:4188/`。也可直接打开dist/index.html查看主要页面；上传持久化与PDF阅读建议通过HTTP服务使用。

## 页面
- 首页：个人照片、教育背景、介绍与四个入口。
- 实习经历：腾讯元宝、美团点评、携程智行机票。
- Vibe Coding：和好喵、衣柜设计师，包含需求、文档、流程、规则、评测、效果及后续市场化设想。
- AIGC：长卷、电商生图、手绘与立体表达三类。支持长卷横向浏览与图片放大。
- 设计保研作品集：上传PDF，在线阅读、独立窗口和下载。

## 修改
- 文案数据：dist/content.js。
- 布局与交互：dist/app.js。
- 样式：dist/styles.css。
- 默认素材：dist/assets/。

右上角“替换素材”支持照片、工作流和效果图、PDF。文件存于当前来源的IndexedDB，跨设备、跨域和其他访客不会自动同步；清除浏览器站点数据会丢失。图片限PNG/JPG/WebP 15 MB，PDF限50 MB并检查文件头。PDF内嵌阅读使用本地PDF.js，支持翻页与缩放；另有原生独立窗口与下载入口。

## 正式发布共享PDF
本初稿无后台。需将确认的保研PDF放入dist/assets并配置为默认共享文件，再重新部署。当前没有擅自将桌面其他“软硬件作品集”当作保研作品集。代码仓库保持私有，网站通过Vercel正式域名访问。

## 内容依据
见“素材与内容核对.md”。未来市场化策略为本初稿梳理的规划，不是历史上线成果。未添加真实用户反馈、营收或转化数据。

## 一键本地启动
在 Finder 中双击“启动预览.command”，终端会启动本地服务并打开网站。若4188已被其他程序占用，先停止旧预览，或手动换用另一端口。PDF阅读器使用本地PDF.js，源码及许可证放在dist/assets/pdfjs。

## 当前发布状态

正式网址：https://lishilu-portfolio.vercel.app/
GitHub私有仓库：https://github.com/SherineLee/lishilu-portfolio
Vercel已连接此仓库，main提交自动触发部署；项目记录见DEPLOYMENT.md。

后续修改后运行 `npm run publish -- "本次改动说明"`，自动检查、提交和推送，再等待Vercel Ready并验收正式网站。用户已授权每次网站修改都执行此流程，详见AGENTS.md。
