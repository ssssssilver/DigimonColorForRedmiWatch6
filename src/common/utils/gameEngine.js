import { DIGIMON } from '../data/digimon.js'
import { PET_FORMS, PET_TIMING, nextEvolutionDelayFor, nextEvolutionFor } from '../data/vpetEvolution.js'
import { QUESTS } from '../data/quest.js'
import { calculateHitrate } from './calculator.js'

const MAX_HEARTS = 4
const PET_VERSIONS = ['Ver.5']
const SCHEMA_VERSION = 2
const MAX_OFFLINE_MS = 7 * 24 * 60 * 60 * 1000

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function normalizeVersion(version) {
  return PET_VERSIONS.includes(version) ? version : PET_VERSIONS[0]
}

function nextVersion(version) {
  const index = PET_VERSIONS.indexOf(normalizeVersion(version))
  return PET_VERSIONS[(index + 1) % PET_VERSIONS.length]
}

function findDigimon(key) {
  if (PET_FORMS[key]) return PET_FORMS[key]
  for (let i = 0; i < DIGIMON.length; i++) {
    if (DIGIMON[i].key === key) return DIGIMON[i]
  }
  return PET_FORMS.digitama
}

function scheduleEvolution(state, now) {
  const form = findDigimon(state.petKey)
  const delay = nextEvolutionDelayFor(form.stage)
  state.nextEvolutionAt = delay > 0 ? now + delay : 0
}

export function newGame(now = Date.now(), version = 'Ver.5') {
  const state = {
    schemaVersion: SCHEMA_VERSION,
    petKey: 'digitama',
    version: normalizeVersion(version),
    generation: 1,
    bornAt: now,
    lastTickAt: now,
    nextEvolutionAt: now + PET_TIMING.eggMs,
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
    cold: false,
    coldStartedAt: 0,
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
    lastActionAt: now,
    lastAction: 'egg',
    lastHungerAt: now,
    lastStrengthAt: now,
    lastPoopAt: now,
    message: 'A new Digitama appeared.'
  }
  return hydrateState(state, now)
}

export function hydrateState(raw, now = Date.now()) {
  const state = Object.assign(newGameSkeleton(now), raw || {})
  state.schemaVersion = SCHEMA_VERSION
  state.version = normalizeVersion(state.version)
  if (state.cold && !state.coldStartedAt) {
    state.coldStartedAt = state.lastAction === 'cold' ? state.lastActionAt || state.lastTickAt : state.lastTickAt
  }
  if (state.lastTickAt > now) {
    state.lastTickAt = now
    state.lastHungerAt = now
    state.lastStrengthAt = now
    state.lastPoopAt = now
    state.message = 'TIME?'
  }
  if (!state.cold && now - state.lastTickAt > MAX_OFFLINE_MS) {
    const cappedNow = state.lastTickAt + MAX_OFFLINE_MS
    state.message = 'TIME? capped.'
    return tickState(state, cappedNow)
  }
  if (!state.nextEvolutionAt) scheduleEvolution(state, now)
  return tickState(state, now)
}

function newGameSkeleton(now) {
  return {
    schemaVersion: SCHEMA_VERSION,
    petKey: 'digitama',
    version: 'Ver.5',
    generation: 1,
    bornAt: now,
    lastTickAt: now,
    nextEvolutionAt: now + PET_TIMING.eggMs,
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
    cold: false,
    coldStartedAt: 0,
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
    lastActionAt: now,
    lastAction: '',
    lastHungerAt: now,
    lastStrengthAt: now,
    lastPoopAt: now,
    message: ''
  }
}

export function tickState(state, now = Date.now()) {
  if (state.dead || state.cold) {
    state.lastTickAt = now
    return withPet(state)
  }

  if (!state.asleep) {
    drainHeart(state, 'hunger', 'lastHungerAt', PET_TIMING.hungerDecayMs, now)
    drainHeart(state, 'strength', 'lastStrengthAt', PET_TIMING.strengthDecayMs, now)
    addPoop(state, now)
  }
  updateCallAndMistake(state, now)
  updateDeath(state, now)
  updateEvolution(state, now)
  state.schemaVersion = SCHEMA_VERSION
  state.lastTickAt = now
  return withPet(state)
}

function drainHeart(state, field, lastField, interval, now) {
  while (now - state[lastField] >= interval) {
    state[lastField] += interval
    if (state[field] > 0) state[field] -= 1
  }
}

function addPoop(state, now) {
  while (now - state.lastPoopAt >= PET_TIMING.poopMs) {
    state.lastPoopAt += PET_TIMING.poopMs
    state.poop = clamp(state.poop + 1, 0, 4)
  }
  if (state.poop >= 3) {
    markSick(state, now)
  }
}

function updateCallAndMistake(state, now) {
  const needsCare = state.hunger === 0 || state.strength === 0 || state.poop >= 3 || state.sick || state.injured || needsLightsOut(state, now)
  if (needsCare && !state.callActive) {
    state.callActive = true
    state.callStartedAt = now
  }
  if (!needsCare) {
    state.callActive = false
    state.callStartedAt = 0
    state.emptyStartedAt = 0
    return
  }
  if ((state.hunger === 0 || state.strength === 0) && !state.emptyStartedAt) {
    state.emptyStartedAt = now
  }
  if (state.callStartedAt && now - state.callStartedAt >= PET_TIMING.mistakeGraceMs) {
    state.careMistakes += 1
    state.callStartedAt = now
    state.message = 'Care mistake recorded.'
  }
}

function updateDeath(state, now) {
  if (state.careMistakes >= 20) {
    state.dead = true
    state.message = 'It returned to data.'
    return
  }
  if (state.emptyStartedAt && now - state.emptyStartedAt >= PET_TIMING.deathGraceMs && state.sick) {
    state.dead = true
    state.message = 'It returned to data.'
    return
  }
  if (state.sickStartedAt && now - state.sickStartedAt >= PET_TIMING.deathGraceMs) {
    state.dead = true
    state.message = 'Sickness was ignored.'
    return
  }
  if (state.injuredStartedAt && now - state.injuredStartedAt >= PET_TIMING.deathGraceMs) {
    state.dead = true
    state.message = 'Injury was ignored.'
  }
}

function updateEvolution(state, now) {
  if (!state.nextEvolutionAt || now < state.nextEvolutionAt) return
  const nextKey = nextEvolutionFor(state)
  if (!nextKey) return
  state.petKey = nextKey
  state.hunger = MAX_HEARTS
  state.strength = MAX_HEARTS
  state.poop = 0
  state.sick = false
  state.sickStartedAt = 0
  state.injured = false
  state.injuredStartedAt = 0
  state.message = 'EVOLUTION!'
  scheduleEvolution(state, now)
}

export function applyAction(state, action, now = Date.now()) {
  state = tickState(state, now)
  if (action === 'reset') return newGame(now, state.version)
  if (action === 'version') {
    state.message = 'Ver.5 only.'
    stampAction(state, action, now)
    return withPet(state)
  }
  if (state.dead) return withPet(state)
  if (state.cold && !['cold', 'data'].includes(action)) {
    state.message = 'Cold paused.'
    stampAction(state, action, now)
    return withPet(state)
  }
  if (state.asleep && !['light', 'data', 'med'].includes(action)) {
    state.message = 'Sleeping.'
    stampAction(state, action, now)
    return withPet(state)
  }
  if (action === 'meat') feedMeat(state)
  if (action === 'vitamin') feedVitamin(state, now)
  if (action === 'train' || action === 'trainOk') train(state, true)
  if (action === 'trainMiss') train(state, false)
  if (action === 'battle') battle(state, now)
  if (action === 'toilet') toilet(state)
  if (action === 'med') medicine(state)
  if (action === 'light') toggleSleep(state)
  if (action === 'cold') toggleCold(state, now)
  if (action === 'data') state.message = makeDataMessage(state)
  stampAction(state, action, now)
  updateCallAndMistake(state, now)
  state.lastTickAt = now
  return withPet(state)
}

function stampAction(state, action, now) {
  state.lastAction = action
  state.lastActionAt = now
}

function feedMeat(state) {
  if (state.hunger < MAX_HEARTS) {
    state.hunger += 1
    state.weight += 1
    state.message = 'Meat served.'
  } else {
    state.overfeeds += 1
    state.weight += 2
    state.message = 'Too full.'
  }
}

function feedVitamin(state, now) {
  if (state.strength < MAX_HEARTS) {
    state.strength += 1
    state.weight += 2
    state.message = 'Protein up.'
  } else {
    state.overfeeds += 1
    state.weight += 2
    if (state.overfeeds % 4 === 0) markSick(state, now)
    state.message = 'Overfed.'
  }
}

function train(state, success) {
  if (state.strength <= 0) {
    state.message = 'No power.'
    return
  }
  if (!success) {
    state.strength = clamp(state.strength - 1, 0, MAX_HEARTS)
    state.weight = clamp(state.weight - 1, 1, 99)
    state.message = 'Training MISS.'
    return
  }
  state.strength -= 1
  state.effort = clamp(state.effort + 1, 0, 32)
  state.weight = clamp(state.weight - 1, 1, 99)
  if (state.effort % 8 === 0) {
    state.message = 'Effort heart up.'
  } else {
    state.message = 'Training OK.'
  }
}

function battle(state, now) {
  if (state.sick || state.injured) {
    state.message = 'Cannot battle.'
    return
  }
  if (state.strength <= 0) {
    state.message = 'No power.'
    return
  }
  const pet = findDigimon(state.petKey)
  if (!['III', 'IV', 'V', 'VI'].includes(pet.stage)) {
    state.message = 'Too young.'
    return
  }
  const quest = getQuestTarget(state)
  if (!quest.enemy) {
    state.message = 'No quest.'
    return
  }
  const hit = calculateHitrate({
    playerPower: pet.power,
    opponentPower: quest.enemy.power,
    playerAttribute: pet.attribute,
    opponentAttribute: quest.enemy.attribute,
    stage: pet.stage,
    traitedEgg: false
  })
  const chance = clamp(Math.round(hit.hitrate), 5, 95)
  const roll = (now / 1000 + state.battles * 17) % 100
  state.battles += 1
  state.strength = clamp(state.strength - 1, 0, MAX_HEARTS)
  state.lastEnemyName = quest.enemy.name
  state.lastEnemySprite = quest.enemy.sprite
  state.lastBattleAt = now
  if (roll <= chance) {
    state.wins += 1
    state.lastBattleWon = true
    advanceQuest(state, quest)
    state.message = `Q${quest.areaNumber}-${quest.roundNumber} WON ${chance}%`
  } else {
    state.lastBattleWon = false
    if (state.battles % 3 === 0) markInjured(state, now)
    state.message = `Q${quest.areaNumber}-${quest.roundNumber} LOST ${chance}%`
  }
}

function getQuestTarget(state) {
  const version = QUESTS.find((item) => item.version === normalizeVersion(state.version)) || QUESTS[0]
  if (!version || !version.areas.length) return {}
  const areaIndex = clamp(state.questArea || 0, 0, version.areas.length - 1)
  const area = version.areas[areaIndex]
  const roundIndex = clamp(state.questRound || 0, 0, area.rounds.length - 1)
  return {
    version,
    area,
    enemy: area.rounds[roundIndex],
    areaNumber: areaIndex + 1,
    roundNumber: roundIndex + 1
  }
}

export function getBattlePreview(state) {
  const quest = getQuestTarget(state)
  const pet = findDigimon(state.petKey)
  if (!quest.enemy) {
    return {
      canBattle: false,
      message: 'No quest.',
      areaText: 'Q-',
      enemyName: '',
      enemySprite: '',
      enemyMeta: ''
    }
  }
  const hit = calculateHitrate({
    playerPower: pet.power,
    opponentPower: quest.enemy.power,
    playerAttribute: pet.attribute,
    opponentAttribute: quest.enemy.attribute,
    stage: pet.stage,
    traitedEgg: false
  })
  const canBattle = !state.dead && !state.cold && !state.asleep && !state.sick && !state.injured && state.strength > 0 && ['III', 'IV', 'V', 'VI'].includes(pet.stage)
  return {
    canBattle,
    message: canBattle ? 'Tap START.' : battleBlockedMessage(state, pet),
    areaText: `Q${quest.areaNumber}-${quest.roundNumber}`,
    enemyName: quest.enemy.name,
    enemySprite: quest.enemy.sprite,
    enemyMeta: `${quest.enemy.attribute} P${quest.enemy.power} ${Math.round(hit.hitrate)}%`
  }
}

function battleBlockedMessage(state, pet) {
  if (state.dead) return 'Returned to data.'
  if (state.cold) return 'Cold paused.'
  if (state.asleep) return 'Sleeping.'
  if (state.sick || state.injured) return 'Cannot battle.'
  if (state.strength <= 0) return 'No power.'
  if (!['III', 'IV', 'V', 'VI'].includes(pet.stage)) return 'Too young.'
  return 'Cannot battle.'
}

function advanceQuest(state, quest) {
  const nextRound = (state.questRound || 0) + 1
  if (nextRound < quest.area.rounds.length) {
    state.questRound = nextRound
    return
  }
  const nextArea = (state.questArea || 0) + 1
  state.questRound = 0
  if (nextArea < quest.version.areas.length) {
    state.questArea = nextArea
    return
  }
  state.questArea = 0
  state.questClears = (state.questClears || 0) + 1
}

function toilet(state) {
  if (state.poop === 0) {
    state.message = 'Clean already.'
    return
  }
  state.poop = 0
  if (state.sick && !state.injured) {
    state.sick = false
    state.sickStartedAt = 0
  }
  state.message = 'Cleaned.'
}

function medicine(state) {
  if (!state.sick && !state.injured) {
    state.message = 'No problem.'
    return
  }
  state.sick = false
  state.sickStartedAt = 0
  state.injured = false
  state.injuredStartedAt = 0
  state.message = 'Recovered.'
}

function toggleSleep(state) {
  state.asleep = !state.asleep
  state.message = state.asleep ? 'Lights out.' : 'Lights on.'
}

function toggleCold(state, now) {
  state.cold = !state.cold
  if (state.cold) {
    state.coldStartedAt = now
    state.callActive = false
    state.callStartedAt = 0
    state.emptyStartedAt = 0
  } else {
    const pausedMs = state.coldStartedAt ? Math.max(0, now - state.coldStartedAt) : 0
    if (pausedMs > 0) {
      state.bornAt += pausedMs
      if (state.nextEvolutionAt) state.nextEvolutionAt += pausedMs
    }
    state.coldStartedAt = 0
    state.lastHungerAt = now
    state.lastStrengthAt = now
    state.lastPoopAt = now
    state.lastTickAt = now
  }
  state.message = state.cold ? 'Cold mode.' : 'Resume.'
}

function makeDataMessage(state) {
  const winRate = state.battles > 0 ? Math.round((state.wins * 100) / state.battles) : 0
  return `CM ${state.careMistakes} EF ${state.effort} WR ${winRate}%`
}

export function getDisplayModel(state, now = Date.now()) {
  const current = tickState(state, now)
  const pet = current.pet
  const ageHours = Math.max(0, Math.floor((now - current.bornAt) / (60 * 60 * 1000)))
  const etaMin = current.nextEvolutionAt ? Math.max(0, Math.ceil((current.nextEvolutionAt - now) / 60000)) : 0
  const quest = getQuestTarget(current)
  const showBattle = shouldShowBattle(current, now)
  return {
    state: current,
    pet,
    nameText: current.dead ? 'DEAD' : pet.name,
    stageText: pet.stage,
    ageText: `${ageHours}h`,
    etaText: current.dead ? 'NEW EGG' : `${etaMin}m`,
    hungerText: hearts(current.hunger),
    strengthText: hearts(current.strength),
    statusText: statusText(current),
    message: current.message || 'Watching...',
    sprite: current.dead ? '' : pet.sprite,
    enemySprite: current.lastEnemySprite || '',
    enemyName: current.lastEnemyName || (quest.enemy ? quest.enemy.name : ''),
    showSprite: !current.dead && !showBattle,
    showBattle,
    battleResultText: current.lastBattleWon ? 'WIN' : 'LOSE',
    showGrave: current.dead,
    poopText: current.poop > 0 ? 'o'.repeat(current.poop) : '',
    callText: current.callActive ? 'CALL' : '',
    coldText: current.cold ? 'COLD' : '',
    sleepText: current.asleep ? 'ZZZ' : '',
    questText: quest.enemy ? `Q${quest.areaNumber}-${quest.roundNumber}` : 'Q-',
    versionText: normalizeVersion(current.version),
    statusRows: statusRows(current, now)
  }
}

function shouldShowBattle(state, now) {
  return !state.dead && state.lastEnemySprite && state.lastBattleAt && now - state.lastBattleAt < 5000
}

function hearts(value) {
  let text = ''
  for (let i = 0; i < MAX_HEARTS; i++) {
    text += i < value ? '#' : '-'
  }
  return text
}

function statusText(state) {
  const flags = []
  if (state.sick) flags.push('SICK')
  if (state.injured) flags.push('HURT')
  if (state.poop >= 3) flags.push('DIRTY')
  if (state.callActive) flags.push('CALL')
  if (state.cold) flags.push('COLD')
  if (state.asleep) flags.push('SLEEP')
  return flags.length ? flags.join(' ') : 'OK'
}

function statusRows(state, now) {
  const pet = findDigimon(state.petKey)
  const quest = getQuestTarget(state)
  const winRate = state.battles > 0 ? Math.round((state.wins * 100) / state.battles) : 0
  const ageHours = Math.max(0, Math.floor((now - state.bornAt) / (60 * 60 * 1000)))
  return [
    `NAME ${state.dead ? 'DEAD' : pet.name}`,
    `${normalizeVersion(state.version)} AGE ${ageHours}h WT ${state.weight}g`,
    `HUN ${state.hunger}/4 POW ${state.strength}/4`,
    `EFF ${state.effort} CM ${state.careMistakes}`,
    `BAT ${state.wins}/${state.battles} WR ${winRate}%`,
    `Q${quest.areaNumber || '-'}-${quest.roundNumber || '-'} ${quest.enemy ? quest.enemy.name : 'NONE'}`,
    `POOP ${state.poop} OVF ${state.overfeeds}`
  ]
}

function markSick(state, now) {
  if (!state.sick) {
    state.sickStartedAt = now
  }
  state.sick = true
}

function markInjured(state, now) {
  if (!state.injured) {
    state.injuredStartedAt = now
  }
  state.injured = true
}

function needsLightsOut(state, now) {
  return isSleepTime(now) && !state.asleep && !state.dead
}

function isSleepTime(now) {
  const hour = new Date(now).getHours()
  if (PET_TIMING.sleepStartHour > PET_TIMING.sleepEndHour) {
    return hour >= PET_TIMING.sleepStartHour || hour < PET_TIMING.sleepEndHour
  }
  return hour >= PET_TIMING.sleepStartHour && hour < PET_TIMING.sleepEndHour
}

function withPet(state) {
  state.pet = findDigimon(state.petKey)
  return state
}
