import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { useReducedMotionSafe } from './use-reduced-motion.ts'
import { stubReducedMotion } from '#/test/observer.ts'

function renderProbe() {
  const seen: Array<boolean> = []
  function Probe() {
    seen.push(useReducedMotionSafe())
    return null
  }
  const view = render(<Probe />)
  return { seen, ...view }
}

describe('useReducedMotionSafe', () => {
  it('given user prefers reduced motion, when first rendering, then returns false to match the server render', () => {
    stubReducedMotion(true)

    const { seen } = renderProbe()

    expect(seen[0]).toBe(false)
  })

  it('given user prefers reduced motion, when mounted, then settles on true', () => {
    stubReducedMotion(true)

    const { seen } = renderProbe()

    expect(seen.at(-1)).toBe(true)
  })

  it('given user has no motion preference, when mounted, then stays false', () => {
    stubReducedMotion(false)

    const { seen } = renderProbe()

    expect(seen.every((v) => v === false)).toBe(true)
  })

  it('given the preference changes after mount, then it follows', () => {
    const motion = stubReducedMotion(false)
    const { seen } = renderProbe()

    motion.change(true)

    expect(seen.at(-1)).toBe(true)
  })

  it('given it unmounts, then it stops listening', () => {
    const motion = stubReducedMotion(false)
    const { unmount } = renderProbe()

    unmount()

    expect(motion.listenerCount()).toBe(0)
  })
})
