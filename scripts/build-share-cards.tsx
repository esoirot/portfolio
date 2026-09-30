import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import sharp from 'sharp'
import { strings } from '../src/i18n.tsx'
import type { Locale } from '../src/i18n.tsx'
import { SITE_URL } from '../src/seo.ts'

/** public/og-{fr,en}.jpg — the 1200×630 share cards seo.ts points at.
    Regenerate with `pnpm og` after changing the job title (i18n.tsx),
    the domain (seo.ts) or the hangar/mech art. Raster layers are
    composed with sharp; the text is laid out by satori (glyphs become
    outlines, so it renders in the site's own fonts) and rasterized by
    resvg. */

const W = 1200
const H = 630
const ORANGE = '#f7a531'
const CYAN = '#4fd8e0'
const WHITE = '#eef2f2'
const DIM = '#7a8c93'

const font = (pkg: string, file: string) =>
  readFileSync(`node_modules/@fontsource/${pkg}/files/${file}`)

const FONTS = [
  {
    name: 'Orbitron',
    data: font('orbitron', 'orbitron-latin-900-normal.woff'),
    weight: 900 as const,
  },
  {
    name: 'JetBrains Mono',
    data: font('jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'),
    weight: 500 as const,
  },
  {
    name: 'JetBrains Mono',
    data: font('jetbrains-mono', 'jetbrains-mono-latin-600-normal.woff'),
    weight: 600 as const,
  },
]

export function shareCardLines(locale: Locale) {
  return {
    first: 'ELIOTT',
    last: 'SOIROT',
    jobTitle: strings[locale].jobTitle,
    location: 'Paris · Île-de-France · Remote',
    domain: new URL(SITE_URL).host,
  }
}

/** hangar crop + mech + left-to-right scrim + hazard stripes */
async function backdrop(): Promise<Buffer> {
  const hangar = await sharp('public/hangar-16-bit.webp')
    .resize({ width: W })
    .toBuffer({ resolveWithObject: true })
  const top = Math.round((hangar.info.height - H) / 2) + 60

  const mechHeight = 430
  const mech = await sharp('public/mech-roughneck.webp')
    .resize({ height: mechHeight })
    .toBuffer({ resolveWithObject: true })

  // text side stays dark (92%), fading to 33% by three quarters across
  const scrim = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="s" x1="0" x2="1">
      <stop offset="0" stop-color="#090b0d" stop-opacity="0.92"/>
      <stop offset="0.75" stop-color="#090b0d" stop-opacity="0.33"/>
    </linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/>
  </svg>`

  const stripe = (y: number) =>
    Array.from({ length: Math.ceil(W / 28) + 3 }, (_, i) => {
      const x = -40 + i * 28
      return `<polygon points="${x},${y + 10} ${x + 14},${y + 10} ${x + 24},${y} ${x + 10},${y}" fill="${ORANGE}" fill-opacity="0.67"/>`
    }).join('')
  const stripes = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${stripe(0)}${stripe(H - 10)}</svg>`

  return sharp(hangar.data)
    .extract({ left: 0, top, width: W, height: H })
    .composite([
      {
        input: mech.data,
        left: W - mech.info.width + 10,
        top: H - mechHeight - 24,
      },
      { input: Buffer.from(scrim) },
      { input: Buffer.from(stripes) },
    ])
    .png()
    .toBuffer()
}

async function textLayer(locale: Locale): Promise<Buffer> {
  const lines = shareCardLines(locale)
  const at = (top: number) => ({ position: 'absolute', left: 72, top }) as const
  const svg = await satori(
    <div style={{ display: 'flex', width: W, height: H, position: 'relative' }}>
      <div
        style={{
          ...at(112),
          fontFamily: 'Orbitron',
          fontSize: 112,
          color: ORANGE,
        }}
      >
        {lines.first}
      </div>
      <div
        style={{
          ...at(237),
          fontFamily: 'Orbitron',
          fontSize: 112,
          color: WHITE,
        }}
      >
        {lines.last}
      </div>
      <div
        style={{
          ...at(393),
          fontFamily: 'JetBrains Mono',
          fontWeight: 600,
          fontSize: 32,
          color: WHITE,
        }}
      >
        {lines.jobTitle}
      </div>
      <div
        style={{
          ...at(448),
          fontFamily: 'JetBrains Mono',
          fontWeight: 500,
          fontSize: 26,
          color: CYAN,
        }}
      >
        {lines.location}
      </div>
      <div
        style={{
          ...at(538),
          fontFamily: 'JetBrains Mono',
          fontWeight: 500,
          fontSize: 24,
          color: DIM,
        }}
      >
        {lines.domain}
      </div>
    </div>,
    { width: W, height: H, fonts: FONTS },
  )
  return Buffer.from(new Resvg(svg).render().asPng())
}

export async function renderShareCard(locale: Locale): Promise<Buffer> {
  const [base, text] = await Promise.all([backdrop(), textLayer(locale)])
  return sharp(base)
    .composite([{ input: text }])
    .jpeg({
      quality: 88,
      progressive: true,
      chromaSubsampling: '4:4:4',
      mozjpeg: true,
    })
    .toBuffer()
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const locale of ['fr', 'en'] as const)
    writeFileSync(`public/og-${locale}.jpg`, await renderShareCard(locale))
}
