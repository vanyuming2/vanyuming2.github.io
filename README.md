# 万雨铭与张锦的纪念网站

一个以暖色星空为入口的私人纪念网站。目前包含纪念主页、边缘记忆图标与小游戏、漂浮小花园，以及基于 Life Restart 改编的“另一种人生”怪谈游戏。

## 当前页面

- `/`：纪念主页、相伴计时、三封信、五个记忆图标和贪吃蛇小游戏。
- `/garden/`：固定斜俯视的第一块星空花园，目前用于观赏和验证美术方向。
- `/remake/`：人生重开游戏，包含原版中文人生数据、天赋抽取、逐年经历、图鉴、成就、存档、异闻和特殊结局。

计时起点固定为 `2026-04-29T00:17:00+08:00`。

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm ci
npm.cmd run dev
```

默认本地地址通常为 `http://localhost:3000/`。开发环境中的人生重开页面会显示调试入口；生产构建不会显示。

完整验证：

```bash
npm.cmd test
npm.cmd run lint
```

生成的 GitHub Pages 静态文件位于 `dist/client`。

## 长期项目文档

后续模型或新对话开始工作前，先阅读根目录的 `AGENTS.md`，再按其中顺序阅读 `docs/`：

- `docs/CURRENT_STATE.md`：当前真实状态。
- `docs/GAME_BIBLE.md`：玩法、世界观和文案规则。
- `docs/TECHNICAL_MAP.md`：代码与数据地图。
- `docs/DECISIONS.md`：重要决定。
- `docs/ASSET_MANIFEST.md`：图片来源和发布资源映射。
- `docs/ROADMAP.md`：后续目标。

## 发布纪律

所有修改先在本地确认。创建本地提交不代表允许上传；只有用户明确要求发布后，才检查远端分支和 GitHub Pages 状态并执行部署。

“另一种人生”包含并改编 Life Restart 的简体中文数据与相关规则，完整第三方许可见 `THIRD_PARTY_NOTICES.md` 和发布目录中的 `public/third-party-notices.txt`。
