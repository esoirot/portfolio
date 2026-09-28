import { act } from '@testing-library/react'
import { vi } from 'vitest'

/** IntersectionObserver you drive by hand: `scrollIntoView(el)` /
    `scrollOutOfView(el)` fire the observer watching that element. */
export function stubIntersectionObserver() {
  const watchers: Array<{
    callback: IntersectionObserverCallback
    targets: Set<Element>
  }> = []

  class FakeObserver {
    watcher: (typeof watchers)[number]
    constructor(callback: IntersectionObserverCallback) {
      this.watcher = { callback, targets: new Set<Element>() }
      watchers.push(this.watcher)
    }
    observe(el: Element) {
      this.watcher.targets.add(el)
    }
    unobserve(el: Element) {
      this.watcher.targets.delete(el)
    }
    disconnect() {
      this.watcher.targets.clear()
    }
    takeRecords() {
      return []
    }
  }
  vi.stubGlobal('IntersectionObserver', FakeObserver)

  const fire = (el: Element, isIntersecting: boolean) =>
    act(() => {
      for (const w of watchers)
        if (w.targets.has(el))
          w.callback(
            [{ isIntersecting, target: el } as IntersectionObserverEntry],
            {} as IntersectionObserver,
          )
    })

  return {
    isObserved: (el: Element) => watchers.some((w) => w.targets.has(el)),
    scrollIntoView: (el: Element) => fire(el, true),
    scrollOutOfView: (el: Element) => fire(el, false),
  }
}

export function stubReducedMotion(matches: boolean) {
  const listeners = new Set<() => void>()
  const query = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (type: string, fn: () => void) => {
      if (type === 'change') listeners.add(fn)
    },
    removeEventListener: (type: string, fn: () => void) => {
      if (type === 'change') listeners.delete(fn)
    },
  }
  vi.stubGlobal('matchMedia', (media: string) =>
    media === query.media
      ? query
      : {
          matches: false,
          media,
          addEventListener() {},
          removeEventListener() {},
        },
  )
  return {
    listenerCount: () => listeners.size,
    change(next: boolean) {
      query.matches = next
      act(() => {
        for (const fn of listeners) fn()
      })
    },
  }
}
