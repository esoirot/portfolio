import { describe, expect, it } from 'vitest'
import { experience, projects, techStack } from './data.ts'
import {
  experience as experienceEn,
  projects as projectsEn,
  techStack as techStackEn,
} from './data.en.ts'
import { TechStack } from './TechStack.tsx'
import { Projects } from './Projects.tsx'
import { Nav } from './Nav.tsx'
import { renderToHtmlAt } from '#/test/router.tsx'

function labels(root: HTMLElement) {
  return [...root.querySelectorAll('[aria-label]')].map((el) =>
    el.getAttribute('aria-label')!,
  )
}

async function sectionsAt(locale: 'fr' | 'en') {
  const path = locale === 'en' ? '/en' : '/'
  const [stack, work] = await Promise.all([
    renderToHtmlAt(
      locale === 'en' ? (
        <TechStack techStack={techStackEn} experience={experienceEn} />
      ) : (
        <TechStack techStack={techStack} experience={experience} />
      ),
      path,
    ),
    renderToHtmlAt(
      <Projects projects={locale === 'en' ? projectsEn : projects} />,
      path,
    ),
  ])
  return [...labels(stack), ...labels(work)]
}

describe('screen-reader labels follow the page language', () => {
  it('given the English site, then no control is labelled in French', async () => {
    const all = await sectionsAt('en')

    expect(all).toContain('Filter experience by TypeScript')
    expect(all).toContain('Replay animation')
    expect(all).toContain('Replay boot animation')
    expect(all).toContain('Green phosphor mode')
    expect(
      all.filter((l) => /Filtrer|Rejouer|Voir le|Mode phosphore/.test(l)),
    ).toEqual([])
  })

  it('given the French site, then no control is labelled in English', async () => {
    const all = await sectionsAt('fr')

    expect(all).toContain("Filtrer l'expérience par TypeScript")
    expect(all).toContain("Rejouer l'animation")
    expect(all).toContain("Rejouer l'animation de démarrage")
    expect(all).toContain('Mode phosphore vert')
    expect(all).toContain('Mode couleurs normales')
    expect(
      all.filter((l) =>
        /Filter|Replay|View project|phosphor mode|color mode/.test(l),
      ),
    ).toEqual([])
  })

  it('given either site, then project links are labelled in that language', async () => {
    const en = await sectionsAt('en')
    const fr = await sectionsAt('fr')

    expect(en).toContain(`View project ${projectsEn[0].title}`)
    expect(fr).toContain(`Voir le projet ${projects[0].title}`)
  })

  it('then the language switch names each language in its own language', async () => {
    const html = await renderToHtmlAt(<Nav />)

    const fr = html.querySelector('a[hreflang="fr"]')!
    const en = html.querySelector('a[hreflang="en"]')!
    expect([fr.getAttribute('aria-label'), fr.getAttribute('lang')]).toEqual([
      'Français',
      'fr',
    ])
    expect([en.getAttribute('aria-label'), en.getAttribute('lang')]).toEqual([
      'English',
      'en',
    ])
  })
})
