import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { useProdServer } from './server.ts'

const PUBLIC = '.output/public'
const PORT = 4467
const SITE = 'https://www.esoirot.com'
const { get, page } = useProdServer(PORT)

const PAGES = [
  '/',
  '/en',
  '/projects/translator-steward',
  '/en/projects/translator-steward',
]

function headOf(html: string) {
  return html.slice(0, html.indexOf('</head>'))
}

describe.each(PAGES)('shipped page %s', (path) => {
  it('then it has exactly one title and one canonical, pointing at itself', async () => {
    const head = headOf(await page(path))

    expect(head.match(/<title>/g)).toHaveLength(1)
    const canonicals = [...head.matchAll(/rel="canonical" href="([^"]+)"/g)]
    expect(canonicals.map((m) => m[1])).toEqual([`${SITE}${path}`])
  })

  it('then it declares fr, en and x-default alternates', async () => {
    const head = headOf(await page(path))

    for (const lang of ['fr', 'en', 'x-default'])
      expect(head).toMatch(new RegExp(`hrefLang="${lang}"|hreflang="${lang}"`))
  })

  it('then its share tags carry no leftovers from another page', async () => {
    const head = headOf(await page(path))

    for (const key of ['og:title', 'twitter:title', 'description', 'og:image'])
      expect(
        head.match(new RegExp(`(name|property)="${key}"`, 'g')),
      ).toHaveLength(1)
  })
})

describe('shipped SEO resources', () => {
  it('given /sitemap.xml, then it lists every page in both languages', async () => {
    const res = await get('/sitemap.xml')
    const xml = await res.text()

    expect(res.headers.get('content-type')).toContain('xml')
    expect(xml.match(/<loc>/g)).toHaveLength(10)
    expect(xml).toContain(`<loc>${SITE}/en/projects/translator-steward</loc>`)
  })

  it('given /robots.txt, then it points crawlers at the sitemap', async () => {
    expect(await page('/robots.txt')).toContain(`Sitemap: ${SITE}/sitemap.xml`)
  })

  it('given /llms.txt, then it serves the markdown summary', async () => {
    const res = await get('/llms.txt')

    expect(res.headers.get('content-type')).toContain('text/plain')
    expect(await res.text()).toMatch(/^# Eliott Soirot/)
  })

  it('given the old project slug, then it redirects permanently to the new one', async () => {
    const res = await get('/projects/freelance-companion')

    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toMatch(
      /\/projects\/translator-steward$/,
    )
  })

  it('given the home page, then its Person JSON-LD parses', async () => {
    const html = await page('/')
    const json =
      /<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s.exec(
        html,
      )![1]

    expect(JSON.parse(json)).toMatchObject({
      '@type': 'Person',
      name: 'Eliott Soirot',
    })
  })

  it('given an unknown English URL, then the 404 is English and not indexable', async () => {
    const res = await get('/en/nope')
    const head = headOf(await res.text())

    expect(res.status).toBe(404)
    expect(head).toContain('Page not found')
    expect(head).toMatch(/name="robots" content="noindex"/)
  })

  it.each(['og-fr.jpg', 'og-en.jpg'])(
    'then share card %s is a light 1200×630 JPEG',
    (file) => {
      const jpg = readFileSync(join(PUBLIC, file))
      expect(jpg.subarray(0, 2).toString('hex')).toBe('ffd8')
      // SOF0/SOF2 frame header carries height then width
      const sof = jpg.findIndex(
        (b, i) => b === 0xff && (jpg[i + 1] === 0xc0 || jpg[i + 1] === 0xc2),
      )
      expect(jpg.readUInt16BE(sof + 5)).toBe(630)
      expect(jpg.readUInt16BE(sof + 7)).toBe(1200)
      expect(jpg.length).toBeLessThan(200_000)
    },
  )

  it('given the icon sprite, then it is served with a long immutable cache under a versioned URL', async () => {
    const html = await page('/')
    const href = /<use href="(\/tech-icons\.svg\?v=[0-9a-f]+)#/.exec(html)![1]
    const res = await get(href)

    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toContain('immutable')
    expect(res.headers.get('cache-control')).toContain('max-age=31536000')
  })

  it.each(['eliott-soirot-cv-fr.pdf', 'eliott-soirot-cv-en.pdf'])(
    'then resume %s carries a document title',
    (file) => {
      const pdf = readFileSync(join(PUBLIC, file)).toString('latin1')
      expect(pdf).toMatch(/\/Title\s*\(Eliott Soirot/)
    },
  )
})
