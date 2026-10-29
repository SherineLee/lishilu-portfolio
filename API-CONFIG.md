# 我的分身：豆包 + 飞书文档

## Production 配置

在 [Vercel 环境变量](https://vercel.com/sheri-ne/lishilu-portfolio/settings/environment-variables) 中添加下列变量，环境选择 Production。密钥设为 Secret，不写进网页或 Git。保存后需要重新部署才会生效。

| 名称 | 内容 |
|---|---|
| ARK_API_KEY | 火山方舟 API Key |
| ARK_MODEL | 账号已开通的豆包 Model ID 或推理接入点 ID；不能填写模型的中文展示名 |
| FEISHU_APP_ID | 飞书自建应用 App ID |
| FEISHU_APP_SECRET | 对应应用 App Secret |
| FEISHU_DOCUMENT_ID | 可选，默认使用本次指定文档 |

豆包使用方舟数据面 Chat API，非 Coding Plan 接口。北京区域地址固定为 `https://ark.cn-beijing.volces.com/api/v3/chat/completions`。

## 飞书授权

在飞书开放平台创建或选择企业自建应用，开启新版文档读取权限（例如 `docx:document:readonly`，以官方后台当前名称为准），发布应用版本使权限生效。然后把指定文档授权给该应用；仅在个人浏览器登录飞书不能提供服务端读取权限。若文档来自不同租户，需确认应用能被授权访问此文档。

目标文档：产品经理 工作面试问题；document_id 为 `JNkNdRWnCo0awmxLBXEcp6tjnbb`。文档可能含模板和旧存档，分身提示词要求不将其当作真实个人成果。

## 实现及边界

前端 `dist/avatar-chat.js` → 同源 POST `/api/chat` → 飞书应用凭证获取 tenant token → 读取文档纯文本 → 中文双字与英文关键词匹配选取片段 → 豆包回答。

原文仅留在服务端实例内，缓存五分钟，不存入公开素材。浏览器仅接收回答，不接收原文或密钥。对话仅保存在当前页面内存，不写入飞书，也不持久化访客问题。模型提示词要求依据资料、识别未知与模拟内容、不回答隐私或企业内部信息；这不是独立的内容审核系统。

每次限600字、限制会话上下文和输出长度、上游超时、来源校验及单实例频率/并发限制已实现。后者不等于跨实例分布式限流；面向更大流量时需配置平台防火墙或持久化限流及用量预算。

模型/文档未配置时返回503；无匹配资料则明确未知，不以硬编码简历冒充模型回答。密钥配置前只完成模拟上游验证，不能声明真实问答联通。

左侧当前使用既有个人照片作为可替换的分身形象，不包含语音克隆、口型驱动或真人视频生成。

## 验证

`npm run build` 与 `npm test`。配置后在正式首页测试实习、研究和兴趣问题，并针对知识库没有记录的内容测试未知回答。确认更新飞书后五分钟内可读取新资料。

[豆包鉴权](https://docs.volcengine.com/docs/ark/base-url-and-authentication?lang=en) · [飞书文档纯文本 API](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document/raw_content) · [Vercel Node.js 函数](https://vercel.com/docs/functions/runtimes/node-js)
