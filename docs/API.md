# API 契约
所有接口采用 JSON；HttpOnly comic_session Cookie 标识访客。无 Cookie 首次请求创建访客；必须保留 Set-Cookie 后再发请求。数据仅限本人。业务错误返回 400 `{error:string}`；未知接口 404。生产应替换为受验证的账户认证。POST 同源 Origin 检查。

| 方法与路径 | 请求 | 响应 |
|---|---|---|
| GET /api/session | — | id,nickname,profile,balance,comics,pet |
| POST /api/profile | nickname,exam,target,minutes,interests,species,leaderboard | ok |
| POST /api/comics/generate | difficulty,genre,style,idea,regenerate? | comic（不含答案）,cached |
| GET /api/comics/:id | — | comic |
| POST /api/points/claim | comicId | awarded,balance?；仅阅读奖励，幂等 |
| POST /api/quiz/start | comicId | id,revision,stage,index,total,question,support |
| POST /api/quiz/answer | sessionId,revision,answer | 下一题或 done；last 含反馈/评分 |
| GET /api/review/due | — | due,upcoming,mistakes |
| GET /api/pet | — | species,hunger,mood,xp,level,equipped,balance,inventory,shop |
| POST /api/pet/feed | {} | pet；消费一份食物 |
| POST /api/pet/buy | itemId | pet；事务扣积分、加库存 |
| POST /api/pet/equip | itemId | pet；检查所有权 |
| GET /api/leaderboard | — | entries,scope 或 disabled |
| GET /api/report/learner/:id | — | 本人 mastery,lessons,points,reviews,ledger |
| POST /api/favorites | knowledgeId | ok |
| GET /api/data/export | — | 当前用户的数据 JSON |
| POST /api/data/delete | {} | ok；删除当前用户数据 |

## 支架契约
`stage=3`：support 含 meaning/example/panel；`2`：example/panel；`1`：panel；`0`：空对象。L0 不向浏览器传漫画、例句、释义或标准答案。Comic GET 也不含 questions。正确：3→2→1→0→下一知识点；错误：min(3,stage+1)。revision 乐观并发校验防止重复答题奖励。最高通过阶段用顺序值 1–4 表示 L3–L0，-1 表示未通过。

## AI 契约
`lib/schemas.ts` 提供目标、脚本、知识、题目、审核、造句评分的 Ajv JSON Schema。每次失败最多修复一次；跨字段验证目标词确实出现在对话、目标 ID 存在、每词四阶段各一题、选项包含唯一答案。`prompts/` 为可替换模板。图片接口目前只有 MockImage，双次重试与 SVG 回退；生成漫画 SQLite 持久缓存，进程内图片缓存。
