import { describe, expect, it } from 'vitest'
import { PilotIdBadge } from './ContactBadge.tsx'
import { renderToHtmlAt } from '#/test/router.tsx'

function cvLink(html: HTMLElement) {
  return html.querySelector('a[download]')!
}

describe('PilotIdBadge', () => {
  it('given the French site, then the French resume downloads under a readable file name', async () => {
    const html = await renderToHtmlAt(<PilotIdBadge />)

    expect(cvLink(html).getAttribute('href')).toBe('/eliott-soirot-cv-fr.pdf')
    expect(cvLink(html).getAttribute('download')).toBe(
      'Eliott Soirot - CV Senior Fullstack Developer.pdf',
    )
  })

  it('given the English site, then the English resume downloads under a readable file name', async () => {
    const html = await renderToHtmlAt(<PilotIdBadge />, '/en')

    expect(cvLink(html).getAttribute('href')).toBe('/eliott-soirot-cv-en.pdf')
    expect(cvLink(html).getAttribute('download')).toBe(
      'Eliott Soirot - Resume Senior Fullstack Developer.pdf',
    )
  })
})
