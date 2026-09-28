import { afterEach, describe, expect, it, vi } from 'vitest'
import { act } from '@testing-library/react'
import { FlipDiskHeading } from './FlipDisplay.tsx'
import { renderAt, renderToHtmlAt } from '#/test/router.tsx'
import { stubIntersectionObserver, stubReducedMotion } from '#/test/observer.ts'

function tileText(root: HTMLElement) {
  return [...root.querySelectorAll('.flip-tile-face')]
    .map((face) => face.textContent)
    .join('')
}

describe('FlipDiskHeading', () => {
  it('given no JS has run, then the kicker tiles already spell index and kicker', async () => {
    const html = await renderToHtmlAt(
      <FlipDiskHeading index="02" kicker="Projets" title="" />,
    )

    expect(tileText(html)).toBe('02PROJETS')
  })

  it('given the board has not scrolled into view, when hydrated, then tiles blank out to await the flip', async () => {
    const { container } = await renderAt(
      <FlipDiskHeading index="02" kicker="Projets" title="" />,
    )

    expect(tileText(container).trim()).toBe('')
  })
})

describe('FlipDiskHeading with reduced motion', () => {
  it('given reduced motion, when hydrated, then tiles show their text without flipping', async () => {
    stubReducedMotion(true)

    const { container } = await renderAt(
      <FlipDiskHeading index="02" kicker="Projets" title="" />,
    )

    expect(tileText(container)).toBe('02PROJETS')
  })
})

describe('FlipDiskHeading outline', () => {
  it('then the section is named by an h2 carrying the kicker', async () => {
    const html = await renderToHtmlAt(
      <FlipDiskHeading index="02" kicker="Projets" title="" />,
    )

    const h2s = html.querySelectorAll('h2')
    expect(h2s).toHaveLength(1)
    expect(h2s[0].textContent).toBe('Projets')
  })
})

describe('FlipDiskHeading boot', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('given the board is offscreen, then it waits blank; when it scrolls into view, the tiles flip to the text', async () => {
    const io = stubIntersectionObserver()
    const { container } = await renderAt(
      <FlipDiskHeading index="02" kicker="Projets" title="" />,
    )
    const board = container.querySelector('.flip-board')!
    vi.useFakeTimers()

    io.scrollOutOfView(board)
    await act(() => vi.advanceTimersByTimeAsync(3_000))
    expect(tileText(container).trim()).toBe('')

    io.scrollIntoView(board)
    for (let t = 0; t < 3_000; t += 100)
      await act(() => vi.advanceTimersByTimeAsync(100))
    expect(tileText(container)).toBe('02PROJETS')
  })

  it('then the board fades in through CSS, never hidden by script', async () => {
    stubIntersectionObserver()
    const { container } = await renderAt(
      <FlipDiskHeading index="02" kicker="Projets" title="" />,
    )

    const board = container.querySelector<HTMLElement>('.flip-board')!
    expect(board.classList.contains('scroll-reveal')).toBe(true)
    expect(board.style.opacity).toBe('')
  })
})
