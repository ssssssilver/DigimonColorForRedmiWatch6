import { readFile } from 'node:fs/promises'
import { applyAction, getBattlePreview, getDisplayModel, getTrainingPreview, hydrateState, newGame } from '../src/common/utils/gameEngine.js'

const failures = []

function assert(condition, message) {
  if (!condition) failures.push(message)
}

function assertIncludes(source, expected, message) {
  assert(source.includes(expected), message)
}

const indexUx = await readFile(new URL('../src/pages/index/index.ux', import.meta.url), 'utf8')
const manifest = JSON.parse(await readFile(new URL('../src/manifest.json', import.meta.url), 'utf8'))
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

assert(manifest.config.designWidth === 432, 'manifest should use 432 design width for REDMI Watch 6')
assert(manifest.versionName === pkg.version, 'manifest versionName should match package version')
assertIncludes(indexUx, 'width: 432px;', 'watch page should be full 432px wide')
assertIncludes(indexUx, 'height: 514px;', 'watch page should target 514px height')
assertIncludes(indexUx, '口状态', 'home rail should include Status entry')
assertIncludes(indexUx, '●投喂', 'home rail should include Food entry')
assertIncludes(indexUx, '|训练', 'home rail should include Training entry')
assertIncludes(indexUx, '×战斗', 'home rail should include Battle entry')
assertIncludes(indexUx, 'o清理', 'home rail should include Clean Waste entry')
assertIncludes(indexUx, 'Z睡觉', 'home rail should include Sleep entry')
assertIncludes(indexUx, '+治疗', 'home rail should include Heal entry')
assertIncludes(indexUx, '!呼唤', 'home rail should include Call entry')
assertIncludes(indexUx, 'battle-round-scene', 'battle round scene should exist')
assertIncludes(indexUx, 'projectile-fire', 'battle projectile jump state should exist')
assertIncludes(indexUx, 'effect-clear-done', 'clean success effect should exist')
assertIncludes(indexUx, 'effect-heal-done', 'heal success effect should exist')
assertIncludes(indexUx, 'recovery-scene', 'recovery confirmation scene should exist')

const start = 1000000
let state = newGame(start, 'Ver.5')
state = getDisplayModel(state, start + 11000).state
assert(state.petKey !== 'digitama', 'egg should hatch during first-release QA')

state.hunger = 0
state.strength = 0
state.poop = 2
state = getDisplayModel(state, start + 12000).state
assert(state.callActive, 'care call should activate when hunger/strength is empty')
state = applyAction(state, 'meat', start + 13000)
assert(state.hunger === 1, 'meat should restore hunger by one')
state = applyAction(state, 'vitamin', start + 14000)
assert(state.strength === 1, 'vitamin should restore strength by one')
state.poop = 3
state.sick = true
state.sickStartedAt = start + 15000
state = applyAction(state, 'toilet', start + 16000)
assert(state.poop === 0, 'clean waste should clear poop')
assert(!state.sick, 'clean waste should clear poop-caused sickness when not injured')

state.sick = true
state.injured = true
state.medicineNeeded = 1
state = applyAction(state, 'med', start + 17000)
assert(!state.sick && !state.injured, 'medicine should clear sickness and injury when one dose is needed')

let trainState = newGame(start, 'Ver.5')
trainState.petKey = 'gazi'
trainState.nextEvolutionAt = 0
const trainPreview = getTrainingPreview(trainState)
assert(trainPreview.canTrain, 'healthy child/adult should be trainable')
trainState = applyAction(trainState, 'trainOk', start + 18000)
assert(trainState.trainingCount === 1 && trainState.stageTrainingCount === 1, 'training should update global and stage counters')

let battleState = newGame(start, 'Ver.5')
battleState.petKey = 'gazi'
battleState.nextEvolutionAt = 0
battleState.energy = 1
battleState.hunger = 4
battleState.strength = 4
const preview = getBattlePreview(battleState)
assert(preview.canBattle, 'healthy stage III+ pet with energy should be battle-ready')
battleState = applyAction(battleState, 'battle', start + 19000)
assert(battleState.battles === 1, 'battle should increment battle count')
assert(battleState.energy === 0, 'battle should consume one energy')
assert(!!battleState.lastEnemySprite, 'battle should store enemy sprite for result/sequence')
const battleModel = getDisplayModel(battleState, start + 19500)
assert(battleModel.showBattle, 'battle display model should expose short result window')

const offlineRaw = newGame(start, 'Ver.5')
offlineRaw.lastTickAt = start
offlineRaw.lastHungerAt = start
offlineRaw.lastStrengthAt = start
offlineRaw.lastPoopAt = start
const offlineState = hydrateState(offlineRaw, start + 8 * 24 * 60 * 60 * 1000)
assert(offlineState.recoveryPending, 'long offline state should require recovery confirmation')
const recovered = applyAction(offlineState, 'recover', start + 8 * 24 * 60 * 60 * 1000 + 1000)
assert(!recovered.recoveryPending, 'recover action should clear recovery confirmation')

let longRun = newGame(start, 'Ver.5')
for (let minute = 1; minute <= 30; minute++) {
  longRun = getDisplayModel(longRun, start + minute * 60 * 1000).state
  assert(longRun.schemaVersion === 4, `schema should remain v4 at minute ${minute}`)
  assert(!longRun.dead, `pet should survive first 30 simulated minutes at minute ${minute}`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('First-release QA OK')
