# API 契约
所有接口采用 JSON；HttpOnly comic_session Cookie 标识访客。无 Cookie 首次请求创建访客；必须保留 Set-Cookie 后再发请求。数据仅限本人。业务错误返回 400 `{error:string}`；未知接口 404。生产应替换为受验证的账户认证。POST 同源 Origin 检查。

| 方法与路径 | 请求 | 响应 |
|---|---|---|
| GET /api/session | — | id,nickname,profile,balance,comics,pet |
| POST /api/profile | nickname,exam,target,minutes,interests,species,leaderboard | ok |
| POST /api/comics/generate | difficulty,genre,style,idea,regenerate?,reuse? | comic（不含答案）,cached |
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
`lib/schemas.ts` 提供目标、脚本、知识、题目、审核、造句评分的 Ajv JSON Schema。每次失败最多修复一次；跨字段验证目标词确实出现在对话、目标 ID 存在、每词四阶段各一题、选项包含唯一答案。`prompts/` 为可替换模板。图片接口有本地主题插画与 RemoteImage（OpenAI-compatible PNG），双次重试后回退并标记 imageFallbacks。新生成默认不读缓存；只有 reuse:true 且非 regenerate 时读取版本化 SQLite 缓存。最近六篇对白用于防止重复。图片有容量上限的进程缓存，最终分镜随漫画持久化。返回 mode=local/remote 与 imageMode=local/remote/mixed；旧记录仍可能含 mode=mock。

## 反려동물 의상 및 만화 출연

- `GET /api/pet`은 기존 정보 외에 `name`, `speciesOptions`를 반환합니다. 지원 ID: `cat`, `white-cat`, `dog`, `capybara`, `sheep`, `rabbit`.
- `POST /api/pet/select` `{species}`: 무료로 주인공 변경. 기존 인벤토리와 의상은 유지됩니다.
- `POST /api/pet/equip` `{itemId, remove?: boolean}`: 입기/벗기. 소유권을 검사하며 head/body/face/neck/toy/background 슬롯마다 하나씩만 적용합니다. 장착은 무료입니다.
- 의류는 중복 구매할 수 없고, 음식만 반복 구매할 수 있습니다. 가격은 서버 상품표를 사용하며 잔액·장부·인벤토리를 같은 트랜잭션에서 갱신합니다.
- `POST /api/comics/generate`에 `characters?: [{name,role,appearance}]`를 추가할 수 있습니다(최대 2명). 실제 반려동물과 의상은 요청 본문을 신뢰하지 않고 서버 저장값에서 가져옵니다.
- 반환 `comic.cast`는 생성 시점의 반려동물·의상·추가 인물 스냅샷입니다. 이후 옷을 바꾸어도 이전 만화는 바뀌지 않습니다. 캐시 키에 출연진을 포함합니다.
- 로컬 분镜는 `panel.image` 배경과 `panel.cast` 캐릭터를 `ComicArtwork`에서 함께 표시합니다. 로컬 SVG 배경만 다운로드하면 반려동물 레이어는 포함되지 않습니다. AI 작화가 성공한 `artMode=remote`는 완성 이미지 자체에 등장인물을 포함합니다.
