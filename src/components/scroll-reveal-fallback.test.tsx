import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { useScrollRevealFallback } from './scroll-reveal-fallback.ts'
import { stubIntersectionObserver, stubReducedMotion } from '#/test/observer.ts'

function stubScrollTimelineSupport(supported: boolean) {
  vi.stubGlobal('CSS', {
    supports: (q: string) =>
      q === 'animation-timeline: view()' ? supported : false,
  })
}

function Page() {
  useScrollRevealFallback()
  return (
    <>
      <div className="scroll-reveal" data-testid="above" />
      <div className="scroll-reveal" data-testid="below" />
    </>
  )
}

function renderPage() {
  // jsdom: every element's rect is 0 — place them before effects run
  const proto = HTMLElement.prototype
  const original = proto.getBoundingClientRect
  proto.getBoundingClientRect = function (this: HTMLElement) {
    return {
      top: this.dataset.testid === 'below' ? window.innerHeight + 500 : 10,
    } as DOMRect
  }
  const view = render(<Page />)
  proto.getBoundingClientRect = original
  return view
}

describe('useScrollRevealFallback', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('given the browser lacks scroll-driven animations, then below-the-fold reveals wait hidden', () => {
    stubScrollTimelineSupport(false)
    stubIntersectionObserver()
    const { getByTestId } = renderPage()

    expect(getByTestId('below').dataset.reveal).toBe('hidden')
    expect(getByTestId('above').dataset.reveal).toBeUndefined()
  })

  it('given the observer reports a reveal out of view, then it stays hidden', () => {
    stubScrollTimelineSupport(false)
    const io = stubIntersectionObserver()
    const { getByTestId } = renderPage()

    // real browsers fire this once on observe()
    io.scrollOutOfView(getByTestId('below'))

    expect(getByTestId('below').dataset.reveal).toBe('hidden')
  })

  it('given a hidden reveal scrolls into view, then it is shown, once', () => {
    stubScrollTimelineSupport(false)
    const io = stubIntersectionObserver()
    const { getByTestId } = renderPage()
    const below = getByTestId('below')

    io.scrollIntoView(below)
    io.scrollOutOfView(below)

    expect(below.dataset.reveal).toBe('shown')
    expect(io.isObserved(below)).toBe(false)
  })

  it('given the browser supports scroll-driven animations, then the fallback stays out of the way', () => {
    stubScrollTimelineSupport(true)
    stubIntersectionObserver()
    const { getByTestId } = renderPage()

    expect(getByTestId('below').dataset.reveal).toBeUndefined()
  })

  it('given reduced motion, then nothing is hidden', () => {
    stubScrollTimelineSupport(false)
    stubReducedMotion(true)
    stubIntersectionObserver()
    const { getByTestId } = renderPage()

    expect(getByTestId('below').dataset.reveal).toBeUndefined()
  })
})
