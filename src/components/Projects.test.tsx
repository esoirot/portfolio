import { afterEach, describe, expect, it, vi } from 'vitest'
import { act } from '@testing-library/react'
import { projects } from './data.ts'
import { projects as projectsEn } from './data.en.ts'
import { Projects } from './Projects.tsx'
import { renderAt, renderToHtmlAt } from '#/test/router.tsx'
import { stubIntersectionObserver, stubReducedMotion } from '#/test/observer.ts'

function screenTexts(container: HTMLElement) {
  return [...container.querySelectorAll('.tech-crt-content')].map(
    (s) => s.textContent,
  )
}

describe('Projects', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('given no JS has run, then every project title is readable text', async () => {
    const html = await renderToHtmlAt(<Projects projects={projects} />)

    for (const project of projects)
      expect(html.textContent).toContain(project.title)
  })

  it('given the French site, then every project is a crawlable link to its page', async () => {
    const html = await renderToHtmlAt(<Projects projects={projects} />)

    const hrefs = [...html.querySelectorAll('a')].map((a) =>
      a.getAttribute('href'),
    )
    for (const project of projects)
      expect(hrefs).toContain(`/projects/${project.slug}`)
  })

  it('given the English site, then project links stay in English', async () => {
    const html = await renderToHtmlAt(<Projects projects={projectsEn} />, '/en')

    const hrefs = [...html.querySelectorAll('a')].map((a) =>
      a.getAttribute('href'),
    )
    for (const project of projectsEn)
      expect(hrefs).toContain(`/en/projects/${project.slug}`)
  })

  it('then cards reveal on scroll through CSS alone, never hidden by script', async () => {
    stubIntersectionObserver()
    const { container } = await renderAt(<Projects projects={projects} />)

    const cards = container.querySelectorAll<HTMLElement>(
      '.grid > .scroll-reveal',
    )
    expect(cards).toHaveLength(projects.length)
    for (const card of cards) expect(card.style.opacity).toBe('')
  })

  it('given English projects, then it renders what it is given', async () => {
    const html = await renderToHtmlAt(<Projects projects={projectsEn} />, '/en')

    expect(html.textContent).toContain(projectsEn[0].title)
  })

  it('given the grid has not scrolled into view, when time passes, then titles stay blank awaiting the boot typewriter', async () => {
    stubIntersectionObserver()
    const { container } = await renderAt(<Projects projects={projects} />)
    vi.useFakeTimers()

    await act(() => vi.advanceTimersByTimeAsync(5_000))

    expect(screenTexts(container)).toEqual(projects.map(() => ''))
  })

  it('given the observer reports the grid out of view, then titles stay blank', async () => {
    const io = stubIntersectionObserver()
    const { container } = await renderAt(<Projects projects={projects} />)
    vi.useFakeTimers()

    // real browsers fire this once on observe()
    io.scrollOutOfView(container.querySelector('.grid')!)
    await act(() => vi.advanceTimersByTimeAsync(5_000))

    expect(screenTexts(container)).toEqual(projects.map(() => ''))
  })

  it('given the grid scrolls into view, then each title types out in full', async () => {
    const io = stubIntersectionObserver()
    const { container } = await renderAt(<Projects projects={projects} />)
    vi.useFakeTimers()

    io.scrollIntoView(container.querySelector('.grid')!)
    await act(() => vi.advanceTimersByTimeAsync(5_000))

    expect(screenTexts(container)).toEqual(projects.map((p) => p.title))
  })

  it('given reduced motion, then titles show in full without waiting for scroll', async () => {
    stubIntersectionObserver()
    stubReducedMotion(true)
    const { container } = await renderAt(<Projects projects={projects} />)

    expect(screenTexts(container)).toEqual(projects.map((p) => p.title))
  })
})
