import { contact } from '#/components/contact.ts'
import type { Project, Role } from '#/components/data.ts'
import { strings } from '#/i18n.tsx'
import type { Locale } from '#/i18n.tsx'

export const SITE_URL = 'https://www.esoirot.com'

const NAME = 'Eliott Soirot'
// core skills for the Person JSON-LD — a short curated list rather than
// data.ts's techStack, since route heads aren't code-split and reading
// the data there would put both locales' files in the main bundle.
const KNOWS_ABOUT = [
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'NestJS',
  'GraphQL',
  'PostgreSQL',
  'AWS',
  'Ruby on Rails',
  'Software architecture',
  'Domain-Driven Design',
]

const OG_LOCALE: Record<Locale, string> = { fr: 'fr_FR', en: 'en_US' }

/** Every page exists at a French path and its /en twin. */
function pathsFor(frPath: string): Record<Locale, string> {
  return { fr: frPath, en: frPath === '/' ? '/en' : `/en${frPath}` }
}

const absolute = (path: string) => `${SITE_URL}${path}`

/** Full per-page head: title/description mirrored into og + twitter,
    absolute canonical, fr/en/x-default alternates, and the locale's
    1200×630 share card (public/og-*.jpg). */
export function pageHead({
  locale,
  frPath,
  title,
  description,
}: {
  locale: Locale
  frPath: string
  title: string
  description: string
}) {
  const paths = pathsFor(frPath)
  const url = absolute(paths[locale])
  const image = absolute(`/og-${locale}.jpg`)
  const other: Locale = locale === 'fr' ? 'en' : 'fr'

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: NAME },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:locale', content: OG_LOCALE[locale] },
      { property: 'og:locale:alternate', content: OG_LOCALE[other] },
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: strings[locale].ogImageAlt },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
    links: [
      { rel: 'canonical', href: url },
      { rel: 'alternate', hrefLang: 'fr', href: absolute(paths.fr) },
      { rel: 'alternate', hrefLang: 'en', href: absolute(paths.en) },
      { rel: 'alternate', hrefLang: 'x-default', href: absolute(paths.fr) },
    ] as Array<{ rel: string; href: string; hrefLang?: string }>,
  }
}

export function buildSitemap(projectSlugs: Array<string>): string {
  const frPaths = ['/', ...projectSlugs.map((slug) => `/projects/${slug}`)]
  const urls = frPaths.flatMap((frPath) => {
    const paths = pathsFor(frPath)
    const alternates = (['fr', 'en'] as const)
      .map(
        (l) =>
          `    <xhtml:link rel="alternate" hreflang="${l}" href="${absolute(paths[l])}"/>`,
      )
      .join('\n')
    return (['fr', 'en'] as const).map(
      (l) =>
        `  <url>\n    <loc>${absolute(paths[l])}</loc>\n${alternates}\n  </url>`,
    )
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}

export function personJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: NAME,
    url: absolute(pathsFor('/')[locale]),
    image: absolute(`/og-${locale}.jpg`),
    jobTitle: strings[locale].jobTitle,
    email: `mailto:${contact.email}`,
    sameAs: [contact.github, contact.linkedin],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Paris',
      addressRegion: 'Île-de-France',
      addressCountry: 'FR',
    },
    knowsAbout: KNOWS_ABOUT,
  }
}

/** /llms.txt (llmstxt.org): a plain-markdown summary for LLM crawlers,
    built from the English content. */
export function buildLlmsTxt(content: {
  experience: Array<Role>
  projects: Array<Project>
}): string {
  const en = strings.en
  return [
    `# ${NAME}`,
    '',
    `> ${en.metaDescription}`,
    '',
    '## Links',
    '',
    `- [Portfolio (EN)](${absolute('/en')})`,
    `- [Portfolio (FR)](${absolute('/')})`,
    `- [Resume (PDF)](${absolute(en.cvHref)})`,
    `- [LinkedIn](${contact.linkedin})`,
    `- [GitHub](${contact.github})`,
    '',
    '## Experience',
    '',
    ...content.experience.map(
      (role) =>
        `- ${role.title} — ${role.company} (${role.period}, ${role.location}): ${role.stack.join(', ')}`,
    ),
    '',
    '## Projects',
    '',
    ...content.projects.map(
      (project) =>
        `- [${project.title}](${absolute(`/en/projects/${project.slug}`)}): ${project.summary}`,
    ),
    '',
  ].join('\n')
}

/** Home page head: pageHead plus the Person JSON-LD. */
export function homeHead(locale: Locale) {
  return {
    ...pageHead({
      locale,
      frPath: '/',
      title: strings[locale].metaTitle,
      description: strings[locale].metaDescription,
    }),
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(personJsonLd(locale)),
      },
    ],
  }
}
