import { createWriteStream, statSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ZipArchive } from 'archiver'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const outPath = join(__dirname, '..', 'extension.zip')

if (existsSync(outPath)) rmSync(outPath)

const output = createWriteStream(outPath)
const archive = new ZipArchive({ zlib: { level: 9 } })

archive.pipe(output)
archive.directory(distDir, false)
await archive.finalize()

const kb = (statSync(outPath).size / 1024).toFixed(1)
console.log(`Created extension.zip (${kb} KB)`)
