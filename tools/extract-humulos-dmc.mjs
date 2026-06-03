import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = new URL('../', import.meta.url)
const DATA_DIR = new URL('../src/common/data/', import.meta.url)
const SPRITE_DIR = new URL('../src/common/digimon/', import.meta.url)
const LIST_URL = 'https://humulos.com/digimon/dmc/list/'
const QUEST_URL = 'https://humulos.com/digimon/dmc/quest/'
const execFileAsync = promisify(execFile)

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]*>/g, '')
    .trim()
}

function stripTags(value) {
  return decodeEntities(value.replace(/<br\s*\/?>/gi, '\n'))
}

function getClassCell(row, className) {
  const match = row.match(new RegExp(`<td[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\\/td>`, 'i'))
  return match ? stripTags(match[1]) : ''
}

function getCells(row) {
  return [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => stripTags(cell[1]))
}

function getImageSrc(row) {
  const match = row.match(/<img[^>]+class=["'][^"']*list_dot[^"']*["'][^>]+src=["']([^"']+)["']/i)
  if (!match) return ''
  return match[1].startsWith('//') ? `https:${match[1]}` : match[1]
}

function getKey(row) {
  const match = row.match(/digimonDetailsUnified\('([^']+)'/i)
  return match ? match[1] : ''
}

function localSpritePath(spriteUrl) {
  if (!spriteUrl) return ''
  const fileName = path.basename(new URL(spriteUrl).pathname).replace(/\.gif$/i, '.png')
  return `/common/digimon/${fileName}`
}

function parseDigimon(html) {
  const tbody = html.match(/<tbody>([\s\S]*?)<\/tbody>/i)?.[1] || ''
  const rows = tbody.match(/<tr[\s\S]*?<\/tr>/gi) || []
  return rows.map((row) => {
    const cells = getCells(row)
    const spriteUrl = getImageSrc(row)
    const powerText = cells[5]?.match(/\d+/)?.[0] || ''
    return {
      id: cells[0],
      key: getKey(row),
      name: cells[2],
      stage: cells[3],
      attribute: row.match(/attribute=["']([^"']+)["']/i)?.[1] || 'Free',
      power: powerText ? Number(powerText) : 0,
      version: cells[6],
      sprite: localSpritePath(spriteUrl),
      spriteUrl,
      tile: cells[2].slice(0, 2).toUpperCase()
    }
  }).filter((item) => item.id && item.key && item.name)
}

function parseQuestCell(cell, round) {
  if (!cell || !cell.includes('<img')) return null
  const name = cell.match(/title=["']([^"']+)["']/i)?.[1] || ''
  const spriteSrc = cell.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || ''
  const normalizedSrc = spriteSrc.startsWith('//') ? `https:${spriteSrc}` : spriteSrc
  const text = stripTags(cell)
  const attribute = ['Vaccine', 'Data', 'Virus', 'Free'].find((value) => text.includes(value)) || 'Free'
  const power = Number(text.match(/\d+/)?.[0] || 0)
  return {
    round,
    name,
    attribute,
    power,
    sprite: localSpritePath(normalizedSrc)
  }
}

function parseQuest(html) {
  const tables = [...html.matchAll(/<table id=["']ver15\d["'][\s\S]*?<\/table>/gi)]
  const versions = ['Ver.1', 'Ver.2', 'Ver.3', 'Ver.4', 'Ver.5']
  return tables.map((match, index) => {
    const table = match[0]
    const rows = (table.match(/<tr>[\s\S]*?<\/tr>/gi) || []).slice(1)
    return {
      version: versions[index],
      areas: rows.map((row) => {
        const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => cell[1])
        const area = stripTags(cells[0]).split('\n')[0]
        const rounds = cells.slice(1, 6).map((cell, roundIndex) => parseQuestCell(cell, roundIndex + 1)).filter(Boolean)
        return {
          area,
          unlock: stripTags(cells[6] || ''),
          rounds
        }
      })
    }
  }).filter((item) => item.version && item.areas.length)
}

async function downloadSprites(items) {
  await mkdir(SPRITE_DIR, { recursive: true })
  const urls = new Map()
  for (const item of items) {
    if (item.spriteUrl) {
      urls.set(item.spriteUrl, item.sprite)
    }
  }
  for (const [url, target] of urls) {
    const pngFile = new URL(`../src${target}`, import.meta.url)
    const gifFile = new URL(`../src${target.replace(/\.png$/i, '.gif')}`, import.meta.url)
    if (!existsSync(gifFile)) {
      const response = await fetch(url)
      if (!response.ok) {
        console.warn(`skip ${url}: ${response.status}`)
        continue
      }
      const buffer = Buffer.from(await response.arrayBuffer())
      await mkdir(new URL('.', gifFile), { recursive: true })
      await writeFile(gifFile, buffer)
    }
    await convertGifToPng(gifFile, pngFile)
  }
}

function psQuote(value) {
  return `'${value.replace(/'/g, "''")}'`
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

async function main() {
  await mkdir(DATA_DIR, { recursive: true })
  const [listHtml, questHtml] = await Promise.all([
    fetch(LIST_URL).then((response) => response.text()),
    fetch(QUEST_URL).then((response) => response.text())
  ])
  const digimon = parseDigimon(listHtml)
  const quests = parseQuest(questHtml)
  await downloadSprites(digimon)

  const digimonModule = `export const VERSIONS = ['All', 'Ver.1', 'Ver.2', 'Ver.3', 'Ver.4', 'Ver.5']\nexport const STAGE_FILTERS = ['All', 'I', 'II', 'III', 'IV', 'V', 'VI']\nexport const ATTRIBUTE_FILTERS = ['All', 'Vaccine', 'Data', 'Virus', 'Free']\nexport const DIGIMON = ${JSON.stringify(digimon, null, 2)}\n`
  const questModule = `export const QUESTS = ${JSON.stringify(quests, null, 2)}\n`
  await writeFile(new URL('digimon.js', DATA_DIR), digimonModule)
  await writeFile(new URL('quest.js', DATA_DIR), questModule)
  console.log(`Wrote ${digimon.length} Digimon and ${quests.length} quest versions`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
