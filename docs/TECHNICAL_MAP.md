# 技术结构地图

## 技术栈与构建

- Next.js 16、React 19、TypeScript、vinext/Vite。
- Three.js 用于花园场景。
- `next.config.ts` 使用 `output: "export"` 和 `trailingSlash: true`。
- `npm.cmd run build` 输出到 `dist/client`。
- `scripts/build-pages.mjs` 负责静态构建与 Windows 下 vinext 晚退出兜底检查。
- `scripts/run-vinext.mjs` 提供跨平台开发启动；`scripts/serve-static.mjs` 预览静态产物。

## 页面入口

| 路径 | 作用 |
|---|---|
| `app/page.tsx` | 纪念主页结构与计时内容 |
| `app/globals.css` | 主页、信件、图标与小游戏全局视觉 |
| `app/MemoryQuest.tsx` | 五图标收集、烟花、邀请和贪吃蛇 |
| `app/memory-moments.ts` | 五个记忆图标的唯一配置入口 |
| `app/garden/page.tsx` | 花园静态页面壳 |
| `app/garden/GardenScene.tsx` | Three.js 花园渲染与浏览器交互 |
| `app/garden/garden-data.ts` | 8×8 地块和物件布局数据 |
| `app/remake/page.tsx` | 人生重开路由与星空背景 |
| `app/remake/LifeRestartGame.tsx` | 游戏状态机、UI、存档、调试、特殊结局衔接 |
| `app/remake/remake.module.css` | 人生重开全部局部样式 |

## 人生重开数据与引擎

### 上游静态数据

`public/remake-data/`：

- `age.json`：501 个年龄档，0—500 岁。
- `events.json`：当前发布 1719 个事件；构建时会严格检查数量。
- `talents.json`：184 个天赋。
- `achievement.json`：165 个成就。
- `character.json`：100 个预设角色。

上游来源与 commit 见 `THIRD_PARTY_NOTICES.md`。不要直接编辑这五份数据来实现本站剧情；新增和替换应进入覆盖层。

### 纯引擎

`app/life/remake-engine.ts` 负责：

- 原版条件表达式解析。
- 天赋抽取、排斥、替换与属性点。
- 年龄事件池、include/exclude/NoRandom、权重概率。
- 天赋触发、事件 effect、branch 递归与死亡。
- 固定随机源、快照和恢复。
- 本站条件属性 `PEVT` 只读取前世已见事件，不包含本世事件；用于保证首世练气与次世月白仙章不能在同一局连续解锁。

UI 不应重新实现一套不一致的事件规则。

### 本站覆盖层

`app/remake/site-event-overrides.ts`：

- 注入本站特殊天赋、特殊事件、铺垫、传闻和成就。
- 保留原事件21305—21308及原年龄池不变；另以 `site-unloaded-hometown-entry` 作为红色药丸真结局入口，由运行预约在20—32岁触发。
- 注入“屋里七天”的低概率年龄窗口。
- 将首世练气、次世仙脉图录、修仙章节和不抢主线的轻量事件加入指定年龄池。
- 保持未涉及的上游年龄事件不变。

`app/remake/special-endings.ts`：

- 定义特殊事件元数据、进入模式、结局方式、触发年龄与图片页。
- `scheduledSpecialEvents()` 根据天赋预约 0 岁性别、铺垫和主事件。
- `specialEndingTriggerAge()` 负责年龄范围内的随机触发年。
- 发布故事资源路径必须从 `/remake-tales/...` 开始。

`app/remake/cultivation-route.ts`：

- 小盒子的跨世门槛、仙脉图录机会、14章修仙叙事和7条轻量事件。
- 初识冰山一角、完美结局、真结局三个成就。
- 红色药丸和真结局固定文案。

`app/remake/weird-tales.ts`：

- 将原版事件/天赋映射为文字异闻线索。
- 线索可乱序发现，末页要求同线路的足够前置线索。

## 游戏状态与本地存档

- 当前存档键：`wm-zj-life-remake:v2`。
- 旧键：`wm-zj-life-remake:v1`，仅用于迁移提示。
- 保存内容包括阶段、抽卡、刷新次数、分配、运行快照、解锁天赋/事件/成就、特殊事件收录与终局状态。
- 导入存档必须经过严格字段归一化；损坏或未知阶段不能把页面带入空白状态。
- GitHub Pages 没有服务端写入能力，localhost 与正式域名的 localStorage 不共享。

## 抽卡与红色天赋

常量位于 `LifeRestartGame.tsx`：

- 每批 30 张，选 3 张。
- 可额外刷新 3 次。
- 当前等级概率：45/30/18/7。
- `RED_TALENT_WEIGHTS` 控制红色天赋的单卡额外权重。
- 每段人生先以 75% 概率确定至多一个红色天赋，后续三次刷新只保留该红卡并排除其他红卡；若继承的是红卡，则继承卡占用本世唯一名额。
- 引擎的 `exclusiveTalentGroups` 同时约束直接选择和天赋替换，避免福袋、轮盘赌等原版替换在开局后偷偷加入第二张红卡；真结局人生由红色药丸独占红卡名额。
- 原版 1048 神秘的小盒子、1065 祖传药丸、1128 克苏鲁和本站宏大怪谈天赋均按红卡显示或加权。

红色外观与原版 `grade` 是两层概念，不要通过直接改上游 JSON 等级实现。现有剧情均只依赖单张红卡；红色药丸来自完美结局后的独立选择，不占普通卡池，但会占用真结局人生的唯一红卡名额。

## 性别约束

`LifeRestartGame.tsx` 中：

- `MALE_REQUIRED_TALENT_IDS`：需要男性人生的天赋。
- `MALE_INCOMPATIBLE_TALENT_IDS`：女性限定原版天赋。
- `requiresMaleLead()` 和 `withoutMaleIncompatibleTalents()` 必须同时用于普通抽卡、开局和调试。

`special-endings.ts` 的 `scheduledSpecialEvents()` 会为男性限定链插入 0 岁事件 `10001`。任何新增男性限定事件必须同时更新上述集合和测试。

## 调试与预览

- `REMAKE_DEVTOOLS_ENABLED` 在非生产环境为真。
- localhost、127.0.0.1 和 ::1 也允许显示本地调试工具。
- 调试页默认不选择事件，可只测试天赋；主动选择事件后才会将其预约到自然或特殊触发年龄，人生始终从 0 岁启动。
- `?preview=<ending-id>`、`pill-choice`、`true-ending` 用于本地预览；生产环境不得依赖这些入口。

## 素材目录

- `public/remake-tales/`：367 张桌面故事原图，以及逐页同名的 `*.mobile.webp` 手机轻量图；阅读器用 `<picture>` 按视口选择并预加载后两页。
- `素材库/抖音图文/`：原始抓取、manifest 和核查资料，不由网页直接引用。
- `public/memory-moments/`：五张透明记忆图标原始 PNG。
- `public/keepsakes/`：主页实际加载的五张 128px 轻量 WebP，避免手机端下载 1254px 原图。
- `花园参考图片/`：花园美术参考，不直接在页面加载。

映射与数量见 `ASSET_MANIFEST.md`。

## 测试地图

| 测试 | 保护内容 |
|---|---|
| `tests/rendered-html.test.mjs` | 三个静态路由、主页文案、图标、生产构建与资源 |
| `tests/remake-data.test.mjs` | 上游数据数量、引用与完整性 |
| `tests/remake-engine.test.mjs` | 条件、概率、事件分支、存档快照和引擎规则 |
| `tests/weird-tales.test.mjs` | 两条文字异闻、线索长度、ID与来源唯一性 |
| `tests/special-endings.test.mjs` | 特殊事件页数、路径、年龄、性别、铺垫、修仙和真结局 |

`npm.cmd test` 会先构建静态网站，再运行以上全部测试。

## 新增特殊事件的最小流程

1. 在 `site-event-overrides.ts` 定义天赋、入口事件、年龄和铺垫/传闻。
2. 在 `special-endings.ts` 添加元数据与每页图片、文字。
3. 将发布图放入新的 `public/remake-tales/<id>/` 目录，使用两位数连续命名。
4. 在 `ASSET_MANIFEST.md` 记录来源、授权说明、原始页数和处理规则。
5. 若限男性，更新男性集合并测试出生和天赋过滤。
6. 明确 `entryMode` 和 `outcome`，避免读完后错误结束人生。
7. 增加页数、首尾路径、年龄边界、预约铺垫和资源存在性测试。
8. 本地从 0 岁用调试人生完整走一次，再让用户体验。
