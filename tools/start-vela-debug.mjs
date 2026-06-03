import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { createRequire } from 'node:module'

const targetVvd = process.argv[2] || 'Vela_Watch_Vpet'
const require = createRequire(import.meta.url)
const promptsPath = require.resolve('@inquirer/prompts')

require.cache[promptsPath] = {
  id: promptsPath,
  filename: promptsPath,
  loaded: true,
  exports: {
    confirm: async () => true,
    select: async () => targetVvd,
    input: async (options = {}) => options.default || '',
    checkbox: async () => []
  }
}

const { default: VelaUxStarter } = require('aiot-toolkit/lib/starter/VelaUxStarter.js')

const logDir = path.resolve(process.cwd(), 'logs')
fs.mkdirSync(logDir, { recursive: true })

console.log(`[debug] project: ${process.cwd()}`)
console.log(`[debug] vvd: ${targetVvd}`)
console.log(`[debug] sdk: ${path.resolve(os.homedir(), '.vela/sdk')}`)
console.log('[debug] starting Vela watch debug with hot reload...')

const starter = new VelaUxStarter('start', 'start project')

await starter.start(process.cwd(), {
  watch: true,
  devtool: 'source-map',
  enableJsc: true,
  disableNSH: false,
  openVNC: false,
  startPage: 'pages/index'
})

process.on('SIGINT', async () => {
  console.log('[debug] stopping...')
  await starter.builder?.dispose?.()
  process.exit(0)
})

console.log('[debug] Vela debug is running.')
