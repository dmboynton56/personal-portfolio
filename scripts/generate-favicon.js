const fs = require('fs/promises')
const path = require('path')
const sharp = require('sharp')

const root = process.cwd()
const publicDir = path.join(root, 'public')
const sourceIcon = path.join(publicDir, 'images', 'general', 'newicon.png')

const background = '#080808'
const iconPaddingRatio = 0.11

function icoDimensionByte(size) {
  return size >= 256 ? 0 : size
}

function buildIco(entries) {
  const headerSize = 6
  const directorySize = entries.length * 16
  let offset = headerSize + directorySize

  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(entries.length, 4)

  const directories = []
  for (const entry of entries) {
    const directory = Buffer.alloc(16)
    directory.writeUInt8(icoDimensionByte(entry.size), 0)
    directory.writeUInt8(icoDimensionByte(entry.size), 1)
    directory.writeUInt8(0, 2)
    directory.writeUInt8(0, 3)
    directory.writeUInt16LE(1, 4)
    directory.writeUInt16LE(32, 6)
    directory.writeUInt32LE(entry.buffer.length, 8)
    directory.writeUInt32LE(offset, 12)
    offset += entry.buffer.length
    directories.push(directory)
  }

  return Buffer.concat([header, ...directories, ...entries.map((entry) => entry.buffer)])
}

async function renderSignatureIcon(size) {
  const innerSize = Math.round(size * (1 - iconPaddingRatio * 2))
  const signature = await sharp(sourceIcon)
    .resize(innerSize, innerSize, {
      fit: 'contain',
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer()

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: signature, gravity: 'center' }])
    .png()
    .toBuffer()
}

async function writeIcon(filename, size) {
  const buffer = await renderSignatureIcon(size)
  await fs.writeFile(path.join(publicDir, filename), buffer)
  return buffer
}

async function main() {
  await fs.mkdir(publicDir, { recursive: true })

  const favicon16 = await writeIcon('favicon-16x16.png', 16)
  const favicon32 = await writeIcon('favicon-32x32.png', 32)
  const favicon48 = await writeIcon('favicon-48x48.png', 48)
  await writeIcon('favicon-96x96.png', 96)
  await writeIcon('apple-touch-icon.png', 180)
  await writeIcon('apple-icon.png', 180)
  await writeIcon('icon-192.png', 192)
  await writeIcon('icon-512.png', 512)

  // Keep legacy filenames aligned so old deploy previews and cards do not reuse the DB icon.
  await fs.writeFile(path.join(publicDir, 'favicon-icon.png'), favicon32)
  await fs.writeFile(path.join(publicDir, 'icon-icon.png'), await renderSignatureIcon(192))

  const faviconIco = buildIco([
    { size: 16, buffer: favicon16 },
    { size: 32, buffer: favicon32 },
    { size: 48, buffer: favicon48 },
  ])
  await fs.writeFile(path.join(publicDir, 'favicon.ico'), faviconIco)

  const manifest = {
    name: 'Drew Boynton',
    short_name: 'Drew Boynton',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    theme_color: '#000000',
    background_color: background,
    display: 'standalone',
  }

  await fs.writeFile(
    path.join(publicDir, 'site.webmanifest'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
