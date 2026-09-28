import { describe, expect, it } from 'vitest'
import { experience, formations } from './data.ts'
import { Experience } from './Experience.tsx'
import { renderToHtmlAt } from '#/test/router.tsx'

describe('Experience server render', () => {
  it('given no role is selected yet, then every role’s details are in the HTML', async () => {
    const html = await renderToHtmlAt(
      <Experience experience={experience} formations={formations} />,
    )

    for (const role of experience)
      for (const bullet of role.bullets)
        expect(html.textContent).toContain(bullet)
  })

  it('then only the selected role’s detail panel is shown in the desktop column', async () => {
    const html = await renderToHtmlAt(
      <Experience experience={experience} formations={formations} />,
    )

    const panels = [...html.querySelectorAll('[data-role-panel]')]
    expect(panels).toHaveLength(experience.length)
    expect(panels.filter((p) => !p.hasAttribute('hidden'))).toHaveLength(1)
  })
})
