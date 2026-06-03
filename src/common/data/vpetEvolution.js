import { DIGIMON } from './digimon.js'

export const PET_TIMING = {
  eggMs: 10000,
  babyMs: 10 * 60 * 1000,
  childMs: 12 * 60 * 60 * 1000,
  adultMs: 24 * 60 * 60 * 1000,
  perfectMs: 36 * 60 * 60 * 1000,
  ultimateMs: 48 * 60 * 60 * 1000,
  hungerDecayMs: 3 * 60 * 60 * 1000,
  strengthDecayMs: 4 * 60 * 60 * 1000,
  poopMs: 3 * 60 * 60 * 1000,
  mistakeGraceMs: 15 * 60 * 1000,
  deathGraceMs: 6 * 60 * 60 * 1000,
  sleepStartHour: 21,
  sleepEndHour: 7
}

export const PET_FORMS = {
  digitama: {
    key: 'digitama',
    name: 'Digitama',
    stage: 'Egg',
    attribute: 'Free',
    power: 0,
    sprite: '/common/digimon/digitama.png'
  },
  dead: {
    key: 'dead',
    name: 'Grave',
    stage: 'Dead',
    attribute: 'Free',
    power: 0,
    sprite: ''
  }
}

export function nextEvolutionFor(state) {
  if (state.version && state.version !== 'Ver.1') {
    return nextEvolutionForVersion(state, state.version)
  }

  const winRate = state.battles > 0 ? state.wins / state.battles : 0
  const key = state.petKey

  if (key === 'digitama') return 'bota'
  if (key === 'bota') return 'koro'
  if (key === 'koro') {
    if (state.careMistakes <= 1 && state.effort >= 4) return 'agu'
    return 'beta'
  }
  if (key === 'agu' || key === 'beta') {
    if (state.careMistakes >= 5 || state.weight >= 36) return 'nume'
    if (state.effort >= 10 && state.battles >= 5 && winRate >= 0.6) return 'grey'
    if (state.battles >= 5) return 'airdra'
    if (state.effort >= 6) return 'tyrano'
    if (key === 'beta') return 'devi'
    return 'mera'
  }
  if (['grey', 'airdra', 'tyrano', 'devi', 'mera', 'seadra', 'nume'].includes(key)) {
    if (state.battles >= 15 && winRate >= 0.7 && state.careMistakes <= 2) return 'metalgrey_vi'
    if (state.effort >= 16 && state.careMistakes <= 4) return 'mame'
    return 'monzae'
  }
  if (['metalgrey_vi', 'mame', 'monzae'].includes(key)) {
    if (state.battles >= 20 && winRate >= 0.75 && state.careMistakes <= 2) return 'blitzgrey'
    if (state.effort >= 22) return 'banchomame'
    return 'shinmonzae'
  }
  return ''
}

function nextEvolutionForVersion(state, version) {
  if (state.petKey === 'digitama') return firstCandidate(version, 'I')
  const current = DIGIMON.find((item) => item.key === state.petKey)
  if (!current) return firstCandidate(version, 'I')
  const nextStage = nextStageFor(current.stage)
  if (!nextStage) return ''
  return pickCandidate(candidatesFor(version, nextStage), state)
}

function firstCandidate(version, stage) {
  const candidate = candidatesFor(version, stage)[0]
  return candidate ? candidate.key : ''
}

function candidatesFor(version, stage) {
  return DIGIMON.filter((item) => item.version === version && item.stage === stage)
}

function nextStageFor(stage) {
  if (stage === 'I') return 'II'
  if (stage === 'II') return 'III'
  if (stage === 'III') return 'IV'
  if (stage === 'IV') return 'V'
  if (stage === 'V') return 'VI'
  return ''
}

function pickCandidate(candidates, state) {
  if (!candidates.length) return ''
  if (candidates.length === 1) return candidates[0].key
  const winRate = state.battles > 0 ? state.wins / state.battles : 0
  const quality = clamp(
    state.effort + state.wins + Math.floor(winRate * 8) - state.careMistakes * 3 - Math.max(0, state.overfeeds - 2),
    0,
    60
  )
  const index = Math.min(candidates.length - 1, Math.floor((quality * candidates.length) / 61))
  return candidates[index].key
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function nextEvolutionDelayFor(stage) {
  if (stage === 'Egg') return PET_TIMING.eggMs
  if (stage === 'I') return PET_TIMING.babyMs
  if (stage === 'II') return PET_TIMING.childMs
  if (stage === 'III') return PET_TIMING.adultMs
  if (stage === 'IV') return PET_TIMING.perfectMs
  if (stage === 'V') return PET_TIMING.ultimateMs
  return 0
}
