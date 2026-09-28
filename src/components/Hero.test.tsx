import { describe, expect, it } from 'vitest'
import { Hero } from './Hero.tsx'
import { renderAt, renderToHtmlAt } from '#/test/router.tsx'
import { stubIntersectionObserver } from '#/test/observer.ts'

describe('Hero', () => {
  it('given the server render, then entrance-animated parts carry the CSS entrance class', async () => {
    const html = await renderToHtmlAt(<Hero />)

    const h1 = html.querySelector('h1')!
    expect(h1.querySelectorAll('.hero-enter')).toHaveLength(2)
    expect(html.querySelectorAll('.cta-btn.hero-enter')).toHaveLength(3)
    expect(html.querySelectorAll('.cascade-stat.hero-enter')).toHaveLength(3)
  })

  it('given the page is painted, when JS hydrates, then nothing is hidden again', async () => {
    const { container } = await renderAt(<Hero />)

    const hidden = [...container.querySelectorAll<HTMLElement>('*')].filter(
      (el) => el.style.opacity === '0',
    )
    expect(hidden).toHaveLength(0)
  })

  it('then the entrance plays top to bottom: name, subtitle, buttons, then stats', async () => {
    const html = await renderToHtmlAt(<Hero />)

    const delays = [...html.querySelectorAll<HTMLElement>('.hero-enter')].map(
      (el) => parseInt(el.style.getPropertyValue('--enter-delay')),
    )
    const order = [
      ...html.querySelectorAll<HTMLElement>('h1 .hero-enter, p.hero-enter'),
      ...html.querySelectorAll<HTMLElement>('.cta-btn'),
    ].map((el) => parseInt(el.style.getPropertyValue('--enter-delay')))
    const stats = [...html.querySelectorAll<HTMLElement>('.cascade-stat')].map(
      (el) => parseInt(el.style.getPropertyValue('--enter-delay')),
    )
    expect(delays.every((d) => d > 0)).toBe(true)
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(new Set(order).size).toBe(order.length)
    expect(stats).toEqual([...stats].sort((a, b) => a - b))
    expect(new Set(stats).size).toBe(stats.length)
  })

  it('then the name reads as two words', async () => {
    const html = await renderToHtmlAt(<Hero />)

    expect(html.querySelector('h1')!.textContent).toMatch(/^ELIOTT\s+SOIROT$/)
  })

  it('then each stat keeps its real value as text and counts up visually from CSS', async () => {
    const html = await renderToHtmlAt(<Hero />)

    const stats = [...html.querySelectorAll('.cascade-stat')]
    const values = stats.map((s) => s.querySelector('.sr-only')!.textContent)
    expect(values).toEqual(['10+', '4', '1'])
    const counters = stats.map((s) =>
      s.querySelector<HTMLElement>('.count-up')!,
    )
    expect(counters.map((c) => c.style.getPropertyValue('--count-to'))).toEqual(
      ['10', '4', '1'],
    )
    expect(counters.map((c) => c.dataset.suffix)).toEqual(['+', '', ''])
    for (const c of counters) expect(c.getAttribute('aria-hidden')).toBe('true')
  })

  it('then the decorative keyword marquee is hidden from screen readers', async () => {
    const html = await renderToHtmlAt(<Hero />)

    const marquee = html.querySelector('.dock-marquee')!
    expect(marquee.getAttribute('aria-hidden')).toBe('true')
  })

  it('given the stats are below the fold, then their count-up waits paused until they scroll into view', async () => {
    const io = stubIntersectionObserver()
    const { container } = await renderAt(<Hero />)
    const grid = container.querySelector('.cascade-stat')!.parentElement!

    io.scrollOutOfView(grid)
    expect(grid.hasAttribute('data-offscreen')).toBe(true)

    io.scrollIntoView(grid)
    expect(grid.hasAttribute('data-offscreen')).toBe(false)
  })
})
