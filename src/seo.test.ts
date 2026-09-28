import { beforeAll, describe, expect, it } from 'vitest'
import {
  SITE_URL,
  buildLlmsTxt,
  buildSitemap,
  homeHead,
  pageHead,
  personJsonLd,
} from './seo.ts'
import * as en from '#/components/data.en.ts'
import * as fr from '#/components/data.ts'

const metaContent = (
  head: ReturnType<typeof pageHead>,
  key: string,
): string | undefined =>
  head.meta.find(
    (m) =>
      ('name' in m && m.name === key) ||
      ('property' in m && m.property === key),
  )?.content

const link = (
  head: ReturnType<typeof pageHead>,
  rel: string,
  hreflang?: string,
) => head.links.find((l) => l.rel === rel && l.hrefLang === hreflang)?.href

describe('pageHead', () => {
  // built in beforeAll, not at describe level: a throw here must fail
  // the tests, not abort collecting them
  let frProject: ReturnType<typeof pageHead>
  let enHome: ReturnType<typeof pageHead>
  beforeAll(() => {
    frProject = pageHead({
      locale: 'fr',
      frPath: '/projects/echo',
      title: 'Écho — Eliott Soirot',
      description: 'desc',
    })
    enHome = pageHead({
      locale: 'en',
      frPath: '/',
      title: 'Home',
      description: 'desc en',
    })
  })

  it('then URLs are on the production domain', () => {
    expect(link(frProject, 'canonical')).toBe(
      'https://www.esoirot.com/projects/echo',
    )
  })

  it('then it declares an og:type', () => {
    expect(metaContent(frProject, 'og:type')).toBe('website')
  })

  it('given a French page, then its canonical is its own absolute URL', () => {
    expect(link(frProject, 'canonical')).toBe(`${SITE_URL}/projects/echo`)
  })

  it('given an English page, then its canonical is its /en URL', () => {
    expect(link(enHome, 'canonical')).toBe(`${SITE_URL}/en`)
  })

  it('given any page, then hreflang points fr, en and x-default at the twin pages', () => {
    expect(link(frProject, 'alternate', 'fr')).toBe(`${SITE_URL}/projects/echo`)
    expect(link(frProject, 'alternate', 'en')).toBe(
      `${SITE_URL}/en/projects/echo`,
    )
    expect(link(frProject, 'alternate', 'x-default')).toBe(
      `${SITE_URL}/projects/echo`,
    )
    expect(link(enHome, 'alternate', 'fr')).toBe(`${SITE_URL}/`)
    expect(link(enHome, 'alternate', 'en')).toBe(`${SITE_URL}/en`)
  })

  it('given any page, then title and description are shared by og and twitter', () => {
    for (const key of ['og:title', 'twitter:title'])
      expect(metaContent(frProject, key)).toBe('Écho — Eliott Soirot')
    for (const key of ['description', 'og:description', 'twitter:description'])
      expect(metaContent(frProject, key)).toBe('desc')
    expect(frProject.meta).toContainEqual({ title: 'Écho — Eliott Soirot' })
  })

  it('given any page, then shares render a large image card in its language', () => {
    expect(metaContent(frProject, 'og:image')).toBe(`${SITE_URL}/og-fr.jpg`)
    expect(metaContent(enHome, 'og:image')).toBe(`${SITE_URL}/og-en.jpg`)
    expect(metaContent(enHome, 'twitter:image')).toBe(`${SITE_URL}/og-en.jpg`)
    expect(metaContent(enHome, 'twitter:card')).toBe('summary_large_image')
    expect(metaContent(enHome, 'og:image:width')).toBe('1200')
    expect(metaContent(enHome, 'og:image:height')).toBe('630')
    expect(metaContent(enHome, 'og:image:alt')).toBeTruthy()
  })

  it('given any page, then og declares its url and locale', () => {
    expect(metaContent(frProject, 'og:url')).toBe(`${SITE_URL}/projects/echo`)
    expect(metaContent(frProject, 'og:locale')).toBe('fr_FR')
    expect(metaContent(frProject, 'og:locale:alternate')).toBe('en_US')
    expect(metaContent(enHome, 'og:locale')).toBe('en_US')
    expect(metaContent(enHome, 'og:locale:alternate')).toBe('fr_FR')
    expect(metaContent(enHome, 'og:site_name')).toBe('Eliott Soirot')
  })
})

describe('buildSitemap', () => {
  let xml: string
  beforeAll(() => {
    xml = buildSitemap(['echo', 'adaequatio'])
  })

  it('then it lists both homes and every project in both languages', () => {
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    expect(locs.sort()).toEqual(
      [
        `${SITE_URL}/`,
        `${SITE_URL}/en`,
        `${SITE_URL}/projects/echo`,
        `${SITE_URL}/en/projects/echo`,
        `${SITE_URL}/projects/adaequatio`,
        `${SITE_URL}/en/projects/adaequatio`,
      ].sort(),
    )
  })

  it('then each url declares its fr/en alternates', () => {
    const entry =
      /<url>(?:(?!<\/url>).)*<loc>[^<]*\/en\/projects\/echo<\/loc>.*?<\/url>/s.exec(
        xml,
      )![0]
    expect(entry).toContain(`hreflang="fr" href="${SITE_URL}/projects/echo"`)
    expect(entry).toContain(`hreflang="en" href="${SITE_URL}/en/projects/echo"`)
  })

  it('then it parses as well-formed XML', () => {
    const doc = new DOMParser().parseFromString(xml, 'application/xml')

    expect(doc.querySelector('parsererror')).toBeNull()
    expect(doc.documentElement.nodeName).toBe('urlset')
  })

  it('then it is a valid sitemap document', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
  })
})

describe('personJsonLd', () => {
  it('then it describes Eliott as a Person with his profiles', () => {
    const person = personJsonLd('en')

    expect(person['@type']).toBe('Person')
    expect(person.name).toBe('Eliott Soirot')
    expect(person.url).toBe(`${SITE_URL}/en`)
    expect(person.sameAs).toEqual(
      expect.arrayContaining([fr.contact.github, fr.contact.linkedin]),
    )
    expect(person.address.addressLocality).toBe('Paris')
    expect(person.address.addressCountry).toBe('FR')
    expect(person.knowsAbout).toContain('TypeScript')
  })

  it('then it is valid schema.org JSON-LD with an identity people can reach', () => {
    const person = personJsonLd('fr')

    expect(person['@context']).toBe('https://schema.org')
    expect(person.address['@type']).toBe('PostalAddress')
    expect(person.address.addressRegion).toBe('Île-de-France')
    expect(person.url).toBe(`${SITE_URL}/`)
    expect(person.image).toBe(`${SITE_URL}/og-fr.jpg`)
    expect(person.email).toBe(`mailto:${fr.contact.email}`)
  })

  it('given French, then the job title is French', () => {
    expect(personJsonLd('fr').jobTitle).toMatch(/Développeur/)
    expect(personJsonLd('en').jobTitle).toMatch(/Developer/)
  })
})

describe('homeHead', () => {
  it('given French, then the home canonical is the site root', () => {
    expect(homeHead('fr').links).toContainEqual({
      rel: 'canonical',
      href: `${SITE_URL}/`,
    })
  })

  it('then the home page gets its full head plus the Person JSON-LD', () => {
    const head = homeHead('en')

    expect(head.meta).toContainEqual({
      title: expect.stringMatching(/Senior Fullstack/),
    })
    expect(head.links).toContainEqual({
      rel: 'canonical',
      href: `${SITE_URL}/en`,
    })
    expect(head.scripts).toHaveLength(1)
    expect(head.scripts[0].type).toBe('application/ld+json')
    expect(JSON.parse(head.scripts[0].children)).toEqual(personJsonLd('en'))
  })
})

describe('buildLlmsTxt', () => {
  let txt: string
  beforeAll(() => {
    txt = buildLlmsTxt(en)
  })

  it('then it summarises who, every role and every project, with links', () => {
    expect(txt.startsWith('# Eliott Soirot')).toBe(true)
    for (const role of en.experience) expect(txt).toContain(role.company)
    for (const project of en.projects) {
      expect(txt).toContain(project.title)
      expect(txt).toContain(`${SITE_URL}/en/projects/${project.slug}`)
    }
    expect(txt).toContain(fr.contact.linkedin)
    expect(txt).toContain(`${SITE_URL}/eliott-soirot-cv-en.pdf`)
  })

  it('then it follows the llms.txt layout: summary quote, then link sections', () => {
    const lines = txt.split('\n')

    expect(lines.find((l) => l.startsWith('> '))).toMatch(
      /senior fullstack developer/,
    )
    for (const heading of ['## Links', '## Experience', '## Projects'])
      expect(lines).toContain(heading)
    expect(txt).toContain(`- [Portfolio (EN)](${SITE_URL}/en)`)
    expect(txt).toContain(`- [Portfolio (FR)](${SITE_URL}/)`)
    expect(txt).toContain(`- [GitHub](${fr.contact.github})`)
  })
})
