# 乌鸦的图书馆 Crow Library

免费、开放的数字图书馆：在线阅读、个人书架、阅读记忆与 AI 阅读助手。

> 让阅读更自由，让知识更容易被理解。

第一版以中文界面为主，聚焦“文字书”闭环（EPUB / PDF / TXT）。漫画馆、多语言、整本翻译等功能后置。

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 前端 | Next.js 15 (App Router) + TypeScript |
| UI 样式 | Tailwind CSS |
| 数据库 | PostgreSQL（见 `supabase/schema.sql`） |
| 认证 | Supabase Auth（邮箱注册、验证和登录） |
| 文件存储 | Supabase Storage 或 S3 兼容存储（权限受控） |
| 阅读器 | EPUB.js、PDF.js（第 5 阶段接入；当前内置 TXT 阅读器） |
| AI | 大语言模型 API（第 7 阶段接入，含额度控制与版权边界） |
| 检索 | RAG + pgvector（后续） |

## 快速开始

```bash
cp .env.example .env.local   # 填写自己的 Supabase / AI 配置；不配置则以“本地演示模式”运行
npm install
npm run dev                  # http://localhost:3000
```

```bash
npm run build && npm start   # 生产构建
```

数据库初始化：在 Supabase SQL 编辑器中执行 `supabase/schema.sql`（含版权字段与审核状态约束）。

## 版权合规（重要）

本项目遵循《乌鸦的图书馆_版权侵权等问题》的合规计划：

- 每本书必须处于以下审核状态之一，**只有“审核通过”的书才会向公众开放**：
  待审核（不可公开）/ 审核通过（允许上线）/ 授权存疑（不可公开）/ 收到投诉（临时下架）/ 审核撤销（永久移除）。
- 书籍详情页必须展示来源、许可和署名信息（见 `src/app/books/[id]`）。
- AI 功能只对授权明确允许 AI 处理的书籍开放；AI 回答以摘要、解释和必要的短引用为主，不提供整章或整本逐字输出。
- 公开发布权限与上传权限分离，普通管理员不能绕过版权状态直接发布。

## 开源边界

- 开源许可证（MIT）只覆盖**网站代码**；书籍原文为公有领域内容，按公版状态提供，仓库中仅收录已核验的公版文本。
- 非公版电子书文件、授权邮件、截图、用户数据**一律不提交**到公开仓库（已在 `.gitignore` 排除）。
- 示例数据仅限已确认公版的内容（见 `src/lib/data.ts`）。
- API 密钥、数据库密码不得提交到仓库，也不要发到聊天或截图里；部署者需配置自己的密钥（`.env.example`）。

## 目录结构

```
src/
  app/            # 页面：首页/图书馆/详情/阅读器/AI室/书架/历史/收藏/计划/个人中心/主题设置
  components/     # 导航、顶栏、底部标签栏、书卡、封面、登录弹窗等
  lib/            # 类型、示例数据、版权判定、本地数据层（后续替换为 Supabase）
supabase/
  schema.sql      # 数据库初始化文件
```

## 开发阶段（对应产品框架第十二章）

- [x] 第 1 阶段：项目初始化（Next.js + TS + Tailwind）
- [x] 第 2 阶段：首页与 UI（线条 SVG 图标、书卡、分类、搜索、主题、手机端适配）
- [x] 第 4 阶段（前端部分）：版权审核状态字段与展示，仅“审核通过”公开
- [x] 第 5 阶段：TXT 阅读器 + EPUB.js + PDF.js（进度保存、字体/背景）
- [x] 第 6 阶段（本地演示 + 云端同步）：进度/历史/收藏跨设备同步
- [x] 第 3 阶段（代码就绪）：Supabase Auth 邮箱验证登录 + PostgreSQL（配置 .env.local 后启用）
- [x] 第 7 阶段（代码就绪）：AI API 路由（配置 AI_API_KEY 后切换真实模型，内置版权边界）
- [x] 第 8 阶段：后台管理（书籍/分类/版权/用户/AI 管理）
- [x] 第 9 阶段：测试与发布（版权政策、隐私政策、部署文档）

每个阶段验收通过后再进入下一阶段。

## 已收录书籍（全部为公有领域原文）

正文来自 Project Gutenberg 公版文本，经 `scripts/build-books.mjs` 解析为分章 JSON（`public/books/text/*.json`），
繁体自动转简体，不含任何现代注释、译文或出版社排版。封面由 `src/components/Cover.tsx` 用代码绘制（书名排版 + 分类配色 + 印章），不使用第三方图片。

| 类别 | 书目 |
| --- | --- |
| 经部/诸子 | 论语（20 篇）、道德经（81 章）、孙子兵法（13 篇）、易经（64 卦）、礼记（49 篇） |
| 诗文 | 诗经（305 篇）、古文观止（222 篇） |
| 史部 | 史记（65 卷篇）、汉书（27 卷）、山海经（18 卷） |
| 小说 | 三国演义（108 回）、红楼梦（1–23 回公版卷）、西游记（1–25 回公版卷）、水浒传（1–21 回公版卷）、聊斋志异（174 篇） |
| 外国文学 | The Art of War（EPUB/PDF）、Pride and Prejudice（Ch. I–XXII）、The Adventures of Sherlock Holmes |

以上为精选导读书目；另有 100 本 Project Gutenberg 公版中文古籍由 `scripts/build-books.mjs bulk` 自动收录（元数据写入 `src/lib/books.generated.ts`，全文写入 `public/books/text/gb-*.json`），全站合计 **121 本**。

> 公版判定依据：作者逝世满 50 年（中国）/ 出版于美国公有领域；Gutenberg 版本为公版卷册，缺卷部分已在书名中标注。
> 重新生成全文数据：先下载源文本到 `.cache/books/`，再执行 `node scripts/build-books.mjs`。

## 已上线功能

- 智能问答 `/ask`：中文 2-gram 检索（仅检索“审核通过”的书）→ 带出处的回答，未配置密钥时回退本地检索
- 学习计划 `/plan`：按目标自动选题与排程，支持勾选完成、跳转阅读
- 后台管理 `/admin`：概览、书籍与版权状态（全站生效覆盖层）、用户、AI 授权与额度
- 阅读器：TXT 全文分章、EPUB.js、PDF.js，进度/历史/书架持久化

管理员默认账号为 `admin@crow.lib`（可通过 `NEXT_PUBLIC_ADMIN_EMAILS` 改为自己的邮箱）。