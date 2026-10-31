# 当前配置：Netlify（2026-10-31）

正式入口 https://lishilu-portfolio.netlify.app 。/api/chat 已由 Netlify Functions 承载。
Production 中配置 DEEPSEEK_API_KEY、FEISHU_APP_ID、FEISHU_APP_SECRET。DEEPSEEK_MODEL 可选，默认 deepseek-flash；FEISHU_DOCUMENT_ID 可选，保留原文档。
Vercel 敏感变量不能反向导出，请在 Netlify 重新安全填入；不要提交到 Git。
变量变更后需重新部署。用真实追问气泡验证完整飞书检索及模型回答，不以模拟测试作为联通证据。

---
历史说明：
# 我的分身：DeepSeek + 飞书文档

## Production 配置

在 Vercel Production 添加 DEEPSEEK_API_KEY（兼容已放在 ARK_API_KEY 中的 DeepSeek 密钥）、FEISHU_APP_ID、FEISHU_APP_SECRET。DEEPSEEK_MODEL 可选，默认 deepseek-flash。使用 https://api.deepseek.com/chat/completions，关闭深度思考以降低响应耗时。保存后需重新部署生效。密钥不写入网页或 Git。

## 飞书授权

在飞书开放平台创建或选择企业自建应用，开启新版文档读取权限（例如 `docx:document:readonly`，以官方后台当前名称为准），发布应用版本使权限生效。然后把指定文档授权给该应用；仅在个人浏览器登录飞书不能提供服务端读取权限。若文档来自不同租户，需确认应用能被授权访问此文档。

目标文档：产品经理 工作面试问题；document_id 为 `JNkNdRWnCo0awmxLBXEcp6tjnbb`。文档可能含模板和旧存档，分身提示词要求不将其当作真实个人成果。

## 实现及边界

前端 `dist/avatar-chat.js` → 同源 POST `/api/chat` → 飞书应用凭证获取 tenant token → 读取文档纯文本 → 中文双字与英文关键词匹配选取片段 → DeepSeek回答。

原文仅留在服务端实例内，缓存五分钟，不存入公开素材。浏览器仅接收回答，不接收原文或密钥。对话仅保存在当前页面内存，不写入飞书，也不持久化访客问题。模型提示词要求依据资料、识别未知与模拟内容、不回答隐私或企业内部信息；这不是独立的内容审核系统。

每次限600字、限制会话上下文和输出长度、上游超时、来源校验及单实例频率/并发限制已实现。后者不等于跨实例分布式限流；面向更大流量时需配置平台防火墙或持久化限流及用量预算。

模型/文档未配置时返回503；无匹配资料则明确未知，不以硬编码简历冒充模型回答。密钥配置前只完成模拟上游验证，不能声明真实问答联通。

左侧当前使用既有个人照片作为可替换的分身形象，不包含语音克隆、口型驱动或真人视频生成。

## 验证

`npm run build` 与 `npm test`。配置后在正式首页测试实习、研究和兴趣问题，并针对知识库没有记录的内容测试未知回答。确认更新飞书后五分钟内可读取新资料。

[DeepSeek鉴权](https://api-docs.deepseek.com/) · [飞书文档纯文本 API](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document/raw_content) · [Vercel Node.js 函数](https://vercel.com/docs/functions/runtimes/node-js)

## 分身语气与补充资料（2026-10-29）

`api/knowledge/shilu.md` 是用户个人信息 Markdown 的职业与兴趣摘录。已排除基本身份表、证件、电话、邮箱、详细地址、紧急联系人与待核对字段，保留服务端，随函数打包，不进入 dist。补充内容和飞书一起检索，补充事实优先。原始私人文件不提交。

`api/answer-policy.cjs` 控制简短、温暖、俏皮的第一人称表达。具体项目指标问题直接转向方法讨论；模型输出经过来源措辞、数字及长度检查，不通过则使用自然转场句。无匹配也用自然转场，不编造个人事实。输出检查是保守规则，不能视为所有隐晦泄露的绝对保证。
