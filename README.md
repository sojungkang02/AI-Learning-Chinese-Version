# 漫游英语 · ComicLingo

面向学生的漫画英语学习 Web MVP。界面为中文，学习内容为英文。无需 API Key 即可运行完整 Mock 学习流程。

## 产品设计 → 数据契约 → 实现

1. [PRD、用户故事、页面流与架构](docs/PRD.md)
2. [PostgreSQL Prisma 数据模型](prisma/schema.prisma)、[API 契约](docs/API.md)、[AI JSON Schema](lib/schemas.ts)、[独立 prompt 模板](prompts/script.md)
3. 项目结构：

```text
app/
  page.tsx                  移动优先页面与交互：档案、创作、阅读、测验、结果、宠物、商店、榜单、错题、报告、隐私
  components/QuizStages.tsx  四阶段指示器与按阶段渲染的支架组件
  api/[...path]/route.ts     服务端 API、用户隔离、积分与宠物事务
  globals.css               响应式布局、键盘焦点、减少动画支持
lib/
  difficulty.ts             可配置 CEFR 参数与考试映射
  generation.ts             六步生成编排、内容检查、缓存与跨字段校验
  providers.ts              LLMProvider / ImageProvider、Mock、远程模型、一次修复
  schemas.ts                Ajv 输出校验
  quiz.ts                   服务端渐隐状态机、评分、掌握度与复习
  db.ts                     SQLite schema、事务、积分账本、商品
prompts/                    剧本及各阶段提示词
prisma/                     PostgreSQL 迁移设计与种子数据
 tests/                     Vitest 与 Playwright
```

## 启动

需要 Node.js 24+（使用内置 `node:sqlite`，无需数据库服务）。

```bash
npm ci --cache /workspace/.npm-cache
npm run db:seed
npm run dev
```

默认 3000 端口。生产构建：`npm run build && npm start`。当前环境已装依赖，开发服务可用 `npm run dev` 重启。`.data/comiclingo.sqlite` 保留所有访客学习、积分、宠物和排行榜数据；请保留此目录并仅部署单进程本地卷。不得将 SQLite 文件放入公开静态资源目录。

`npm run db:seed` 幂等写入六档难度和四种商品，无敏感信息。首次打开自动创建独立匿名访客和猫咪、两份食物。没有虚构排行榜账户。

## 配置

复制 `.env.example` 到 `.env.local`，保持默认 Mock 无需填写 Key。

| 变量 | 作用 |
|---|---|
| DATA_DIR | 数据目录，默认 `.data` |
| LLM_PROVIDER | `mock`（默认）或 `remote` |
| LLM_BASE_URL | OpenAI-compatible 服务根路径 |
| LLM_API_KEY | 仅服务端使用，不加 NEXT_PUBLIC 前缀 |
| LLM_MODEL | 远程模型名 |
| DATABASE_URL | 仅 PostgreSQL Prisma 迁移工具使用，本地运行路径不用此变量 |
| PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH | 可选系统 Chromium 路径 |

远程模式有 Key 才调用模型。密钥缺失时回到 Mock。远程分阶段调用以 Schema 校验，失败修复一次，仍失败返回可重试错误。没有自动吞掉远程错误并假装生成成功。图片目前统一使用无外部请求的 SVG 示意插画；更换画风会记录选择，但不是实际风格化图像模型。

## 测试

```bash
npm test
# 环境已有 Chromium：
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
# 其他机器可先安装浏览器，然后直接运行：
npx playwright install chromium
npm run test:e2e
npm run build
```

Vitest：生成六格/目标词与题目、危险输入改写、Schema 一次修复、重复奖励/递减/每日上限、事务回滚、L3→L0、错误回退、重放拒绝和复习安排。
Playwright：主流程含全部 20 阶段答题、故意答错、支架 DOM 消失检查、词卡、喂食、实际兑换扣分、周榜与刷新持久化；另测跨用户隔离、奖励篡改、并发重复提交、余额不足、移动端无横向溢出。

## 数据、积分与安全

- 每阶段正确才前进；错误退一级，L3 不再后退。客户端不能提交阶段、分数或奖励金额。
- 答题事务同时更新掌握度、账本、宠物经验与 1/3/7/14 天复习。题目 revision 防重复提交；事件唯一键防重复奖励。
- 每日正向奖励上限 200（UTC 日）；同知识点奖励按 `floor(base/(1+次数))` 递减。阅读奖励每漫画一次；消费不重置当日上限。
- 商店余额检查、扣减、账本与库存增加在同一事务；喂食需持有库存；装备需所有权。
- 内容规则在输入与输出检查，危险设想改写；审核日志只存分类与动作，不存原始敏感输入。
- 服务端不向漫画或测验接口返回标准答案。L0 响应不含漫画、例句或释义。
- 导出与删除入口在“隐私与安全”；数据按匿名 Cookie 隔离，Cookie 为 HttpOnly / SameSite=Lax。生产登录、家长授权与会话强化尚未实现。
- TTS 使用浏览器 speechSynthesis，是否有英语语音取决于设备。

## PostgreSQL 设计

`prisma/schema.prisma` 覆盖全部 17 个要求的模型、关系、唯一约束与索引。当前 SQLite 适配器已测试；PostgreSQL schema 是后续迁移设计，未接入运行时。`prisma/seed-postgres.example.ts.txt` 提供迁移种子示例；迁移时需要安装 `@prisma/client`、生成客户端并实现异步事务适配，不能只设置 DATABASE_URL 即切换。

## MVP 完成范围与下一步

已实现：无 Key 主流程、六格漫画示意、可点击词卡与收藏、阅读/单页模式、TTS、五种题型、严格四阶段、答错回退、掌握度、复习队列、积分防重复与日上限、猫狗选择、喂食/兑换/装扮、匿名周榜、本人报告、导出删除、自动化测试。

尚未完成的生产能力：

- 正式注册/登录（Supabase/NextAuth）、密码恢复、跨设备账户；当前是访客模式。
- PostgreSQL 实际运行适配、迁移与服务验证；Redis、对象存储和真实图片 Provider。
- 真实 LLM 和图片质量验证：没有配置 API Key；Mock 固定环保词汇，不能真正按任意设想改变教学内容，CEFR 限制在 Mock 中仅演示词数，尚无完整分级词库/语法/密度验证。
- 严格的模型内容审核、语义安全改写与人工审核后台；关键词规则不是完整未成年人安全保证。
- 近义干扰项质量评估、真实造句评分校准；Mock 评分仅检查基本结构。
- 好友/班级排行榜、教师/家长授权关联、学习时间测量、连续学习天数展示、收藏管理列表。
- 图片按需加载/持久图片缓存与后台生成任务；当前请求同步生成，进度为阶段提示动画，不是后端实时事件。
- shadcn/ui 组件体系、微信小程序封装、完整无障碍审计和真实用户三分钟验收。

优先迭代：真实认证与 PostgreSQL → 分级内容库/安全审核 → 图片 Provider 与异步队列 → 教师授权和班级学习。

## Render 공개 데모 배포

무료 Mock 데모 설정을 `render.yaml`에 제공합니다. [한국어 배포 안내](docs/RENDER.md)를 따라 Render에서 Blueprint를 만들거나 기존 Web Service에 명령을 입력하세요. Free 서비스의 SQLite 데이터는 재시작·재배포 시 초기화될 수 있습니다. AI Key는 필요하지 않습니다.
