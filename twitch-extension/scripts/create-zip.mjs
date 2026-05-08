import { readdirSync, statSync, createReadStream, createWriteStream, rmSync, existsSync } from 'fs'
import { join, relative } from 'path'
import { createGzip } from 'zlib'
import { pipeline } from 'stream/promises'
import { fileURLToPath } from 'url'

// Use Node's built-in zip support (available since Node 18 via worker or manual)
// We write a minimal ZIP file without external dependencies.

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const outPath = join(__dirname, '..', 'extension.zip')

function walkSync(dir, base = dir) {
  const results = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      results.push(...walkSync(full, base))
    } else {
      // Always forward slashes for ZIP spec compliance
      results.push({ full, rel: relative(base, full).replace(/\\/g, '/') })
    }
  }
  return results
}

// Minimal ZIP writer — no compression (store), avoids any native deps
import { readFileSync, writeFileSync } from 'fs'

function u16le(n) {
  const b = Buffer.alloc(2)
  b.writeUInt16LE(n)
  return b
}
function u32le(n) {
  const b = Buffer.alloc(4)
  b.writeUInt32LE(n >>> 0)
  return b
}

function crc32(buf) {
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      t[i] = c
    }
    return t
  })())
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const files = walkSync(distDir)
const localHeaders = []
const chunks = []
let offset = 0

for (const { full, rel } of files) {
  const nameBytes = Buffer.from(rel, 'utf8')
  const data = readFileSync(full)
  const crc = crc32(data)
  const size = data.length

  const localHeader = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x03, 0x04]), // local file header sig
    u16le(20),          // version needed
    u16le(0),           // general purpose bit flag
    u16le(0),           // compression method: store
    u16le(0),           // last mod time
    u16le(0),           // last mod date
    u32le(crc),
    u32le(size),        // compressed size
    u32le(size),        // uncompressed size
    u16le(nameBytes.length),
    u16le(0),           // extra field length
    nameBytes,
  ])

  localHeaders.push({ nameBytes, crc, size, offset })
  chunks.push(localHeader, data)
  offset += localHeader.length + size
}

// Central directory
const centralChunks = []
for (let i = 0; i < files.length; i++) {
  const { nameBytes, crc, size, offset: off } = localHeaders[i]
  centralChunks.push(Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x01, 0x02]), // central dir sig
    u16le(20),          // version made by
    u16le(20),          // version needed
    u16le(0),           // flags
    u16le(0),           // compression: store
    u16le(0),           // mod time
    u16le(0),           // mod date
    u32le(crc),
    u32le(size),
    u32le(size),
    u16le(nameBytes.length),
    u16le(0),           // extra
    u16le(0),           // comment
    u16le(0),           // disk start
    u16le(0),           // internal attr
    u32le(0),           // external attr
    u32le(off),
    nameBytes,
  ]))
}

const centralDir = Buffer.concat(centralChunks)
const centralOffset = offset

// End of central directory
const eocd = Buffer.concat([
  Buffer.from([0x50, 0x4b, 0x05, 0x06]),
  u16le(0),                     // disk number
  u16le(0),                     // disk with start of central dir
  u16le(files.length),          // entries on disk
  u16le(files.length),          // total entries
  u32le(centralDir.length),
  u32le(centralOffset),
  u16le(0),                     // comment length
])

if (existsSync(outPath)) rmSync(outPath)
writeFileSync(outPath, Buffer.concat([...chunks, centralDir, eocd]))

const kb = (statSync(outPath).size / 1024).toFixed(1)
console.log(`Created extension.zip (${kb} KB, ${files.length} files)`)
