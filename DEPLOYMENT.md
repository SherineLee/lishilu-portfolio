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
