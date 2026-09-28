import { describe, expect, it } from 'vitest'
import { isNotFound, isRedirect } from '@tanstack/react-router'
import { Route as FrRoute } from './projects.$slug.tsx'
import { Route as EnRoute } from './en/projects.$slug.tsx'
import { projects as projectsFr } from '#/components/data.ts'
import { projects as projectsEn } from '#/components/data.en.ts'

type Loader = (ctx: { params: { slug: string } }) => Promise<unknown>
const load = (route: { options: unknown }, slug: string) =>
  (route.options as { loader: Loader }).loader({ params: { slug } })

describe('project loaders', () => {
  it('given a known slug on the French route, then it loads the French project', async () => {
    expect(await load(FrRoute, projectsFr[0].slug)).toEqual(projectsFr[0])
  })

  it('given a known slug on the English route, then it loads the English project', async () => {
    expect(await load(EnRoute, projectsEn[0].slug)).toEqual(projectsEn[0])
  })

  it('given a later slug on the English route, then it loads that project, not the first', async () => {
    const last = projectsEn.at(-1)!
    expect(await load(EnRoute, last.slug)).toEqual(last)
  })

  it('given an unknown slug on the English route, then it throws notFound', async () => {
    const error = await load(EnRoute, 'nope').catch((e: unknown) => e)
    expect(isNotFound(error)).toBe(true)
  })

  it('given an unknown slug, then it throws notFound', async () => {
    const error = await load(FrRoute, 'nope').catch((e: unknown) => e)
    expect(isNotFound(error)).toBe(true)
  })

  it('given the old translator-app slug, then it permanently redirects to the new one', async () => {
    const error = await load(FrRoute, 'freelance-companion').catch(
      (e: unknown) => e,
    )

    expect(isRedirect(error)).toBe(true)
    const { options } = error as {
      options: { statusCode: number; to: string; params: unknown }
    }
    expect(options.statusCode).toBe(301)
    expect(options.to).toBe('/projects/$slug')
    expect(options.params).toEqual({ slug: 'translator-steward' })
  })

  it('given the old slug on the English route, then it redirects within English', async () => {
    const error = await load(EnRoute, 'freelance-companion').catch(
      (e: unknown) => e,
    )

    expect(isRedirect(error)).toBe(true)
    expect((error as { options: { to: string } }).options.to).toBe(
      '/en/projects/$slug',
    )
  })
})
