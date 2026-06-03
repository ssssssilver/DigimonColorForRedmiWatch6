import storage from '@system.storage'

const KEY = 'dmc-checklist-v1'

export function loadChecklist(success) {
  storage.get({
    key: KEY,
    default: '{}',
    success(data) {
      let parsed = {}
      try {
        parsed = JSON.parse(data || '{}')
      } catch (e) {
        parsed = {}
      }
      success(parsed)
    },
    fail() {
      success({})
    }
  })
}

export function saveChecklist(value) {
  storage.set({
    key: KEY,
    value: JSON.stringify(value || {})
  })
}
