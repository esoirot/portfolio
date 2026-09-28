import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

// jsdom ships neither — components observe on mount.
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
globalThis.IntersectionObserver =
  NoopObserver as unknown as typeof IntersectionObserver
globalThis.ResizeObserver = NoopObserver

window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }) as unknown as MediaQueryList

Object.defineProperty(document, 'fonts', {
  configurable: true,
  value: { ready: Promise.resolve() },
})
