const ATTRIBUTE_ADVANTAGE = {
  Vaccine: { Data: -5, Virus: 5 },
  Data: { Vaccine: 5, Virus: -5 },
  Virus: { Vaccine: -5, Data: 5 },
  Free: {}
}

const STAGE_BONUS = {
  III: 5,
  IV: 8,
  V: 15,
  VI: 25
}

export function calculateHitrate(input) {
  const playerPower = Math.max(0, parseInt(input.playerPower || 0))
  const opponentPower = Math.max(0, parseInt(input.opponentPower || 0))
  const playerAttribute = input.playerAttribute || 'Vaccine'
  const opponentAttribute = input.opponentAttribute || 'Virus'
  const stage = input.stage || 'III'
  const baseBonus = STAGE_BONUS[stage] || 0
  const bonus = input.traitedEgg ? baseBonus * 2 : baseBonus
  const totalPower = playerPower + bonus
  const advantage = ATTRIBUTE_ADVANTAGE[playerAttribute][opponentAttribute] || 0
  const denominator = totalPower + opponentPower
  const rawRate = denominator > 0 ? ((totalPower * 100) / denominator) + advantage : 0
  const hitrate = Math.max(0, Math.min(100, rawRate))

  return {
    bonus,
    totalPower,
    advantage,
    hitrate,
    hitrateText: hitrate.toFixed(2) + '%'
  }
}

export const ATTRIBUTES = ['Vaccine', 'Data', 'Virus', 'Free']
export const STAGES = ['III', 'IV', 'V', 'VI']
