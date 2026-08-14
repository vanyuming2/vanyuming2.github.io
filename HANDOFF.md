# 当前交接入口

> 更新时间：2026-08-14（Asia/Shanghai）

本项目已从最初的纪念主页发展为多模块长期项目。旧版 2026-08-03 交接说明已经失效；当前上下文不再集中堆放在一个巨大文件中。

## 接手顺序

1. 完整阅读根目录 `AGENTS.md`。
2. 阅读 `docs/CURRENT_STATE.md`、`docs/GAME_BIBLE.md`、`docs/TECHNICAL_MAP.md` 和 `docs/DECISIONS.md`。
3. 涉及图文素材时再读 `docs/ASSET_MANIFEST.md`。
4. 执行 `git status --short --branch`，不要假设工作区干净。
5. 开始修改前，先向用户复述当前状态和本轮范围。

## 本检查点包含

- 用户认可的暖色星空纪念主页、信件、五个边缘记忆图标和小游戏。
- `/garden/` 第一块基础 3D 花园。
- `/remake/` 完整人生重开流程、本地存档、调试入口、异闻、特殊事件、修仙线、完美结局和真结局。
- 10组特殊事件主体、1个蓬莱反向章节、367张发布故事图。
- 原始素材库、上游人生数据、第三方许可和自动回归测试。
- 新的长期项目文档体系。

## 不可误解

- 本地检查点不是发布授权，不要自动 push 或部署。
- `public/remake-tales/` 是网页使用的发布资源；`素材库/` 是原始抓取与核查资料。
- 页面上曾按用户要求移除显眼的 Life Restart 说明，但 MIT 完整许可仍必须在发布文件中保留。
- 调试按钮只应在开发环境或本机出现。
- 当前下一阶段重点见 `docs/ROADMAP.md`。

## 推荐恢复命令

```bash
npm ci
npm.cmd test
npm.cmd run lint
npm.cmd run dev
```

若命令结果与 `docs/CURRENT_STATE.md` 不一致，以实际结果为准并更新文档。

## 最近验证

2026-08-14：`npm.cmd test` 通过35项测试；`npm.cmd run lint` 为0错误、3条图片性能建议警告。静态构建成功导出三个正式页面。
