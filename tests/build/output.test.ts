import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { useProdServer } from './server.ts'

const PUBLIC = '.output/public'
const PORT = 4466
const { page } = useProdServer(PORT)

function preloadedScripts(html: string) {
  return [...html.matchAll(/rel="modulepreload" href="([^"]+)"/g)].map((m) =>
    readFileSync(join(PUBLIC, m[1]), 'utf8'),
  )
}

describe('shipped home page', () => {
  // regression guard: 205 KB at the audit; 183 KB with every Experience
  // role in the HTML (SEO); sprite file + shared crate shapes cut it back
  it('given the French home, then its HTML stays under 140 KB', async () => {
    expect((await page('/')).length).toBeLessThan(140_000)
  })

  it('given the French home, then no English copy is downloaded', async () => {
    const scripts = preloadedScripts(await page('/'))

    // both only appear in data.en.ts
    const leaks = [
      'Engineering Degree',
      'Computer Science and Information Systems',
    ]
    expect(
      scripts.some((js) => leaks.some((marker) => js.includes(marker))),
    ).toBe(false)
  })

  it('given the English home, then no French-only copy is downloaded', async () => {
    const scripts = preloadedScripts(await page('/en'))

    // both only appear in data.ts's formations/experience (EN derives
    // just its techStack from data.ts)
    const leaks = [
      "Informatique et Systèmes d'Information",
      "Diplôme d'ingénieur",
    ]
    expect(
      scripts.some((js) => leaks.some((marker) => js.includes(marker))),
    ).toBe(false)
  })

  it('given tech icons, then the page only references them — the cached sprite file holds every path', async () => {
    const html = await page('/')
    const sprite = await page('/tech-icons.svg')

    expect(html).not.toContain('<symbol')
    const ids = [
      ...html.matchAll(/<use href="\/tech-icons\.svg\?v=[0-9a-f]+#([^"]+)"/g),
    ].map((m) => m[1])
    expect(ids.length).toBeGreaterThan(0)
    for (const id of new Set(ids))
      expect(sprite.match(new RegExp(`<symbol id="${id}"`, 'g'))).toHaveLength(
        1,
      )
  })

  it('then fonts are self-hosted, not fetched from Google', async () => {
    const html = await page('/')

    expect(html).not.toContain('fonts.googleapis.com')
    expect(html).not.toContain('fonts.gstatic.com')
    expect(html).toMatch(
      /rel="preload"[^>]*as="font"|as="font"[^>]*rel="preload"/,
    )
  })
})

describe('shipped client bundle', () => {
  it('then animejs is gone — every animation is CSS', () => {
    const assets = readdirSync(join(PUBLIC, 'assets')).filter((f) =>
      f.endsWith('.js'),
    )
    const withAnime = assets.filter((f) =>
      readFileSync(join(PUBLIC, 'assets', f), 'utf8').includes('animejs'),
    )
    expect(withAnime).toEqual([])
    expect(
      JSON.parse(readFileSync('package.json', 'utf8')).dependencies.animejs,
    ).toBeUndefined()
  })
})

describe('shipped CSS', () => {
  it('then it declares only the latin font faces the site uses', () => {
    const css = readdirSync(join(PUBLIC, 'assets'))
      .filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(join(PUBLIC, 'assets', f), 'utf8'))
      .join('')
    const families = [
      ...css.matchAll(/@font-face\{[^}]*font-family:\s*([^;]+);/g),
    ].map((m) => m[1].replace(/["']/g, ''))

    expect(families.sort()).toEqual([
      'JetBrains Mono Variable',
      'Manrope Variable',
      'Orbitron Variable',
      'Permanent Marker',
    ])
  })
})

describe('shipped static assets', () => {
  it('then no Windows Zone.Identifier leftovers ship', () => {
    expect(
      readdirSync(PUBLIC).filter((f) => f.includes('Zone.Identifier')),
    ).toEqual([])
  })

  it('then public file names are URL-safe', () => {
    const unsafe = readdirSync(PUBLIC).filter((f) => !/^[a-z0-9.-]+$/.test(f))
    expect(unsafe).toEqual([])
  })

  it.each(['hangar-16-bit.webp', 'rd-lab-16-bit.webp'])(
    'then background %s weighs under 160 KB',
    (file) => {
      expect(statSync(join(PUBLIC, file)).size).toBeLessThan(160_000)
    },
  )
})
