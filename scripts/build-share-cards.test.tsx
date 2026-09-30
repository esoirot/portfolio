// @vitest-environment node
import { describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { renderShareCard, shareCardLines } from './build-share-cards.tsx'
import { strings } from '#/i18n.tsx'
import { SITE_URL } from '#/seo.ts'

describe('shareCardLines', () => {
  it.each(['fr', 'en'] as const)(
    'given %s, then the card carries the name, that language’s job title, location and the site domain',
    (locale) => {
      const lines = shareCardLines(locale)

      expect(lines.first).toBe('ELIOTT')
      expect(lines.last).toBe('SOIROT')
      expect(lines.jobTitle).toBe(strings[locale].jobTitle)
      expect(lines.location).toMatch(/Paris/)
      expect(lines.domain).toBe(new URL(SITE_URL).host)
    },
  )
})

describe('renderShareCard', () => {
  it('then it is a 1200×630 JPEG light enough for every platform', async () => {
    const jpg = await renderShareCard('fr')
    const meta = await sharp(jpg).metadata()

    expect(meta.format).toBe('jpeg')
    expect([meta.width, meta.height]).toEqual([1200, 630])
    expect(jpg.length).toBeLessThan(200_000)
  }, 30_000)

  it('then the two languages differ only where their text does', async () => {
    const [fr, en] = await Promise.all([
      renderShareCard('fr'),
      renderShareCard('en'),
    ])

    expect(fr.equals(en)).toBe(false)
  }, 30_000)
})
