// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/styles.css', 'utf8').replace(/\/\*.*?\*\//gs, '')

function keyframes(): Record<string, Set<string>> {
  const out: Record<string, Set<string>> = {}
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    let depth = 1
    let j = m.index + m[0].length
    const start = j
    while (depth) {
      if (css[j] === '{') depth++
      else if (css[j] === '}') depth--
      j++
    }
    out[m[1]] = new Set(
      [...css.slice(start, j).matchAll(/([\w-]+)\s*:/g)].map((p) => p[1]),
    )
  }
  return out
}

// animations that loop forever or never end (animation-timeline) run on
// every frame: they must stay on the compositor
const infinite = new Set(
  [...css.matchAll(/animation:\s*([\w-]+)[^;]*\binfinite\b/g)].map((m) => m[1]),
)

describe('styles.css animations stay off the main thread', () => {
  it('then no keyframes animate filter or clip-path (repainted every frame, and a filled last frame keeps re-rendering its subtree)', () => {
    const offenders = Object.entries(keyframes())
      .filter(([, props]) => props.has('filter') || props.has('clip-path'))
      .map(([name]) => name)

    expect(offenders).toEqual([])
  })

  it('then no infinite animation moves a background (full-layer repaint every frame)', () => {
    const offenders = Object.entries(keyframes())
      .filter(
        ([name, props]) =>
          infinite.has(name) && props.has('background-position'),
      )
      .map(([name]) => name)

    expect(offenders).toEqual([])
  })

  it('then the LCD fly-in leaves nothing behind once it ends', () => {
    const rule = /\.lcd-screen\s*\{([^}]*)\}/.exec(css)![1]

    expect(rule).toMatch(/animation-fill-mode:\s*backwards/)
  })
})
