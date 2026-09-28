import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { useOffscreenPause } from './use-offscreen-pause.ts'
import { stubIntersectionObserver } from '#/test/observer.ts'

function Section() {
  const ref = useOffscreenPause<HTMLElement>()
  return <section ref={ref} data-testid="section" />
}

describe('useOffscreenPause', () => {
  it('given a section scrolls out of view, then it is marked offscreen', () => {
    const io = stubIntersectionObserver()
    const { getByTestId } = render(<Section />)
    const section = getByTestId('section')

    io.scrollOutOfView(section)

    expect(section.hasAttribute('data-offscreen')).toBe(true)
  })

  it('given an offscreen section scrolls back into view, then the mark is removed', () => {
    const io = stubIntersectionObserver()
    const { getByTestId } = render(<Section />)
    const section = getByTestId('section')

    io.scrollOutOfView(section)
    io.scrollIntoView(section)

    expect(section.hasAttribute('data-offscreen')).toBe(false)
  })

  it('given the section unmounts, then it is no longer observed', () => {
    const io = stubIntersectionObserver()
    const { getByTestId, unmount } = render(<Section />)
    const section = getByTestId('section')

    unmount()

    expect(io.isObserved(section)).toBe(false)
  })
})
