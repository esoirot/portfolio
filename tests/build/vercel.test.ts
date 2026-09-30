import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// `pnpm test:build` also builds with NITRO_PRESET=vercel into .vercel/output
const OUT = '.vercel/output'

type Route = {
  src?: string
  dest?: string
  headers?: object
  continue?: boolean
}

describe('Vercel routing (Build Output API)', () => {
  const routes: Array<Route> = JSON.parse(
    readFileSync(join(OUT, 'config.json'), 'utf8'),
  ).routes

  it('then every headers-only rule either continues or ends on a real static file — never swallowing pages before the server function', () => {
    const blocking = routes
      .filter((r) => r.headers && !r.dest && !r.continue)
      .filter((r) => {
        // a literal path ending routing is fine if that file exists
        const literal =
          r.src && !/[()*.+?[\]\\^$|]/.test(r.src.replace(/\./g, ''))
        return !(literal && existsSync(join(OUT, 'static', r.src!)))
      })
      .filter((r) => r.src !== '/assets/(.*)') // nitro's own hashed-asset cache rule

    expect(blocking).toEqual([])
  })

  it('then pages still reach the server function', () => {
    expect(routes.at(-1)).toMatchObject({ src: '/(.*)', dest: '/__server' })
  })
})
