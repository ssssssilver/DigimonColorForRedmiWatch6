import { applyAction, getDisplayModel, hydrateState, newGame } from '../src/common/utils/gameEngine.js'

const failures = []

function assert(condition, message) {
  if (!condition) failures.push(message)
}

function hatch(version) {
  const start = 1000000
  let state = newGame(start, version)
  state = getDisplayModel(state, start + 11000).state
  assert(state.petKey !== 'digitama', `${version} egg did not hatch`)
  assert(state.version === version, `${version} was not preserved after hatch`)
  return { state, start }
}

hatch('Ver.5')

{
  const state = newGame(1200000, 'Ver.5')
  assert(state.schemaVersion === 2, 'new game should use schema v2')
}

{
  const start = 1300000
  const raw = newGame(start, 'Ver.5')
  raw.schemaVersion = 1
  raw.cold = true
  raw.lastAction = 'cold'
  raw.lastActionAt = start + 1000
  delete raw.coldStartedAt
  const state = hydrateState(raw, start + 2000)
  assert(state.schemaVersion === 2, 'old save should migrate to schema v2')
  assert(state.coldStartedAt === start + 1000, 'old cold save should recover coldStartedAt')
}

{
  const state = applyAction(newGame(1000000, 'Ver.1'), 'version', 1001000)
  assert(state.version === 'Ver.5', 'game should stay fixed to Ver.5')
}

{
  const { state, start } = hatch('Ver.5')
  const result = applyAction(state, 'battle', start + 20000)
  assert(result.battles === 0, 'baby should not be able to battle')
  assert(result.message === 'Too young.', 'baby battle should explain why it failed')
}

{
  const start = 2000000
  let state = newGame(start, 'Ver.5')
  state.petKey = 'gazi'
  state.strength = 4
  state.hunger = 4
  state.nextEvolutionAt = 0
  state = applyAction(state, 'battle', start + 30000)
  assert(state.battles === 1, 'adult battle did not count')
  assert(state.questRound === 1 || state.questArea === 1, 'winning battle did not advance quest')
  assert(state.lastEnemyName === 'Gizamon', 'battle did not store enemy name')
  assert(state.lastEnemySprite.endsWith('.png'), 'battle enemy sprite is not png')
}

{
  const start = 3000000
  let state = newGame(start, 'Ver.5')
  state = applyAction(state, 'cold', start + 1000)
  const strength = state.strength
  state = applyAction(state, 'train', start + 2000)
  assert(state.cold, 'cold state should remain active')
  assert(state.strength === strength, 'cold mode should block training')
  assert(state.message === 'Cold paused.', 'cold blocked action should explain pause')
}

{
  const start = 3500000
  let state = newGame(start, 'Ver.5')
  state = getDisplayModel(state, start + 11000).state
  const coldAt = start + 20000
  state = applyAction(state, 'cold', coldAt)
  const petKey = state.petKey
  const bornAt = state.bornAt
  const nextEvolutionAt = state.nextEvolutionAt
  state = getDisplayModel(state, coldAt + 24 * 60 * 60 * 1000).state
  assert(state.petKey === petKey, 'cold mode should pause evolution while active')
  state = applyAction(state, 'cold', coldAt + 24 * 60 * 60 * 1000)
  assert(state.bornAt > bornAt, 'cold resume should shift bornAt forward to pause age')
  assert(state.nextEvolutionAt > nextEvolutionAt, 'cold resume should shift evolution deadline forward')
  state = getDisplayModel(state, coldAt + 24 * 60 * 60 * 1000 + 1000).state
  assert(state.petKey === petKey, 'cold resume should not immediately evolve')
}

{
  const start = 4000000
  let state = newGame(start, 'Ver.5')
  state = applyAction(state, 'light', start + 1000)
  const hunger = state.hunger
  state = applyAction(state, 'meat', start + 2000)
  assert(state.asleep, 'light should toggle sleep on')
  assert(state.hunger === hunger, 'sleep should block feeding')
  assert(state.message === 'Sleeping.', 'sleep blocked action should explain sleep')
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Game smoke OK')
