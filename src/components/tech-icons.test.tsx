import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { TechIcon, TechIconSprite, hasTechIcon } from './tech-icons.tsx'
import {
  spriteVersion,
  techIconSpriteFile,
} from '../../scripts/build-icon-sprite.tsx'
import { TECH_ICON_SPRITE_VERSION } from './tech-icon-sprite-version.ts'

describe('TechIcon', () => {
  it('given a known tech, then it references its sprite symbol instead of inlining the path', () => {
    const { container } = render(<TechIcon tech="TypeScript" />)

    const use = container.querySelector('use')
    expect(use?.getAttribute('href')).toBe(
      `/tech-icons.svg?v=${TECH_ICON_SPRITE_VERSION}#ti-typescript`,
    )
    expect(container.querySelector('path')).toBeNull()
  })

  it('given aliases of the same brand, then they share one symbol', () => {
    const { container } = render(
      <>
        <TechIcon tech="React" />
        <TechIcon tech="React.js" />
      </>,
    )

    const hrefs = [...container.querySelectorAll('use')].map((u) =>
      u.getAttribute('href'),
    )
    expect(new Set(hrefs).size).toBe(1)
  })

  it('given the chip already shows the tech name, then the icon is hidden from assistive tech', () => {
    const { container } = render(<TechIcon tech="TypeScript" />)

    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
  })

  it('given a color, then the icon is filled with it', () => {
    const { container } = render(
      <TechIcon tech="TypeScript" color="var(--cyan)" />,
    )

    // symbols use fill="currentColor", so color travels as CSS color
    expect(container.querySelector('svg')?.style.color).toBe('var(--cyan)')
  })

  it('given a tech without a brand mark, then hasTechIcon is false', () => {
    expect(hasTechIcon('Prompt Engineering')).toBe(false)
    expect(hasTechIcon('TypeScript')).toBe(true)
  })
})

describe('TechIconSprite', () => {
  it('then every referenced symbol is defined exactly once', () => {
    const { container } = render(
      <>
        <TechIconSprite />
        <TechIcon tech="TypeScript" />
        <TechIcon tech="AWS" />
        <TechIcon tech="MySQL" />
        <TechIcon tech="MariaDB" />
      </>,
    )

    const ids = [...container.querySelectorAll('symbol')].map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const use of container.querySelectorAll('use')) {
      const id = use.getAttribute('href')!.split('#')[1]
      expect(ids.filter((x) => x === id)).toHaveLength(1)
      expect(
        container.querySelector(`#${id} path`)?.getAttribute('d'),
      ).toBeTruthy()
    }
  })

  it('then the shipped public/tech-icons.svg is exactly this sprite (run `pnpm icons` if not)', () => {
    const shipped = readFileSync('public/tech-icons.svg', 'utf8')

    expect(shipped).toBe(techIconSpriteFile())
  })

  it("then icon URLs carry the sprite file's content hash, so a changed sprite busts the cache", () => {
    expect(TECH_ICON_SPRITE_VERSION).toBe(spriteVersion(techIconSpriteFile()))
  })

  it('then the sprite file is a standalone SVG document', () => {
    const doc = new DOMParser().parseFromString(
      techIconSpriteFile(),
      'image/svg+xml',
    )

    expect(doc.querySelector('parsererror')).toBeNull()
    expect(doc.documentElement.getAttribute('xmlns')).toBe(
      'http://www.w3.org/2000/svg',
    )
  })
})

describe('TechIcon against the site data', () => {
  it('given every tech the site lists, then each one with a mark resolves to a real symbol', async () => {
    const fr = await import('./data.ts')
    const en = await import('./data.en.ts')
    const techs = new Set(
      [fr, en].flatMap((d) => [
        ...d.techStack.flatMap((g) => g.items),
        ...d.experience.flatMap((r) => r.stack),
        ...d.projects.flatMap((p) => p.stack),
      ]),
    )
    const { container } = render(<TechIconSprite />)
    const symbols = new Set(
      [...container.querySelectorAll('symbol')].map((s) => s.id),
    )

    const broken = [...techs].filter((tech) => {
      if (!hasTechIcon(tech)) return false
      const { container: icon } = render(<TechIcon tech={tech} />)
      const id = icon.querySelector('use')!.getAttribute('href')!.split('#')[1]
      return !symbols.has(id)
    })
    expect(broken).toEqual([])
  })

  it('given each brand, then its symbol is its own brand mark', () => {
    const pairs: Array<[string, string]> = [
      ['React.js', 'ti-react'],
      ['Next.js', 'ti-nextjs'],
      ['MariaDB', 'ti-mariadb'],
      ['MySQL', 'ti-mysql'],
      ['GitHub Actions', 'ti-githubactions'],
      ['React', 'ti-react'],
    ]
    for (const [tech, id] of pairs) {
      const { container } = render(<TechIcon tech={tech} />)
      expect(container.querySelector('use')!.getAttribute('href')).toBe(
        `/tech-icons.svg?v=${TECH_ICON_SPRITE_VERSION}#${id}`,
      )
    }
  })

  it('given no color, then the icon uses the orange theme color', () => {
    const { container } = render(<TechIcon tech="TypeScript" />)

    expect(container.querySelector('svg')?.style.color).toBe('var(--orange)')
  })

  it('given a tech without a mark, then TechIcon renders nothing', () => {
    const { container } = render(<TechIcon tech="Prompt Engineering" />)

    expect(container.innerHTML).toBe('')
  })
})
