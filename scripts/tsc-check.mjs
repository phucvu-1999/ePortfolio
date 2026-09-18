// Minimal typecheck harness — drives the TypeScript compiler API directly.
// Works around flaky tsc CLI argument handling in this environment.
// Usage: node scripts/tsc-check.mjs [tsconfig-name.json]
import ts from 'typescript'

const configName = process.argv[2] ?? 'tsconfig.app.json'
const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, configName)
if (!configPath) {
  console.error(`${configName} not found`)
  process.exit(1)
}

const parsed = ts.getParsedCommandLineOfConfigFile(
  configPath,
  { noEmit: true },
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (d) => {
      console.error(ts.flattenDiagnosticMessageText(d.messageText, '\n'))
      process.exit(1)
    },
  },
)
if (!parsed) {
  console.error('Failed to parse config')
  process.exit(1)
}

const program = ts.createProgram({
  rootNames: parsed.fileNames,
  options: parsed.options,
  projectReferences: parsed.projectReferences,
})

const diagnostics = ts.getPreEmitDiagnostics(program)
for (const d of diagnostics) {
  let loc = ''
  if (d.file && typeof d.start === 'number') {
    const { line, character } = ts.getLineAndCharacterOfPosition(d.file, d.start)
    loc = ` (${d.file.fileName.replace(/\\/g, '/')}:${line + 1}:${character + 1})`
  }
  console.error(`TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}${loc}`)
}
console.log(`TSC_CHECK ${configName}: ${diagnostics.length} diagnostic(s)`)
process.exit(diagnostics.length === 0 ? 0 : 1)
