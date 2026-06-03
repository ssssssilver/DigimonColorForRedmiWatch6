import storage from '@system.storage'
import { hydrateState, newGame } from './gameEngine.js'

const KEY = 'dmc-vpet-state-v2'

export function loadGame(success) {
  storage.get({
    key: KEY,
    default: '',
    success(data) {
      if (!data) {
        success(newGame())
        return
      }
      try {
        success(hydrateState(JSON.parse(data)))
      } catch (e) {
        success(newGame())
      }
    },
    fail() {
      success(newGame())
    }
  })
}

export function saveGame(state) {
  const copy = Object.assign({}, state)
  delete copy.pet
  copy.schemaVersion = copy.schemaVersion || 1
  copy.updatedAt = Date.now()
  storage.set({
    key: KEY,
    value: JSON.stringify(copy),
    success() {},
    fail() {},
    complete() {}
  })
}
