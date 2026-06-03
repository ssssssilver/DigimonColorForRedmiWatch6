import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { DIGIMON } from '../src/common/data/digimon.js'

const execFileAsync = promisify(execFile)
const HUMULOS_DMC_SPRITE_URL = 'https://humulos.com/digimon/images/dot/dmc'
const OUTPUT_ROOT = new URL('../src/common/assets/dmc/ver5/', import.meta.url)

function psQuote(value) {
  return `'${value.replace(/'/g, "''")}'`
}

async function download(url, target) {
  if (existsSync(target)) return
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`failed to download ${url}: ${response.status}`)
  }
  await writeFile(target, Buffer.from(await response.arrayBuffer()))
}

async function convertGifToPng(gifFile, pngFile) {
  if (existsSync(pngFile)) return
  const gifPath = fileURLToPath(gifFile)
  const pngPath = fileURLToPath(pngFile)
  const command = [
    'Add-Type -AssemblyName System.Drawing;',
    `$gif = ${psQuote(gifPath)};`,
    `$png = ${psQuote(pngPath)};`,
    '$img = [System.Drawing.Image]::FromFile($gif);',
    '$img.SelectActiveFrame([System.Drawing.Imaging.FrameDimension]::Time, 0) | Out-Null;',
    '$img.Save($png, [System.Drawing.Imaging.ImageFormat]::Png);',
    '$img.Dispose();'
  ].join(' ')
  await execFileAsync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command])
}

async function writeIdleFrames(item) {
  const dir = new URL(`${item.key}/`, OUTPUT_ROOT)
  await mkdir(dir, { recursive: true })

  const frame1Gif = new URL('idle-1.gif', dir)
  const frame2Gif = new URL('idle-2.gif', dir)
  const frame1Png = new URL('idle-1.png', dir)
  const frame2Png = new URL('idle-2.png', dir)

  await download(`${HUMULOS_DMC_SPRITE_URL}/${item.key}.gif`, frame1Gif)
  await download(`${HUMULOS_DMC_SPRITE_URL}/frame2/${item.key}.gif`, frame2Gif)
  await convertGifToPng(frame1Gif, frame1Png)
  await convertGifToPng(frame2Gif, frame2Png)
}

const ver5 = DIGIMON.filter((item) => item.version === 'Ver.5')
for (const item of ver5) {
  await writeIdleFrames(item)
  console.log(`wrote idle frames for ${item.key}`)
}

console.log(`Humulos idle animation assets OK: ${ver5.length} Ver.5 Digimon`)
