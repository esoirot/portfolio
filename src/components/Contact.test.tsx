import { describe, expect, it } from 'vitest'
import { Contact } from './Contact.tsx'
import { renderAt, renderToHtmlAt } from '#/test/router.tsx'

describe('Contact', () => {
  it('then the badge reveals on scroll through CSS alone', async () => {
    const html = await renderToHtmlAt(<Contact />)

    expect(
      html.querySelector('.contact-idcard')!.closest('.scroll-reveal'),
    ).not.toBeNull()
  })

  it('given JS hydrates, then nothing is hidden by script', async () => {
    const { container } = await renderAt(<Contact />)

    const hidden = [...container.querySelectorAll<HTMLElement>('*')].filter(
      (el) => el.style.opacity === '0',
    )
    expect(hidden).toEqual([])
  })
})
