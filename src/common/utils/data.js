import { DIGIMON } from '../data/digimon.js'

export function getDigimonByKey(key) {
  for (let i = 0; i < DIGIMON.length; i++) {
    if (DIGIMON[i].key === key) {
      return DIGIMON[i]
    }
  }
  return DIGIMON[0]
}

export function filterDigimon(version, stage, attribute) {
  const list = []
  for (let i = 0; i < DIGIMON.length; i++) {
    const item = DIGIMON[i]
    const versionOk = version === 'All' || item.version === version
    const stageOk = stage === 'All' || item.stage === stage
    const attrOk = attribute === 'All' || item.attribute === attribute
    if (versionOk && stageOk && attrOk) {
      list.push(item)
    }
  }
  return list
}
