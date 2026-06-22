/**
 * Generates all PWA icon assets from public/favicon.png.
 * Run once: node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root      = resolve(__dirname, '..')
const source    = resolve(root, 'public/favicon.png')
const BG        = { r: 14, g: 14, b: 17, alpha: 1 } // #0e0e11

async function makeIcon({ output, size, logoScale }) {
  const logoSize = Math.round(size * logoScale)
  const offset   = Math.round((size - logoSize) / 2)

  const logo = await sharp(source)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: logo, top: offset, left: offset }])
    .png({ compressionLevel: 9 })
    .toFile(resolve(root, output))

  console.log(`  ✓  ${output}`)
}

async function makeFavico() {
  // Build 3 sizes as raw RGBA buffers, then manually assemble a minimal ICO
  const sizes = [16, 32, 48]
  const pngs  = await Promise.all(
    sizes.map(async (s) => {
      const logoSize = Math.round(s * 0.75)
      const offset   = Math.round((s - logoSize) / 2)
      const logo = await sharp(source)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
      return sharp({ create: { width: s, height: s, channels: 4, background: BG } })
        .composite([{ input: logo, top: offset, left: offset }])
        .png()
        .toBuffer()
    })
  )

  // ICO header: ICONDIR + N × ICONDIRENTRY + raw PNG data
  const count  = sizes.length
  const HEADER = 6                   // ICONDIR size
  const ENTRY  = 16                  // ICONDIRENTRY size each
  const dataOffset = HEADER + ENTRY * count

  const header = Buffer.alloc(HEADER)
  header.writeUInt16LE(0, 0)         // reserved
  header.writeUInt16LE(1, 2)         // type: ICO
  header.writeUInt16LE(count, 4)

  const entries = []
  let currentOffset = dataOffset
  for (let i = 0; i < count; i++) {
    const entry = Buffer.alloc(ENTRY)
    const s     = sizes[i]
    entry.writeUInt8(s === 256 ? 0 : s, 0)   // width  (0 = 256)
    entry.writeUInt8(s === 256 ? 0 : s, 1)   // height
    entry.writeUInt8(0, 2)                    // color count (0 = truecolor)
    entry.writeUInt8(0, 3)                    // reserved
    entry.writeUInt16LE(1, 4)                 // color planes
    entry.writeUInt16LE(32, 6)                // bits per pixel
    entry.writeUInt32LE(pngs[i].length, 8)   // size of image data
    entry.writeUInt32LE(currentOffset, 12)   // offset to image data
    currentOffset += pngs[i].length
    entries.push(entry)
  }

  const ico = Buffer.concat([header, ...entries, ...pngs])
  const out = resolve(root, 'public/favicon.ico')
  writeFileSync(out, ico)
  console.log(`  ✓  public/favicon.ico  (${sizes.join(', ')}px)`)
}

async function main() {
  console.log('\nGenerating PWA icons from public/favicon.png …\n')

  await makeIcon({ output: 'public/pwa-192x192.png',           size: 192, logoScale: 0.62 })
  await makeIcon({ output: 'public/pwa-512x512.png',           size: 512, logoScale: 0.62 })
  await makeIcon({ output: 'public/pwa-512x512-maskable.png',  size: 512, logoScale: 0.40 })
  await makeIcon({ output: 'public/apple-touch-icon.png',      size: 180, logoScale: 0.62 })
  await makeFavico()

  console.log('\nDone. Place the files in /public/ (already done) and rebuild.\n')
}

main().catch((err) => { console.error(err); process.exit(1) })
