# REDMI Watch 6 DMC Ver.5 快应用设计文档

版本：0.1  
日期：2026-06-03  
依据文档：

- `docs/redmi-watch6-dmc-quickapp-requirements.md`
- `docs/redmi-watch6-dmc-ui-flow.md`

## 1. 设计目标

本设计面向 REDMI Watch 6 / Xiaomi Vela JS 快应用，实现一个 Digital Monster COLOR Ver.5 风格的离线电子宠物机。应用打开后应直接进入宠物待机主屏，用户通过点按屏幕唤出命令菜单，在 3-5 秒内完成喂食、训练、清理、治疗、战斗、开关灯、冷冻和查看状态等短流程。

首版目标不是资料站、图鉴浏览器或现代宠物游戏，而是“手表里的 Ver.5 宠物机本体”。所有数据、sprite、规则和存档都在本地运行，不依赖网络或手机伴侣应用。

## 2. 范围

### 2.1 必做

- 固定 Digital Monster COLOR Ver.5，不提供版本切换。
- 新建存档、Digitama、孵化、成长、进化、死亡与重新孵蛋。
- 饥饿、力量、体重、努力值、Care Mistake、过量喂食、战斗数、胜率、Quest 进度、排泄、伤病、睡眠、Cold Mode。
- FOOD、TRAIN、BATTLE、WC、MED、LIGHT、COLD、STATUS、DATA 操作。
- Ver.5 本地 Quest 战斗，按战力、属性克制和命中率计算结果。
- `system.storage` 本地存档，前台 tick 与重新打开时的离线时间结算。
- REDMI Watch 6 432 x 514 矩形屏适配。
- LCD / 像素 / 短标签 / 低帧动画风格。

### 2.2 暂不做

- Ver.1-4、Xros Wars、合作版本或版本切换。
- 联网对战、实体 DMC 通信、红外/金属触点模拟。
- 后台常驻提醒。
- 商业发布相关授权声明。
- 大型图鉴、长手册、复杂路线计算器作为首屏功能。
- 音频，除非后续确认 `system.audio` 能力与包体预算。

## 3. 关键设计原则

### 3.1 首页是宠物待机，不是菜单

默认主屏只保留宠物、LCD 场景、关键状态和弱提示。命令菜单必须由点按唤出，操作后回到待机。这样才能让应用第一眼像一台正在运行的宠物机，而不是一个通用手表工具。

### 3.2 单屏单任务

每个屏幕只做一件事：

- Home：看宠物和状态。
- Command：选择照顾动作。
- Food：连续投喂。
- Train：短小游戏和结果。
- Battle：预览、短回合、结果。
- Status/Data：快速查数值。
- Recovery/Death：处理异常或重开。

不在同一屏同时展示长状态、大表格、完整说明和全部按钮。

### 3.3 规则贴近原版，输入适配手表

状态、进化、Care Mistake、训练、战斗和 Cold Mode 尽量贴近 DMC 规则。输入方式不照搬实体机 A/B/C 三键循环，而是转译为手表可用的点按、长按、左滑/系统返回。

### 3.4 玩法状态机与 UI 分离

页面只负责渲染和事件转发；所有规则、计时、合法性判断、进化、战斗、呼叫和死亡都由状态机处理。这样可以用 Node smoke test 验证规则，也能降低 `.ux` 页面复杂度。

## 4. 系统架构

```text
src/
  manifest.json
  app.ux
  pages/
    index/
      index.ux              # 宠物机主界面，首版唯一注册页面
  common/
    data/
      digimon.js            # DMC 形态数据和 sprite 路径
      quest.js              # Quest 区域、回合、敌人、Power
      vpetEvolution.js      # 成长时间和进化候选规则
      manual.js             # 后续手册资料保留
    utils/
      gameEngine.js         # 状态机与玩法规则
      gameStore.js          # system.storage 存档
      calculator.js         # 战斗命中率公式
    digimon/
      *.png                 # 运行时 sprite
      *.gif                 # 原始素材备份
tools/
  validate-data.mjs         # 数据和 sprite 校验
  smoke-test-game.mjs       # 状态机 smoke test
  extract-humulos-dmc.mjs   # 数据抽取
```

首版发布只在 `manifest.json` 注册 `pages/index`。其他页面可以保留为数据参考或后续功能，但不进入首版主导航。

## 5. 模块职责

### 5.1 `pages/index/index.ux`

职责：

- 加载存档。
- 前台每秒刷新 `idleFrame` 和显示模型。
- 根据 `displayModel` 渲染主屏、菜单、状态、战斗短演出、死亡页。
- 把按钮事件转为 action，调用 `applyAction(state, action, now)`。
- 关键操作后保存存档。
- `onHide` / `onDestroy` 停止定时器。

页面不得硬编码进化、战斗、死亡、呼叫或状态扣减规则。

### 5.2 `common/utils/gameEngine.js`

职责：

- `newGame(now, version)`：创建新存档。
- `hydrateState(raw, now)`：读取存档并补齐缺省字段。
- `tickState(state, now)`：按时间差推进消耗、排泄、呼叫、Care Mistake、死亡和进化。
- `applyAction(state, action, now)`：执行用户动作并返回新状态。
- `getDisplayModel(state, now)`：把状态转换为 UI 可直接渲染的数据。
- `calculateHitrate(...)`：通过 `calculator.js` 计算战斗命中率。

状态机应保持纯规则导向。除系统时间外，不直接访问 Vela API。

### 5.3 `common/utils/gameStore.js`

职责：

- 使用 `system.storage` 保存和读取存档。
- 存档损坏、读取失败或空存档时创建新游戏。
- 保存前删除运行时派生字段，例如 `pet`。

后续需要加入 `schemaVersion` 和迁移逻辑，避免存档结构变化导致旧存档不可读。

### 5.4 `common/data/*`

职责：

- `digimon.js`：只存结构化形态数据，不混入 UI 展示逻辑。
- `quest.js`：只存 Quest 数据和敌人 sprite。
- `vpetEvolution.js`：存成长时间、阶段推进和候选选择逻辑。
- 数据必须能被 `tools/validate-data.mjs` 校验。

## 6. 状态模型

首版存档至少包含：

```js
{
  schemaVersion: 1,
  petKey: 'digitama',
  version: 'Ver.5',
  generation: 1,
  bornAt: 0,
  lastTickAt: 0,
  nextEvolutionAt: 0,
  hunger: 4,
  strength: 4,
  effort: 0,
  weight: 5,
  careMistakes: 0,
  overfeeds: 0,
  battles: 0,
  wins: 0,
  poop: 0,
  sick: false,
  sickStartedAt: 0,
  injured: false,
  injuredStartedAt: 0,
  asleep: false,
  lightsOff: false,
  cold: false,
  dead: false,
  callActive: false,
  callStartedAt: 0,
  emptyStartedAt: 0,
  questArea: 0,
  questRound: 0,
  questClears: 0,
  lastEnemyName: '',
  lastEnemySprite: '',
  lastBattleAt: 0,
  lastBattleWon: false,
  lastActionAt: 0,
  lastAction: '',
  lastHungerAt: 0,
  lastStrengthAt: 0,
  lastPoopAt: 0,
  message: ''
}
```

`pet`、`statusRows`、`hungerText`、`showBattle` 等属于显示模型，不进入持久化存档。

## 7. 时间推进设计

### 7.1 前台 tick

页面前台运行时每秒刷新一次。每次刷新：

1. 调用 `getDisplayModel(state, now)`。
2. 内部通过 `tickState` 推进真实时间差。
3. 更新画面。
4. 如达到保存间隔或关键字段变化，写入存档。

### 7.2 离线结算

应用不申请后台常驻。再次打开时，`hydrateState(raw, now)` 用当前时间与存档时间差结算：

- 饥饿/力量扣减。
- 排泄物生成。
- 呼叫与 Care Mistake。
- 伤病风险与死亡。
- 到点进化。

Cold Mode 下不推进消耗、呼叫、排泄和进化计时；退出 Cold Mode 时重置 `lastHungerAt`、`lastStrengthAt`、`lastPoopAt` 和 `lastTickAt` 到当前时间，避免瞬间补扣。

### 7.3 时间跳变保护

若 `now - lastTickAt` 超过安全阈值，例如 7 天，或系统时间倒退，应进入 `TIME?` 恢复流程：

- `CONTINUE`：按上限结算。
- `NEW EGG`：重建存档。

该流程应保持 LCD 像素样式，不使用现代弹窗。

## 8. 状态优先级

首页显示优先级：

1. Dead
2. Evolution
3. Battle result
4. Cold
5. Sleep
6. Sick / Hurt
7. Call
8. Poop
9. Normal idle

菜单高亮与可用动作优先级：

1. Dead：只显示 `NEW EGG`。
2. Cold：只显示 `RESUME`、`STATUS`、`BACK`。
3. Sleep：显示 `LIGHT` / `WAKE`、`STATUS`、`BACK`，阻止 FOOD/TRAIN/BATTLE。
4. Sick/Hurt：高亮 `MED`。
5. Poop：高亮 `WC`。
6. Hunger/Power empty：高亮 `FOOD`。
7. Normal：不高亮。

## 9. UI 页面与模式

### 9.1 Home / Idle

默认模式。显示：

- 顶部：`Ver.5`、宠物名、Quest、年龄。
- LCD 顶部：CALL、阶段、进化倒计时、COLD/ZZZ。
- LCD 中部：宠物 sprite、简化场景、排泄物、死亡符号或战斗短演出。
- LCD 底部：HUN / POW 心数。
- LCD 外：弱 `TAP` 提示。

点按 LCD 或空白处进入 Command。

### 9.2 Command

底部命令层，覆盖在主屏下方，不跳转到独立大页面。按钮：

- `FOOD`
- `TRAIN`
- `BATTLE`
- `WC`
- `MED`
- `LIGHT`
- `COLD`
- `STATUS`
- `DATA`
- `BACK`

菜单 5-8 秒无操作自动收起。执行动作后回到 Home，FOOD 子菜单除外。

### 9.3 Food

按钮：

- `MEAT`
- `VIT`
- `BACK`

点按 `MEAT` 或 `VIT` 立即投喂，显示 1 秒以内短反馈。投喂后停留在 Food，方便连续补心。满心投喂记录 overfeed，并显示 `FULL` / `OVER` 类短消息。

### 9.4 Train

目标实现为一屏短小游戏：

1. 进入训练态，显示力量槽或目标区。
2. 用户点按停止。
3. 状态机判定 `OK` / `MISS`。
4. 成功训练才补充力量、累计有效训练/effort，并降低体重。
5. 结果停留约 1 秒，可点按跳过。

当前实现可先保留直接 `train` action，但首版验收前应替换为小游戏入口。

### 9.5 Battle / Quest

流程：

1. Preview：显示当前 Quest 敌人 sprite、名称、属性、Power、区域/回合。
2. Confirm：点按开始，返回取消。
3. Loop：我方/敌方短回合 HIT/MISS。
4. Result：显示 WIN/LOSE、推进信息、伤病提示。

点击 `BATTLE` 默认挑战当前 Quest 敌人，不在手表上翻大 Quest 表。

### 9.6 Status / Data

Status 显示 6-8 行短数据：

- 名称、阶段、年龄、体重。
- HUN / POW。
- Effort / Care Mistake。
- Battle / Win Rate。
- Quest。
- Poop / Overfeed。

Data 显示更短概要，可先复用短消息：`CM x EF y WR z%`。后续如做详细页，仍应避免长列表和横向表格。

### 9.7 Death / New Egg

死亡时不显示普通菜单，只显示死亡画面和 `NEW EGG`。点按后应进入确认，确认后调用 `reset` 创建新 Digitama。

### 9.8 Save Recovery

存档损坏时进入恢复页：

- `SAVE ERR`
- `NEW EGG`

若可以读取部分字段，后续可提供 `CONTINUE`，但首版可保守重建。

## 10. Action 设计

建议 action 枚举：

```js
const ACTIONS = {
  MEAT: 'meat',
  VITAMIN: 'vitamin',
  TRAIN_START: 'trainStart',
  TRAIN_RESOLVE: 'trainResolve',
  BATTLE_PREVIEW: 'battlePreview',
  BATTLE_START: 'battleStart',
  BATTLE_RESOLVE: 'battleResolve',
  TOILET: 'toilet',
  MED: 'med',
  LIGHT: 'light',
  COLD: 'cold',
  DATA: 'data',
  RESET: 'reset'
}
```

当前 `applyAction` 已支持 `meat`、`vitamin`、`train`、`battle`、`toilet`、`med`、`light`、`cold`、`data`、`reset`。为了满足 UI 原型，后续应把训练与战斗拆成开始、确认、结算几步，避免点击后只切消息。

所有 action 必须先做状态合法性判断：

- dead：除 reset/new egg 外全部阻止。
- cold：除 cold/resume、status/data/back 外全部阻止。
- asleep：除 light/status/data/med/back 外阻止或视为唤醒/睡眠干扰。
- sick/injured：阻止 battle。
- strength <= 0：阻止 train/battle。
- stage 太低：阻止 battle。

## 11. 战斗设计

战斗目标是稳定、短促、可解释。

命中率：

```text
stageBonus = III:5, IV:8, V:15, VI:25
totalPower = playerPower + stageBonus
attributeModifier = Vaccine > Virus > Data > Vaccine, +/-5
hitrate = (totalPower * 100) / (totalPower + opponentPower) + attributeModifier
hitrate = clamp(hitrate, 0, 100)
```

Quest 推进：

- 使用 `state.questArea` 和 `state.questRound` 定位当前敌人。
- 胜利后推进 round；区域末尾胜利后推进 area；最终区域完成后增加 `questClears`。
- 失败默认保留当前位置并记录失败；可按资料补充受伤概率。

战斗结果显示：

- `Qx-y WIN 62%`
- `Qx-y LOST 41%`
- 结果短暂停留 1-2 秒，点按可跳过。

## 12. 进化设计

进化由数据驱动：

- `PET_TIMING` 定义每个阶段的成长时间。
- `nextEvolutionFor(state)` 根据当前形态、版本、阶段和状态选择下一形态。
- `scheduleEvolution(state, now)` 设置下一次进化时间。

Ver.5 首版要求：

- `version` 固定 `Ver.5`。
- Digitama 到 Baby I 必须可达。
- 至少一条 Stage VI 路线必须可达。
- Care Mistake、effort、overfeeds、battles、winRatio 能影响候选选择。
- 每次进化后重置阶段性风险字段：poop、sick、injured、必要时重置阶段训练/失误计数。

当前候选选择可先用质量分数近似，但 M2 需要替换为逐条校对后的 Ver.5 进化条件。

## 13. 存档设计

存档键建议继续使用 `dmc-vpet-state-v2`，但内容需加入：

- `schemaVersion`
- `createdAt`
- `updatedAt`
- `lastSafeAt` 可选，用于异常恢复

保存时机：

- 新建存档后。
- 每次关键 action 后。
- 前台运行每 30 秒以内。
- `onHide` / `onDestroy` 前。
- 进化、死亡、Cold Mode 切换后立即保存。

读取失败：

- JSON 解析失败：进入 recovery 或新建。
- 缺字段：`hydrateState` 补齐。
- 版本非 Ver.5：归一化为 Ver.5，并保留可迁移字段。

## 14. 视觉设计

主视觉关键词：

- 黑底 / 暗绿 LCD。
- 硬边像素 sprite。
- 低帧待机动画。
- 短标签按钮。
- 高对比红色警告。
- 心数、短条、缩写表达数值。

禁止方向：

- 现代手游大卡片。
- 长说明文案堆主屏。
- 装饰性渐变和大圆角。
- 过度弹性动效。
- 首屏大面积仪表盘。

REDMI Watch 6 布局建议：

```text
432 x 514 physical px
480 designWidth

top shell       54 px
LCD scene      300 px
tap/message     26-40 px
mode label      18 px
action area     78-120 px
safe padding    14-18 px
```

触摸目标建议不小于 44 px。按钮文字用 3-7 个字符短标签，固定高度，避免文字导致布局跳动。

## 15. 当前实现差距

从现有工程看，以下项目需要在实现阶段对齐：

| 项目 | 当前情况 | 目标 |
| --- | --- | --- |
| README 操作说明 | 仍提到 `VER+` | 首版固定 Ver.5，不出现版本切换 |
| Command 菜单 | 当前菜单缺少 `COLD`，另有 `DATA` | Command 应包含 `COLD`，并按状态裁剪动作 |
| 训练 | 直接执行 `train` | 改为 3 秒内短小游戏 |
| 战斗 | 直接执行并展示 5 秒结果 | 增加 Preview / Confirm / Loop / Result |
| 重置 | 死亡页直接 `NEW EGG`，状态页 `RESET` | 危险操作需二次确认 |
| 存档 schema | 存档键有版本，但 state 内无 `schemaVersion` | 加入 schemaVersion 和迁移 |
| 时间跳变 | 尚无 `TIME?` 流程 | 大幅时间差进入恢复/确认 |
| 菜单超时 | 尚未实现自动收起 | 5-8 秒无操作回 Home |
| Vibration | manifest 声明了 vibrator | 呼叫、战斗、进化等关键节点调用 |

## 16. 验收标准

### 16.1 功能

- 首次打开创建 Digitama，并能孵化为 Ver.5 Baby I。
- FOOD 能补饥饿/力量，满心继续投喂记录 overfeed。
- TRAIN 通过小游戏完成，并影响力量、体重、effort 和进化。
- BATTLE 挑战当前 Quest 敌人，按战力和属性计算胜负。
- WC/MED 能清理排泄物和治疗异常。
- CALL 与 Care Mistake 能触发、累计并影响状态。
- Cold Mode 能暂停消耗、呼叫、排泄和进化，退出后不补扣。
- 死亡后只能重新孵蛋。
- 退出应用再进入，存档保持。
- UI 不出现 Ver.1-4 选择或 `VER+`。

### 16.2 设备

- 432 x 514 模拟器无文字溢出、按钮重叠、sprite 丢失。
- 触摸按钮可稳定点击，常用动作 3-5 秒内完成。
- 首页 FMP <= 2000 ms。
- 主屏操作响应 <= 100 ms。
- 连续运行 30 分钟无明显卡顿或内存持续上涨。
- `onHide` 后定时器停止，`onShow` 通过时间差结算。
- 首版无网络请求。

### 16.3 数据

- Ver.5 形态名单与资料源一致，目标 19 只可获得形态。
- Ver.5 Quest 区域、回合、敌人、Power、sprite 校对完成。
- Ver.5 至少一条 Baby I 到 Stage VI 路线可达。
- sprite 路径全部存在且为 PNG。
- 战斗公式有 smoke test 或单元测试覆盖。

### 16.4 画风

- 主屏第一眼像 DMC Ver.5 宠物机，而不是通用手表 App。
- sprite 保持硬边，不拉伸模糊。
- 主屏使用 LCD 场景、短标签按钮、心数和高对比状态。
- 动画低帧、短促、可跳过。

## 17. 实施顺序

### P0 首页与菜单对齐

- 移除 UI 中的版本切换入口和 README 的 `VER+` 描述。
- Command 菜单补 `COLD`。
- 实现菜单 5-8 秒自动收起。
- 按 dead/cold/sleep/sick/poop/call 状态裁剪或高亮动作。

### P1 状态机与存档加固

- 加 `schemaVersion`。
- 加时间跳变保护。
- 加 reset 二次确认。
- 加关键节点振动。
- 补 `onHide` 保存。

### P2 照顾动作演出

- FOOD 进食 1 秒短反馈。
- WC 清理闪烁。
- MED 状态旗标消失反馈。
- LIGHT/SLEEP 专属菜单。
- Cold Mode 专属菜单。

### P3 训练与战斗

- Train 小游戏。
- Battle Preview / Confirm / Loop / Result。
- 结果可点按跳过。

### P4 Ver.5 数据精确化

- 人工校对 Ver.5 进化条件。
- 校对 Quest 数据。
- 加强 `validate-data.mjs`：版本固定、Ver.5 可达性、sprite 存在。
- 扩展 `smoke-test-game.mjs`：进化、Cold Mode、战斗、死亡、存档兼容。

## 18. 参考文件

- `src/pages/index/index.ux`
- `src/common/utils/gameEngine.js`
- `src/common/utils/gameStore.js`
- `src/common/utils/calculator.js`
- `src/common/data/vpetEvolution.js`
- `src/common/data/quest.js`
- `tools/validate-data.mjs`
- `tools/smoke-test-game.mjs`
