import { afterEach, describe, expect, it, vi } from 'vitest'
import { act } from '@testing-library/react'
import { experience, techStack } from './data.ts'
import { TechStack } from './TechStack.tsx'
import { hasTechIcon } from './tech-icons.tsx'
import { renderAt, renderToHtmlAt } from '#/test/router.tsx'
import { stubIntersectionObserver, stubReducedMotion } from '#/test/observer.ts'

// the always-rendered measuring clone is aria-hidden + visibility:hidden,
// so it doesn't count as content anyone can read.
function readableScreens(root: HTMLElement) {
  return [...root.querySelectorAll('.tech-crt-content')].filter(
    (el) => el.getAttribute('aria-hidden') !== 'true',
  )
}

describe('TechStack server render', () => {
  it('given no JS has run, then every group label is readable text', async () => {
    const html = await renderToHtmlAt(
      <TechStack techStack={techStack} experience={experience} />,
    )

    const text = readableScreens(html)
      .map((el) => el.textContent)
      .join(' ')
    for (const group of techStack) expect(text).toContain(group.label)
  })

  it('given no JS has run, then every tech chip is readable text', async () => {
    const html = await renderToHtmlAt(
      <TechStack techStack={techStack} experience={experience} />,
    )

    const text = readableScreens(html)
      .map((el) => el.textContent)
      .join(' ')
    for (const item of techStack.flatMap((g) => g.items))
      expect(text).toContain(item)
  })
})

describe('TechStack in the browser', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function realScreens(container: HTMLElement) {
    return readableScreens(container)
  }

  it('given the grid has not scrolled into view, when hydrated, then every screen is powered off', async () => {
    stubIntersectionObserver()
    const { container } = await renderAt(
      <TechStack techStack={techStack} experience={experience} />,
    )

    expect(realScreens(container)).toHaveLength(0)
  })

  it('given the observer reports the grid out of view, then screens stay powered off', async () => {
    const io = stubIntersectionObserver()
    const { container } = await renderAt(
      <TechStack techStack={techStack} experience={experience} />,
    )

    // real browsers fire this once on observe()
    io.scrollOutOfView(container.querySelector('.tech-grid')!)

    expect(realScreens(container)).toHaveLength(0)
  })

  it('given the grid scrolls into view, then screens boot in batches until every label and chip is shown', async () => {
    const io = stubIntersectionObserver()
    const { container } = await renderAt(
      <TechStack techStack={techStack} experience={experience} />,
    )
    vi.useFakeTimers()

    io.scrollIntoView(container.querySelector('.tech-grid')!)
    expect(realScreens(container)).toHaveLength(2)
    // stepped: each batch commits (and schedules its typing) between acts
    for (let t = 0; t < 20_000; t += 250)
      await act(() => vi.advanceTimersByTimeAsync(250))

    const text = realScreens(container)
      .map((el) => el.textContent)
      .join(' ')
    expect(realScreens(container)).toHaveLength(techStack.length)
    for (const item of techStack.flatMap((g) => [g.label, ...g.items]))
      expect(text).toContain(item)
  })

  it('given reduced motion, then every screen shows its full content without waiting for scroll', async () => {
    stubIntersectionObserver()
    stubReducedMotion(true)
    const { container } = await renderAt(
      <TechStack techStack={techStack} experience={experience} />,
    )

    const text = realScreens(container)
      .map((el) => el.textContent)
      .join(' ')
    for (const group of techStack) expect(text).toContain(group.label)
  })

  it('given any group, then chips with a brand mark show their icon', async () => {
    const html = await renderToHtmlAt(
      <TechStack techStack={techStack} experience={experience} />,
    )

    for (const [i, group] of techStack.entries()) {
      const screen = readableScreens(html)[i]
      const withIcon = group.items.filter(hasTechIcon)
      expect(screen.querySelectorAll('use')).toHaveLength(withIcon.length)
    }
  })
})
