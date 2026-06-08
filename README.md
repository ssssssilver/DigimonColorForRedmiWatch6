# Digimon Color for REDMI Watch 6

这是一个用于学习 Xiaomi Vela 快应用开发的 Digital Monster COLOR Ver.5 风格手表端电子宠物项目，目标设备是 REDMI Watch 6。

项目目标是把 Digital Monster COLOR Ver.5 的核心宠物机体验转译到 432 x 514 的手表屏幕上：玩法规则尽量贴近原版，操作方式针对手表触屏重新设计。

## 当前范围

- 版本范围：只做 Digital Monster COLOR Ver.5。
- 使用场景：个人学习、本地验证、Vela 快应用开发练习。
- 授权边界：学习用途，不把授权问题作为当前需求阻塞项。
- 画风目标：尽量保持原版 Ver.5 的像素 sprite、LCD 宠物机场景、短标签按钮、低帧动画和高对比提示。
- 操作目标：规则贴近原版，但不硬搬实体机 A/B/C 三键；默认使用手表点按、长按、返回/左滑等交互。

## 当前可交付版本

当前第一版候选为 `0.4.4`。它已经包含 Ver.5 固定版本、孵化/成长、喂食、训练、清理、治疗、灯光、Cold Mode、状态查看、本地存档、Humulos 双帧待机动画、本地 Quest 战斗、真机 432 x 514 全屏布局、短占屏动作反馈和离线恢复确认。

训练操作：

1. 在主屏点 `训练`。
2. 进入 `蓄力训练` 后观察蓄力格移动。
3. 点屏幕中间或底部 `停止判定` 结算。
4. 停在黄色区域为成功；成功和失败都会计入训练次数，每 4 次训练增加努力值。

本地验证：

```powershell
npm run test:game
npm run lint:data
npm run build
npm run debug:vela:square
```

## 需求文档

核心文档：

- [Digital Monster COLOR 红米 REDMI Watch 6 快应用需求分析](docs/redmi-watch6-dmc-quickapp-requirements.md)
- [REDMI Watch 6 DMC Ver.5 快应用设计文档](docs/redmi-watch6-dmc-quickapp-design.md)
- [REDMI Watch 6 DMC Ver.5 UI Flow](docs/redmi-watch6-dmc-ui-flow.md)
- [HTML 预览原型](docs/prototypes/redmi-watch6-dmc-preview.html)

文档覆盖：

- Digital Monster COLOR Ver.5 内容范围
- REDMI Watch 6 设备约束
- Xiaomi Vela 快应用技术边界
- 宠物生命周期、喂食、训练、战斗、进化、存档等功能需求
- 原版画风要求
- 手表操作适配原则
- UI 流程、页面状态和原型预览
- 验收标准、里程碑、风险与开放问题

## 玩法原则

本项目的玩法取舍标准是：

> 规则贴近原版，操作适配手表。

必须贴近原版的部分包括成长阶段、进化时间、Care Mistake、训练计数、战斗数、胜率、过量喂食、睡眠/关灯、Cold Mode、Ver.5 形态名单、Quest 数据和进化条件。

需要为手表转译的部分包括菜单导航、训练小游戏、战斗确认、危险操作确认和返回逻辑。常用照顾动作应尽量在 3-5 秒内完成。

## 计划里程碑

1. 完成 Ver.5-only 需求和数据范围确认。
2. 整理 Ver.5 名单、sprite、Quest、进化路线和关键条件。
3. 实现 REDMI Watch 6 主屏、存档、孵化、喂食、训练、清理、治疗、Cold Mode。
4. 实现手表适配的 Ver.5 训练小游戏和 Quest 战斗。
5. 对齐原版画风，并在 432 x 514 模拟器/真机上验收。

## 技术方向

- 平台：Xiaomi Vela JS 快应用
- 目标设备：REDMI Watch 6
- 目标分辨率：432 x 514
- 核心能力：`system.storage`、`system.vibrator`、`system.router`
- 运行方式：离线优先，应用重新打开时用时间差结算成长和消耗

## 资料来源

- [Wikimon: Digital Monster COLOR](https://wikimon.net/Digital_Monster_COLOR)
- [Wikimon: Digital Monster COLOR Ver.5](https://wikimon.net/Digital_Monster_COLOR_Ver.5)
- [Xiaomi Vela 快应用开发文档](https://iot.mi.com/vela/quickapp/zh/guide/)
- [Xiaomi Vela 多屏适配文档](https://iot.mi.com/vela/quickapp/zh/guide/multi-screens/)
- [REDMI Watch 6 官方规格](https://www.mi.com/global/product/redmi-watch-6-nfc/)
