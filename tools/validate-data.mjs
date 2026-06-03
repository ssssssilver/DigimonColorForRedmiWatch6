import { readFile, stat } from 'node:fs/promises'

function parseExportedJson(source, exportName) {
  const start = source.indexOf(`export const ${exportName} = `)
  if (start < 0) {
    throw new Error(`missing export ${exportName}`)
  }
  const jsonStart = source.indexOf('[', start)
  let depth = 0
  for (let i = jsonStart; i < source.length; i++) {
    if (source[i] === '[') depth += 1
    if (source[i] === ']') depth -= 1
    if (depth === 0) {
      return JSON.parse(source.slice(jsonStart, i + 1))
    }
  }
  throw new Error(`could not parse ${exportName}`)
}

function calculateHitrate(input) {
  const advantageMap = {
    Vaccine: { Data: -5, Virus: 5 },
    Data: { Vaccine: 5, Virus: -5 },
    Virus: { Vaccine: -5, Data: 5 },
    Free: {}
  }
  const bonusMap = { III: 5, IV: 8, V: 15, VI: 25 }
  const bonus = bonusMap[input.stage] || 0
  const totalPower = input.playerPower + bonus
  const advantage = advantageMap[input.playerAttribute][input.opponentAttribute] || 0
  const hitrate = ((totalPower * 100) / (totalPower + input.opponentPower)) + advantage
  return { totalPower, advantage, hitrate }
}

const digimonSource = await readFile(new URL('../src/common/data/digimon.js', import.meta.url), 'utf8')
const questSource = await readFile(new URL('../src/common/data/quest.js', import.meta.url), 'utf8')
const DIGIMON = parseExportedJson(digimonSource, 'DIGIMON')
const QUESTS = parseExportedJson(questSource, 'QUESTS')

const failures = []

if (DIGIMON.length < 90) {
  failures.push(`expected at least 90 Digimon, got ${DIGIMON.length}`)
}

if (QUESTS.length !== 5) {
  failures.push(`expected 5 quest versions, got ${QUESTS.length}`)
}

const sample = calculateHitrate({
  playerPower: 30,
  opponentPower: 25,
  playerAttribute: 'Vaccine',
  opponentAttribute: 'Virus',
  stage: 'III',
  traitedEgg: false
})

if (sample.totalPower !== 35 || sample.advantage !== 5) {
  failures.push('calculator sample failed')
}

async function validateSprite(label, sprite) {
  if (!sprite) return
  if (!sprite.endsWith('.png')) {
    failures.push(`${label} sprite must be png: ${sprite}`)
    return
  }
  try {
    const info = await stat(new URL(`../src${sprite}`, import.meta.url))
    if (info.size <= 0) failures.push(`${label} sprite is empty: ${sprite}`)
  } catch (error) {
    failures.push(`${label} sprite missing: ${sprite}`)
  }
}

for (const item of DIGIMON) {
  await validateSprite(item.key, item.sprite)
}

for (const version of QUESTS) {
  for (const area of version.areas) {
    for (const round of area.rounds) {
      await validateSprite(`${version.version} ${area.area} R${round.round}`, round.sprite)
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Data OK: ${DIGIMON.length} Digimon, ${QUESTS.length} quest versions`)
