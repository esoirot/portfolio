import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { AmmoConveyorDivider } from './HangarFooter.tsx'

function render() {
  const div = document.createElement('div')
  div.innerHTML = renderToString(<AmmoConveyorDivider />)
  return div
}

describe('AmmoConveyorDivider', () => {
  it('then each crate type is drawn once and every crate on the belt reuses it', () => {
    const svg = render()

    const shapes = [...svg.querySelectorAll('defs g[id^="ammo-crate-"]')]
    expect(shapes.map((g) => g.id).sort()).toEqual([
      'ammo-crate-battery',
      'ammo-crate-missile',
      'ammo-crate-shell',
    ])
    const crates = svg.querySelectorAll('.hangar-footer-ammoconveyor-items use')
    expect(crates).toHaveLength(20)
    expect(
      svg.querySelectorAll('.hangar-footer-ammoconveyor-items rect'),
    ).toHaveLength(0)
  })

  it('then the two belt copies line up one sequence-width apart for a seamless loop', () => {
    const svg = render()

    const xs = [
      ...svg.querySelectorAll('.hangar-footer-ammoconveyor-items use'),
    ].map((u) => Number(u.getAttribute('x')))
    const seq = 10 * 40
    expect(xs.slice(0, 10).map((x) => x + seq)).toEqual(xs.slice(10))
    expect(xs[10]).toBe(20)
  })

  it('then every crate on the belt points at a crate shape defined in the belt', () => {
    const svg = render()

    const defined = new Set(
      [...svg.querySelectorAll('defs g[id]')].map((g) => `#${g.id}`),
    )
    for (const crate of svg.querySelectorAll(
      '.hangar-footer-ammoconveyor-items use',
    ))
      expect(defined).toContain(crate.getAttribute('href'))
  })
})
