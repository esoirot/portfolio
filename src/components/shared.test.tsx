import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Section } from './shared.tsx'
import { stubIntersectionObserver } from '#/test/observer.ts'

describe('Section', () => {
  it('given it scrolls out of view, then its animations are marked to pause', () => {
    const io = stubIntersectionObserver()
    const { container } = render(<Section id="stack">content</Section>)
    const section = container.querySelector('section')!

    io.scrollOutOfView(section)

    expect(section.hasAttribute('data-offscreen')).toBe(true)
  })
})
