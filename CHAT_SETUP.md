# AI Chat Widget 配置说明

访客可通过右下角聊天按钮向 AI 助手提问（如研究方向、项目等）。使用 **Google Gemini 免费 API** + **Vercel Serverless** 实现。

## 一、获取 Gemini API Key

1. 打开 [Google AI Studio](https://aistudio.google.com/apikey)
2. 登录 Google 账号
3. 点击 **Create API Key**，复制生成的 Key

## 二、部署 API 到 Vercel

1. 打开 [Vercel](https://vercel.com)，用 GitHub 登录
2. 点击 **Add New** → **Project**
3. 选择你的仓库 `erdemtbao/erdemtbao.github.io`
4. 在 **Environment Variables** 中添加：
   - Name: `GEMINI_API_KEY`
   - Value: 你的 Gemini API Key
5. 点击 **Deploy**
6. 部署完成后，记下项目 URL，例如：`https://erdemtbao-github-io.vercel.app`
7. API 地址为：`https://你的项目名.vercel.app/api/chat`

## 三、配置网站

编辑 `_config.yml`，将 `chat_api_url` 设为你的 API 地址：

```yaml
chat_api_url: "https://erdemtbao-github-io.vercel.app/api/chat"
```

保存后重新构建并推送到 GitHub，聊天功能即可生效。

## 四、本地测试

本地运行 Jekyll 时，需在 `_config.yml` 中设置 `chat_api_url`，且 Vercel API 的 CORS 已允许 `http://localhost:4000`。

## 五、费用说明

- **Google AI Studio (Gemini)**：免费额度约 60 次/分钟、1500 次/天
- **Vercel**：个人项目免费额度充足

## 六、关闭聊天功能

将 `_config.yml` 中的 `chat_api_url` 设为空字符串 `""` 即可隐藏聊天按钮。
