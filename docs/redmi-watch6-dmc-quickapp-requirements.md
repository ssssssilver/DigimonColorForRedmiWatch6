# Digital Monster COLOR 红米 REDMI Watch 6 快应用需求分析

版本：0.3  
日期：2026-06-03  
目标平台：REDMI Watch 6 / Xiaomi Vela JS 快应用  
应用定位：Digital Monster COLOR Ver.5 风格的手表端离线电子宠物快应用

## 1. 背景与目标

本项目希望把 Digital Monster COLOR Ver.5 的核心体验迁移到 REDMI Watch 6 上，以 Xiaomi Vela JS 快应用形式运行。目标不是做一个百科浏览器，而是在手表上复刻“养成、照顾、训练、战斗、进化、暂停、死亡/重开”的电子宠物主循环，让用户可以像使用腕上宠物机一样短频快地互动。

Digital Monster COLOR 是初代 Digital Monster 的彩色复刻版本。Wikimon 将其描述为类似战斗型 Tamagotchi 的虚拟宠物设备，拥有最多约 20 只可获得数码兽，并从 Digitama 孵化后经历 Baby I 到 Ultimate 等成长阶段。相比早期设备，它强化了训练速度和用户支持功能，例如 Cold Mode 与 Backup System，并采用可充电电池。  

移植目标：

- 在 REDMI Watch 6 的 432 x 514 矩形屏上提供完整可玩的宠物机界面。
- 首版只支持 Digital Monster COLOR Ver.5 的养成、进化与 Quest 战斗。
- 玩法数据本地化，离线运行，不依赖网络。
- 使用 Vela JS 快应用的原生组件、存储和振动能力完成体验。
- 用于个人学习和本地验证，不将授权问题作为需求约束。
- 视觉画风尽量与原版 Digital Monster COLOR Ver.5 保持一致，包括像素 sprite、LCD 宠物机场景、按钮文案、低帧动画节奏和高对比色块。
- 玩法规则尽量贴合原版，操作方式针对手表触屏做转译，避免把实体机三键菜单原样硬搬到小屏上。

## 2. 资料理解摘要

### 2.1 Digital Monster COLOR 内容范围

Wikimon 页面列出的主要版本如下，但本项目只纳入 Ver.5：

| 版本 | 发售时间 | 可获得数量 | 本项目范围 |
| --- | --- | ---: | --- |
| Digital Monster COLOR Ver.1 | 2023-02 | 18 | 不做 |
| Digital Monster COLOR Ver.2 | 2023-02 | 18 | 不做 |
| Digital Monster COLOR Ver.3 | 2023-09 | 20 | 不做 |
| Digital Monster COLOR Ver.4 | 2023-09 | 19 | 不做 |
| Digital Monster COLOR Ver.5 | 2023-09 | 19 | 必做 |
| Digital Monster COLOR Digimon Xros Wars 15th Edition | 2026-02 | 28 + 事件招募 | 不做 |
| Monster Hunter 20th Edition | 2025-02 | 38 | 不做 |
| Godzilla 70th Edition | 2025-08 | 34 | 不做 |
| Ultraman 60th Edition | TBD | TBD | 不做 |

Ver.5 的进化页面按 Digitama、Baby I、Baby II、Child、Adult、Perfect、Ultimate、Ultimate+ 组织。主需求应把 Ver.5 内容结构化为阶段、物种、属性、战力、进化来源、进化去向和条件。

Ver.5 代表线路包括 Zurumon、Pagumon、Gazimon、Gizamon、Dark Tyranomon、Cyclomon、Devidramon、Tuskmon、Flymon、Deltamon、Raremon、Metal Tyranomon、Nanomon、Ex-Tyranomon、Mugendramon、Raidenmon、Gaioumon、Millenniumon、Chaosdramon 等。

Xros Wars、Monster Hunter、Godzilla、Ultraman 等特别版本不进入本项目范围。

### 2.2 玩法机制拆解

首版快应用需要覆盖以下核心机制：

- 孵化：从 Digitama 开始，孵化为 Baby I。
- 成长：按真实时间或调试时间推进进化计时。
- 状态：年龄、体重、饥饿、力量、努力值、DP/能量、战斗数、胜率、Care Mistake。
- 照顾：喂食、训练、清理排泄物、治疗、关灯睡眠。
- 呼叫：饥饿/力量为空、睡眠未关灯等场景触发提醒；未及时处理累计 Care Mistake。
- 冷冻：Cold Mode 暂停年龄、消耗、呼叫与进化计时。
- 备份：Backup/Change 可作为后续功能，首版先用 Cold Mode 满足暂停需求。
- 战斗：Quest Mode 本地战斗，按属性、战力、命中率计算胜负。
- 进化：基于阶段、训练、Care Mistake、战斗数、胜率等条件选择下一形态。
- 死亡：长期忽视、伤病未处理、Care Mistake 过多等导致死亡，允许重新孵蛋。

### 2.3 REDMI Watch 6 设备约束

小米官方规格显示 REDMI Watch 6 具备：

- 2.07 英寸 AMOLED 矩形屏。
- 分辨率 432 x 514，PPI 324。
- 60 Hz 刷新率，峰值亮度 2000 nits。
- 550 mAh 电池。
- 约 512 MB 本地可用存储，实际可用容量会受系统和预装程序影响。
- 支持扬声器、麦克风、蓝牙 5.4、振动、GNSS、心率/血氧、加速度、陀螺仪、环境光等硬件。

Vela 多屏适配表中 REDMI Watch 5 为同分辨率 432 x 514、PPI 324、屏幕宽度 216 DP、长宽比约 0.8。REDMI Watch 6 的官方屏幕规格与 Watch 5 一致，因此首版可按 432 x 514 / 216 DP 的矩形手表目标适配，但仍需在真机或对应模拟器上确认。

### 2.4 Vela 快应用约束

Xiaomi Vela JS 应用是面向穿戴设备的轻量应用形态，支持 JavaScript、MVVM、声明式 UI 和统一组件/API。项目通常由 `manifest.json`、`app.ux`、页面 `.ux`、公共样式、脚本和资源组成。

关键技术约束：

- 页面使用 `.ux`，由 `template`、`style`、`script` 三部分组成。
- `template` 只能有一个根节点。
- 样式基于 CSS Flexbox，尺寸会按基准宽度缩放；默认基准宽度为 480 px。
- `script` 支持 ES5/ES6，但不是 Node 环境，不能引用 Node 原生模块。
- 需要在 `manifest.json` 中声明应用包名、名称、图标、版本、路由和所需系统能力。
- 多数系统接口需要在 `features` 中声明后才能调用。
- 常用组件包括 `div`、`scroll`、`stack`、`swiper`、`text`、`image`、`image-animator`、`progress`、`input`、`picker`、`switch`、`slider` 等。
- 可用接口包括 `system.router`、`system.storage`、`system.file`、`system.network`、`system.vibrator`、`system.battery`、`system.brightness`、`system.audio`、`system.prompt` 等，具体以设备 API Level 为准。
- 应用切到后台通常会停止运行，后台运行需要合理理由、接口声明和审核；本项目首版不申请后台常驻。
- 验收标准要求首页首屏渲染完成时间 FMP 不超过 2000 ms。

## 3. 产品定位

### 3.1 用户画像

- 怀旧玩家：希望在手表上随时养一只像素宠物。
- DMC Ver.5 玩家：熟悉 Ver.5 进化和 Quest，想要一个便携模拟体验。
- 开发/学习用户：用于研究 Vela 快应用、小屏游戏状态机和离线资源打包。

### 3.2 首版产品形态

首版定义为“单机离线宠物机本体”：

- 打开应用即进入宠物机主屏。
- 不设置登录、云端、商城、排行榜。
- 不依赖手机伴侣应用。
- 不做复杂百科检索，图鉴/手册只作为游戏内辅助信息。
- 不提供版本切换；当前存档固定为 Ver.5。

### 3.3 玩法适配原则

本项目的玩法取舍标准是“规则贴近原版，操作适配手表”。

必须贴近原版的部分：

- 成长阶段、进化时间、Care Mistake、训练计数、战斗数、胜率、过量喂食、睡眠/关灯、Cold Mode 等核心规则。
- Ver.5 的形态名单、进化条件、Quest 区域和敌人数据。
- 主循环节奏：短时间照顾、长时间等待、错过照顾会积累后果。
- 反馈节奏：呼叫、训练、战斗、进化、死亡都用短促反馈，不做现代手游式长演出。

需要为手表转译的部分：

- 实体机的 A/B/C 三键菜单不原样照搬；手表默认使用直接点按操作。
- 主屏保留原版图标菜单感，但常用行为应一到两次点按完成。
- 有二级菜单的功能只保留必要分支，例如 `FOOD -> MEAT/VIT`、`STATUS -> DATA/RESET`。
- 返回优先使用系统返回或左滑返回；危险操作使用长按或二次确认。
- 训练、战斗等小游戏保留原版判定逻辑，但输入改成适合触屏的点按、长按或滑动。
- 所有玩法动作都应支持单手短时操作，单次照顾流程目标控制在 3-5 秒内。

### 3.4 非目标

- 不做官方 Digimon 产品声明。
- 不做公开商用发布；本项目按个人学习用途处理，不把授权问题纳入需求阻塞项。
- 不复刻实体设备的红外/金属触点通信。
- 不实现 Ver.1-4、Xros Wars Mode Change、DigiXros、合作版本特殊系统。
- 不要求应用在后台持续运行；首版通过前台计时和再次打开时的时间差结算实现成长。

## 4. 功能需求

### FR-01 宠物生命周期

应用必须支持从新蛋开始的完整生命周期：

- 新建存档时生成 Digitama。
- 到达孵化时间后进入 Baby I。
- 每次进化后重置本阶段 Care Mistake、训练数、过量喂食、受伤等阶段性计数。
- 死亡后显示墓碑/数据化状态，并提供重新孵蛋入口。

时间配置：

- 生产模式建议使用 DMC 原始节奏：Digitama 约 8 秒，Baby I 约 10 分钟，Baby II 约 12 小时，Child 约 24 小时，Adult 约 36 小时，Perfect 约 48 小时。
- 开发/演示模式可提供加速时间，但不能混入正式默认配置。
- 使用真实时间差推进状态，应用关闭期间再次打开时需要结算离线时间。
- Cold Mode 状态下不推进消耗、呼叫和进化计时。

### FR-02 状态与数值

每只宠物至少维护：

- `petKey`：当前形态。
- `version`：固定为 Ver.5，用于数据兼容和后续扩展，不在 UI 暴露版本切换。
- `stage`：Digitama / I / II / III / IV / V / VI / VI+。
- `bornAt`、`lastTickAt`、`nextEvolutionAt`。
- `hunger`、`strength`：0-4 心。
- `effort`：训练累计努力值。
- `weight`：体重。
- `careMistakes`：照顾失误。
- `overfeeds` / `proteinOverdose`：过量喂食相关计数。
- `battles`、`wins`、`winRatio`。
- `poop`、`sick`、`injured`。
- `asleep`、`lightsOff`、`cold`、`dead`。
- `questArea`、`questRound`、`questClears`。

状态页需要能快速查看年龄、阶段、进化倒计时、饥饿、力量、努力值、Care Mistake、战斗数、胜率、Quest 进度和版本。

### FR-03 喂食

喂食菜单至少提供：

- Meat：增加饥饿心，增加体重。
- Protein/Vitamin：增加力量心，增加体重；可影响能量和 overdose。

需求：

- 心满后继续喂食应记录 overfeed。
- 过量喂食可影响进化或受伤概率。
- 宠物死亡、冷冻或睡眠状态下不应直接喂食；若允许叫醒，需要记录睡眠干扰。
- 手表操作采用 `FOOD` 二级菜单，点按 `MEAT` 或 `VIT` 立即投喂，并显示 1 秒以内的进食动画。
- 连续投喂不需要重复进入菜单；投喂后保留在 `FOOD` 子菜单，方便用户快速补满，但满心继续投喂仍按原版规则记录过量。
- 食物菜单必须有明显 `BACK`，也支持系统返回或左滑返回主屏。

### FR-04 训练

训练用于提升力量、努力值，并降低体重。

首版实现：

- 默认实现手表适配的 Ver.5 原版训练小游戏：点击 `TRAIN` 后出现短倒计时/力量槽，用户在目标区点按停止。
- 判定逻辑贴近原版：停在成功区计为训练成功，失败区计为训练失败；成功才补充力量心并计入有效训练。
- 每 4 次训练增加 1 个 effort heart。
- 成功训练补充力量心。
- 训练计数参与进化条件。
- 训练动画表现为 Ver.5 风格的短促像素演出，例如破坏树木或对应 Ver.5 训练画面转译。
- 单次训练从点击 `TRAIN` 到结果出现目标控制在 3 秒内，结果动画可点按跳过。
- 调试模式可以保留一键训练，但学习版默认入口必须是小游戏训练，不用一键替代。

### FR-05 排泄与治疗

应用需要定时生成排泄物：

- Baby I 可使用更短周期，后续阶段使用更长周期。
- 排泄物达到阈值后进入 sick 或 injured 状态。
- WC 操作清理排泄物。
- MED 操作治疗 sick/injured。

需求：

- 伤病未处理达到死亡阈值时死亡。
- 伤病状态在主屏有明确视觉提示。
- 伤病和排泄物本身不直接等同于 Care Mistake，但未处理会持续产生风险。

### FR-06 呼叫与 Care Mistake

以下场景应触发呼叫：

- 饥饿为空。
- 力量为空。
- 排泄物达到危险阈值。
- 伤病未处理。
- 睡眠时未关灯。

呼叫表现：

- 主屏显示 CALL/WARN 标识。
- 前台状态可调用 `system.vibrator` 做短振动提醒。
- 不依赖后台常驻；若应用不在前台，再次打开时按真实时间差结算。

Care Mistake 判定：

- 呼叫后在宽限时间内未处理，累计一次 Care Mistake。
- Care Mistake 影响 Child/Adult 路线，并影响 Stage VI 进化资格。

### FR-07 睡眠、灯光与 Cold Mode

睡眠/灯光：

- 宠物可在设定时间进入睡眠。
- 睡眠后用户应关灯，否则产生呼叫和 Care Mistake。
- 睡眠中进行喂食、训练、战斗可视为叫醒或睡眠干扰。

Cold Mode：

- 用户可手动进入/退出 Cold Mode。
- Cold Mode 下暂停年龄、进化、饥饿/力量消耗、排泄、呼叫。
- Cold Mode 状态必须被持久化，防止退出应用后继续扣数值。

Backup：

- 首版可不做。
- 后续可支持 1 个 backup 槽位，backup 中的宠物等同 Cold Mode。

### FR-08 战斗与 Quest

首版战斗采用本地 Quest Mode：

- 只维护 Ver.5 Quest 区域、回合、敌人、Boss、背景解锁信息。
- 宠物达到 Stage III 及以上且具备 DP/能量时才可战斗。
- 每次战斗计入进化战斗数。
- 胜利推进当前回合/区域。
- 失败处理按 Ver.5 规则配置；若资料不足，首版可先保留当前回合并记录失败。
- 手表上点击 `BATTLE` 后直接挑战当前 Quest 敌人，不要求用户在小屏上翻大型 Quest 表。
- 战斗前用一屏显示敌人 sprite、名称、属性、Power 和当前区域/回合，点按确认开战；长按或返回取消。
- 战斗过程保留原版短回合感：我方/敌方交替攻击，显示 HIT/MISS、胜负和伤病结果。
- 战斗结果页停留 1-2 秒，点按可跳过；胜利后自动推进 Quest 进度。
- Quest 区域选择放在 `DATA` 或后续 `QUEST` 子页中，不放到主屏打断照顾节奏。

命中率计算：

- 总战力 = 基础 Power + 满力量阶段加成 + Traited Egg 加成。
- 属性克制：Vaccine > Virus > Data > Vaccine；Free 无优劣。
- 命中率 = `(playerPower * 100) / (playerPower + opponentPower) + attributeModifier`，并限制在 0-100。
- 一场战斗可用“三次命中先到”或简化随机胜负模型，首版需保持稳定可解释。

暂不支持：

- 与实体 DMC 设备通信。
- 与其他快应用用户联网对战。

### FR-09 进化系统

进化必须数据驱动：

- 只维护 Ver.5 可进化形态和条件。
- 形态数据包括 key、名称、阶段、属性、基础 Power、sprite、版本。
- 进化条件包括 careMistakes、training、overfeeds、sleepDisturbances、battles、winRatio、jogress、特殊条件。
- 当多个候选满足条件时，按原设备优先级或配置权重选择。

首版范围：

- Ver.5 路线必须准确。
- 不做 Ver.1-4 的候选进化和版本切换。

验收前必须能证明：

- Ver.5 可从 Digitama 推进到至少 1 条 Stage VI 路线。
- Care Mistake、训练和战斗数能改变进化结果。
- Cold Mode 不会导致提前进化。

### FR-10 存档

存档使用 Vela `system.storage`：

- 首次进入创建存档。
- 每次关键操作后保存。
- 前台定时自动保存，建议 30 秒以内。
- 应用隐藏/销毁前保存。
- 存档需要 `schemaVersion`，为后续迁移预留。

异常处理：

- 存档损坏时进入恢复页，允许新建存档。
- 系统时间大幅跳变时，需要限制单次离线结算上限或提示用户确认。
- 低电/强退后再次打开应尽量恢复最近状态。

### FR-11 UI 与交互

主屏结构：

- 顶部：版本、名称、年龄/Quest。
- 中部：LCD 风格宠物场景、sprite、排泄/伤病/CALL 状态。
- 底部：饥饿/力量心、消息、操作按钮。

操作按钮：

- 主菜单：STATUS、FOOD、TRAIN、BATTLE、WC、MED、LIGHT、COLD、DATA。
- FOOD 子菜单：MEAT、VIT、BACK。
- STATUS 子菜单：BACK、DATA、RESET。不要提供 `VER+`，避免偏离 Ver.5-only 范围。

手表操作模型：

- 默认采用直接点按，不要求用户像实体机一样用 A 键循环图标、B 键确认、C 键取消。
- 为保留原版感觉，主菜单按钮可做成一排/两排图标槽或九宫格，但每个动作都可直接点按执行。
- 短按：执行当前按钮或确认。
- 长按：用于危险操作或需要确认的操作，例如 RESET、清空存档。
- 左滑/系统返回：关闭二级菜单或回到主屏。
- 上下滑动：仅用于状态、手册、图鉴等信息页，不用于主照顾动作。
- 可选提供“Classic Mode”：模拟 A/B/C 选择逻辑，供怀旧体验；默认不启用，避免影响手表可用性。

REDMI Watch 6 适配：

- 目标屏幕 432 x 514。
- 以 480 designWidth 编写样式时，要在真机上检查缩放后触摸区域。
- 触摸目标建议不小于 44 px。
- 避免横向大表格。
- 文本短句化，重要信息优先使用图标、缩写和固定位置。
- 9 宫格按钮需要固定高度，防止文字导致布局跳动。
- 常用照顾动作必须能在主屏一屏内完成，不通过长列表查找。
- 二级菜单深度不超过 1 层，避免手表上迷路。

### FR-12 原版画风

画风目标是“像在手表里运行一台 Digital Monster COLOR Ver.5”，而不是现代化宠物游戏。

必须保留：

- Ver.5 原版像素 sprite 的比例、硬边缘和低帧动画感。
- 主画面使用类似实体宠物机 LCD 的中央场景区，宠物在场景内左右移动或待机。
- 使用 Ver.5 清绿色/暗色机身气质作为主视觉参考，可在黑色手表屏上转译为暗背景 + 绿色、黄绿、红色告警点缀。
- 按钮文案使用电子宠物机式短标签，如 `STATUS`、`FOOD`、`TRAIN`、`BATTLE`、`WC`、`MED`、`LIGHT`、`COLD`。
- 数值用心形/短条/缩写表达，减少现代手游式大面板。
- 战斗、进化、死亡使用短促像素动画和文字提示，节奏接近原设备。

避免：

- 卡通大插画、现代扁平宠物养成 UI、渐变营销风、复杂 3D 或过度动效。
- 大面积圆角卡片和现代 App 风格信息流。
- 长篇说明文堆在主屏。

### FR-13 资源与音效

资源要求：

- sprite、本地背景、图标全部打包在应用内。
- `image src` 使用直接变量或静态路径，不使用字符串拼接路径。
- 图片应压缩为适合手表显示的小尺寸 PNG/WebP。
- 首版只打包 Ver.5 资源，RPK 目标小于 3 MB。

音效：

- 首版可只使用振动和文字提示。
- 若加入音频，需要确认 Vela `system.audio` 支持和包体大小。

学习用途说明：

- 本项目用于个人学习，不把授权问题作为需求约束。
- 为了贴近原版，学习版允许使用 Ver.5 名称、像素 sprite 和原版风格 UI 作为参考。

## 5. 非功能需求

### NFR-01 性能

- 首页 FMP <= 2000 ms。
- 主屏操作响应 <= 100 ms。
- 战斗/进化动画不阻塞主线程超过 16 ms 连续帧预算。
- 不一次性渲染长列表；图鉴、手册、Quest 页面后续如启用需分页或分块。

### NFR-02 内存

- 与 UI 无关的大对象不要放入 ViewModel。
- 长列表和大数据放在模块常量或按需导入。
- 状态更新尽量原地修改，减少频繁创建大对象。
- 动画帧和定时器在 `onHide` / `onDestroy` 中清理。

### NFR-03 电量

- 主循环 tick 仅在前台运行。
- `onHide` 停止 `setInterval`。
- 再次 `onShow` 时用时间差结算，不后台常驻。
- 只在呼叫、战斗结果、进化等关键时刻振动。

### NFR-04 稳定性

- 所有用户操作都要在 dead/cold/asleep 状态下做合法性判断。
- 重复点击按钮需要防抖，尤其是 BATTLE、RESET。
- 网络异常不应影响首版核心功能，因为首版不依赖网络。
- JS 异常需要降级为提示或新建存档，不应卡死在空白页。

### NFR-05 可维护性

- 玩法状态机与 UI 分离。
- 数据、公式、存储、页面展示分层。
- 所有 DMC 规则都集中在 `common/data` 和 `common/utils`，页面不硬编码规则。
- 数据抽取脚本与校验脚本保留来源和生成时间。

## 6. 技术方案建议

### 6.1 工程结构

建议结构：

```text
src/
  manifest.json
  app.ux
  pages/
    index/
      index.ux
    manual/
    digimonList/
    digimonDetail/
    evolution/
    quest/
    calculator/
  common/
    data/
      digimon.js
      quest.js
      manual.js
      vpetEvolution.js
    utils/
      gameEngine.js
      gameStore.js
      calculator.js
      data.js
    style.css
    logo.png
    digimon/
tools/
  extract-humulos-dmc.mjs
  validate-data.mjs
  smoke-test-game.mjs
  start-vela-debug.mjs
```

首版发布运行可只注册 `pages/index`，其他页面作为数据校验和后续功能保留。

### 6.2 Manifest 能力

首版建议声明：

- `system.storage`：本地存档。
- `system.vibrator`：呼叫、战斗、进化反馈。
- `system.router`：后续页面切换。
- `system.configuration`：读取配置或设备能力。

暂不声明：

- `system.fetch`：首版离线，不访问网络。
- 后台运行相关能力：首版不申请。
- `system.audio`：除非音效进入明确范围。

### 6.3 状态机接口

推荐核心接口：

```js
newGame(now)
hydrateState(raw, now)
tickState(state, now)
applyAction(state, action, now)
getDisplayModel(state)
calculateHitrate(player, enemy)
```

页面只负责：

- 加载存档。
- 每秒前台刷新。
- 渲染 `displayModel`。
- 把按钮事件传给 `applyAction`。
- 保存变更。

### 6.4 数据校验

需要校验：

- 每个 Digimon 的 key 唯一。
- sprite 路径存在。
- version 固定为 Ver.5。
- stage 合法。
- attribute 属于 Vaccine/Data/Virus/Free。
- evolution 的 from/to 均存在。
- Quest 敌人均能映射到 Digimon 或 enemy 表。
- Ver.5 至少有一条从 Baby I 到 Stage VI 的可达路线。

## 7. 适配方案

### 7.1 REDMI Watch 6 主适配

主适配参数：

- 屏幕：432 x 514。
- 设计基准：Vela 默认 480 designWidth。
- 建议内容安全宽度：约 384-400 px。
- 顶部状态区：40-52 px。
- LCD 场景区：220-260 px。
- 消息区：44-56 px。
- 操作区：剩余空间，按钮固定高度。

### 7.2 多屏兼容

虽然目标是 REDMI Watch 6，但应避免写死所有像素：

- 使用百分比宽度和 flex。
- 主屏中部使用固定比例的 LCD 区域。
- 圆屏时减少顶部左右文字，优先居中显示宠物和状态。
- 对 466 x 466 圆屏和 432 x 514 方屏至少做模拟器截图验证。

## 8. 验收标准

### 8.1 功能验收

- 首次打开能创建新蛋并孵化。
- 喂食能改变饥饿/力量/体重/overfeed。
- 训练能改变力量、努力值、体重和训练计数。
- 训练默认通过手表适配小游戏完成，不用一键占位替代。
- Quest 战斗能根据战力和属性计算胜负，并推进进度。
- Quest 战斗能通过点按确认、返回取消完成，用户不需要在小屏翻表。
- Ver.5 可从 Baby I 进化到 Stage VI。
- 应用不出现 Ver.1-4 的版本选择或 `VER+` 操作。
- Cold Mode 能暂停并恢复。
- WC/MED 能处理排泄和伤病。
- Care Mistake 能被触发并影响状态。
- 死亡后能重新孵蛋。
- 退出应用再进入，存档保持。

### 8.2 设备验收

- REDMI Watch 6 / 432 x 514 模拟器无文字溢出、按钮重叠、sprite 丢失。
- 首屏 FMP <= 2000 ms。
- 连续运行 30 分钟无明显卡顿或内存持续上涨。
- 息屏/亮屏或应用切前后台不会重复发起不必要请求；首版应无网络请求。
- 所有触摸按钮在真机上可稳定点击。
- 喂食、训练、清理、治疗、开关灯等常用照顾动作可在 3-5 秒内完成。
- 二级菜单深度不超过 1 层，返回路径清晰。

### 8.3 数据验收

- Ver.5 名单数量与资料源一致，目标为 19 只可获得数码兽。
- Ver.5 进化路线和关键条件人工校对完成。
- Ver.5 Quest 敌人、区域和回合数据人工校对完成。
- 战斗公式有单元测试。
- 存档 schema 有版本号。

### 8.4 画风验收

- 文档中标注资料来源。
- 主屏第一眼能识别为 Digital Monster COLOR Ver.5 风格，而不是通用现代手表 App。
- sprite 保持像素硬边，不被抗锯齿、滤镜或拉伸破坏。
- 主视觉以 LCD 宠物机场景、短标签按钮和高对比状态提示为核心。
- 玩法交互保留原版宠物机短反馈节奏，但输入方式适配手表点按/长按/返回。
- 学习用途下不把授权问题作为验收项。

## 9. 里程碑

### M0 范围确认

- 完成本需求文档。
- 确认项目只做 Digital Monster COLOR Ver.5。
- 确认项目用途为个人学习。
- 确认 REDMI Watch 6 是否可安装当前 Vela 快应用包。
- 确认使用原版风格 sprite 和 UI 参考。

### M1 Ver.5 可玩核心

- 完成主屏、存档、孵化、喂食、训练、排泄、治疗、Cold Mode。
- 完成手表适配的 Ver.5 训练小游戏。
- 完成 Ver.5 基础进化。
- 完成 Quest 简化战斗。
- 完成 smoke test。

### M2 Ver.5 数据精确化

- 补齐 Ver.5 名单、sprite、Quest、阶段候选。
- 补齐 Ver.5 准确进化条件。
- 加数据校验。

### M3 手表体验打磨

- REDMI Watch 6 适配。
- 振动反馈。
- 文本、按钮、防误触优化。
- 原版画风对齐：sprite 比例、LCD 场景、短标签、低帧动画。
- 手表操作对齐：直接点按、长按确认、系统返回/左滑返回、二级菜单不超过 1 层。
- FMP 和内存优化。

### M4 学习版打包

- 生成 release rpk。
- 真机验收。
- 记录真机安装和调试步骤。
- 保留资料来源和数据抽取说明，方便后续学习复盘。

## 10. 风险与应对

| 风险 | 影响 | 应对 |
| --- | --- | --- |
| REDMI Watch 6 快应用安装链路不明确 | 无法真机运行 | 先用 Watch 5 同分辨率模拟器验证，再确认真机开发者模式/发布流程 |
| Vela 后台限制 | 无法实时后台提醒 | 不申请后台；用离线时间差结算；前台才振动 |
| Ver.5 进化条件复杂 | 结果不准 | 数据驱动，先做可达性，再逐条校对 Ver.5 条件 |
| 包体过大 | 安装或启动慢 | 压缩 sprite，首版只打包必要资源 |
| 时间跳变 | 宠物异常死亡或提前进化 | 检测大幅时间差，设置结算上限或提示 |
| 小屏信息拥挤 | 操作困难 | 单屏单任务，固定按钮尺寸，减少长文案 |
| 原版画风被现代 UI 稀释 | 学习目标偏离 | 以 Ver.5 sprite、LCD 场景、短标签和低帧动画作为验收标准 |
| 为贴近原版导致操作繁琐 | 手表上不愿意长期使用 | 保留原版规则，把输入转译为点按/长按/滑动，常用动作 3-5 秒完成 |

## 11. 开放问题

- 时间节奏默认采用原设备真实时间，还是面向手表日常使用做轻量加速？
- 是否需要加入图鉴/手册/计算器页面，还是先保持单页宠物机本体？
- 是否要加入 Ver.5 原版背景解锁展示，还是只记录 Quest 进度？

## 12. 参考来源

- Wikimon: Digital Monster COLOR  
  https://wikimon.net/Digital_Monster_COLOR
- Wikimon: Digital Monster COLOR Ver.5  
  https://wikimon.net/Digital_Monster_COLOR_Ver.5
- Xiaomi Vela JS 应用概述  
  https://iot.mi.com/vela/quickapp/zh/guide/
- Xiaomi Vela 项目结构  
  https://iot.mi.com/vela/quickapp/zh/guide/framework/project-structure.html
- Xiaomi Vela UX / Template / Style / Script  
  https://iot.mi.com/vela/quickapp/zh/guide/framework/ux.html  
  https://iot.mi.com/vela/quickapp/zh/guide/framework/template/  
  https://iot.mi.com/vela/quickapp/zh/guide/framework/style/  
  https://iot.mi.com/vela/quickapp/zh/guide/framework/script/
- Xiaomi Vela 多屏适配与 REDMI Watch 5 同分辨率参数  
  https://iot.mi.com/vela/quickapp/zh/guide/multi-screens/
- Xiaomi Vela 最佳实践与验收标准  
  https://iot.mi.com/vela/quickapp/zh/guide/best-practice/memory.html  
  https://iot.mi.com/vela/quickapp/zh/guide/best-practice/business.html  
  https://iot.mi.com/vela/quickapp/zh/guide/best-practice/start.html  
  https://iot.mi.com/vela/quickapp/zh/guide/publish/acceptance-criteria.html
- REDMI Watch 6 官方规格  
  https://www.mi.com/global/product/redmi-watch-6-nfc/  
  https://www.mi.com/uk/product/redmi-watch-6/specs/
- Digital Monster Color Manual，玩法细则辅助参考  
  https://humulos.com/digimon/dmc/manual/
