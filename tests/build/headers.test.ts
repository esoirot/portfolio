import { describe, expect, it } from 'vitest'
import { useProdServer } from './server.ts'

const { get, page } = useProdServer(4468)

const PATHS = [
  '/',
  '/en/projects/translator-steward',
  '/sitemap.xml',
  '/tech-icons.svg',
]
const PAGES = ['/', '/en', '/en/projects/translator-steward']

function csp(res: Response) {
  const policy = res.headers.get('content-security-policy') ?? ''
  return Object.fromEntries(
    policy
      .split(';')
      .map((d) => d.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, ...values]) => [name, values]),
  )
}

describe.each(PATHS)('security headers on %s', (path) => {
  it('then the CSP only lets the site load its own resources, and never be framed', async () => {
    const policy = csp(await get(path))

    expect(policy['default-src']).toEqual(["'self'"])
    expect(policy['object-src']).toEqual(["'none'"])
    expect(policy['base-uri']).toEqual(["'self'"])
    expect(policy['frame-ancestors']).toEqual(["'none'"])
    // would upgrade http://localhost dev/preview requests to https
    expect(policy).not.toHaveProperty('upgrade-insecure-requests')
  })

  it('then it sets HSTS, nosniff, referrer and permissions policies', async () => {
    const res = await get(path)

    expect(res.headers.get('strict-transport-security')).toMatch(
      /max-age=\d{8,}/,
    )
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
    expect(res.headers.get('x-frame-options')).toBe('DENY')
    expect(res.headers.get('referrer-policy')).toBe(
      'strict-origin-when-cross-origin',
    )
    expect(res.headers.get('permissions-policy')).toContain('camera=()')
  })
})

describe.each(PAGES)('strict script CSP on page %s', (path) => {
  it('then scripts need a per-request nonce — no unsafe-inline — and every inline script carries it', async () => {
    const res = await get(path)
    const html = await res.text()
    const scriptSrc = csp(res)['script-src']
    const nonce = /^'nonce-([^']+)'$/.exec(
      scriptSrc.find((v: string) => v.startsWith("'nonce-")) ?? '',
    )?.[1]

    expect(scriptSrc).not.toContain("'unsafe-inline'")
    expect(nonce).toMatch(/^[A-Za-z0-9+/=]{16,}$/)
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)]
      .map((m) => m[1])
      .filter((attrs) => !attrs.includes('application/ld+json'))
    expect(inline.length).toBeGreaterThan(0)
    for (const attrs of inline) expect(attrs).toContain(`nonce="${nonce}"`)
  })

  it('then each request gets a fresh nonce', async () => {
    const nonces = await Promise.all(
      [1, 2].map(async () =>
        csp(await get(path))['script-src'].find((v: string) =>
          v.startsWith("'nonce-"),
        ),
      ),
    )

    expect(nonces[0]).not.toBe(nonces[1])
  })
})

describe('CSP against what the page actually loads', () => {
  it('given the home page, then every script, stylesheet, preload and image is same-origin', async () => {
    const html = await page('/')

    const loaded = [
      ...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g),
      ...html.matchAll(
        /<link[^>]*rel="(?:stylesheet|preload|modulepreload)"[^>]*href="([^"]+)"/g,
      ),
      ...html.matchAll(/<img[^>]*\bsrc="([^"]+)"/g),
    ].map((m) => m[1])
    expect(loaded.length).toBeGreaterThan(0)
    expect(loaded.filter((url) => !url.startsWith('/'))).toEqual([])
  })

  it('given the icon sprite, then its long cache survives alongside the security headers', async () => {
    const res = await get('/tech-icons.svg')

    expect(res.headers.get('cache-control')).toContain('immutable')
    expect(res.headers.get('content-security-policy')).toBeTruthy()
  })
})
