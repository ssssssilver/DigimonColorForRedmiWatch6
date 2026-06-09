import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const startedAt = new Date()
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const version = pkg.version
const reportDir = new URL('../logs/', import.meta.url)
const reportPath = new URL(`release-qa-${version}.md`, reportDir)

await mkdir(reportDir, { recursive: true })

function runStep(name, command, args) {
  const started = Date.now()
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32'
  })
  return {
    name,
    command: [command, ...args].join(' '),
    status: result.status === 0 ? 'PASS' : 'FAIL',
    durationMs: Date.now() - started,
    stdout: result.stdout || '',
    stderr: result.stderr || (result.error ? result.error.message : ''),
    exitCode: result.status
  }
}

function commandOutput(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32'
  })
  return result.status === 0 ? (result.stdout || '').trim() : ''
}

const steps = [
  runStep('Game smoke', npmBin, ['run', 'test:game']),
  runStep('Data validation', npmBin, ['run', 'lint:data']),
  runStep('Build RPK', npmBin, ['run', 'build']),
  runStep('First-release QA gate', npmBin, ['run', 'qa:first-release'])
]

const rpkPath = new URL(`../dist/com.learning.multivpet.dmcwatch.debug.${version}.rpk`, import.meta.url)
let rpkSize = 0
try {
  const info = await stat(rpkPath)
  rpkSize = info.size
} catch (error) {
  steps.push({
    name: 'RPK artifact',
    command: `stat ${rpkPath.pathname}`,
    status: 'FAIL',
    durationMs: 0,
    stdout: '',
    stderr: `Missing RPK for ${version}`,
    exitCode: 1
  })
}

const commit = commandOutput('git', ['rev-parse', '--short', 'HEAD'])
const tags = commandOutput('git', ['tag', '--points-at', 'HEAD'])
const dirty = commandOutput('git', ['status', '--short'])
const failed = steps.filter((step) => step.status !== 'PASS')

const report = [
  `# Release QA ${version}`,
  '',
  `- Started: ${startedAt.toISOString()}`,
  `- Finished: ${new Date().toISOString()}`,
  `- Commit: ${commit || 'unknown'}`,
  `- Tags at HEAD: ${tags || 'none'}`,
  `- RPK: dist/com.learning.multivpet.dmcwatch.debug.${version}.rpk`,
  `- RPK size: ${rpkSize}`,
  `- Result: ${failed.length ? 'FAIL' : 'PASS'}`,
  '',
  '## Automated Gates',
  '',
  '| Gate | Result | Duration | Command |',
  '| --- | --- | ---: | --- |',
  ...steps.map((step) => `| ${step.name} | ${step.status} | ${step.durationMs}ms | \`${step.command}\` |`),
  '',
  '## Manual Evidence Still Required',
  '',
  '- REDMI Watch 6 or matching 432 x 514 simulator screenshot review for text overflow, overlap, and sprite framing.',
  '- Real-device touch stability check for all eight home entries and module buttons.',
  '- Real-device 30 minute run check for visible stutter, heat, battery drain, or memory growth.',
  '',
  '## Working Tree Note',
  '',
  dirty ? '```text\n' + dirty + '\n```' : 'Clean working tree at report time.',
  '',
  '## Failure Output',
  '',
  failed.length
    ? failed.map((step) => [
        `### ${step.name}`,
        '',
        '```text',
        step.stderr || step.stdout || `Exit ${step.exitCode}`,
        '```'
      ].join('\n')).join('\n\n')
    : 'No automated gate failures.'
].join('\n')

await writeFile(reportPath, report, 'utf8')

if (failed.length) {
  console.error(`Release QA failed for ${version}. Report: ${reportPath.pathname}`)
  process.exit(1)
}

console.log(`Release QA OK: ${reportPath.pathname}`)
