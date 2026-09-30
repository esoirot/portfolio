import { describe, expect, it } from 'vitest'
import { contentSecurityPolicy, securityHeaders } from './security-headers.ts'

const directives = (policy: string) =>
  Object.fromEntries(
    policy.split('; ').map((d) => {
      const [name, ...values] = d.split(' ')
      return [name, values]
    }),
  )

describe('contentSecurityPolicy', () => {
  it('given a nonce, then scripts need it and inline scripts are not blanket-allowed', () => {
    const csp = directives(contentSecurityPolicy('abc123'))

    expect(csp['script-src']).toEqual(["'self'", "'nonce-abc123'"])
  })

  it('given no nonce, then it falls back to allowing inline scripts', () => {
    const csp = directives(contentSecurityPolicy())

    expect(csp['script-src']).toEqual(["'self'", "'unsafe-inline'"])
  })

  it('then everything else is locked to the site itself, and it can never be framed', () => {
    const csp = directives(contentSecurityPolicy('n'))

    expect(csp).toMatchObject({
      'default-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'"],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
    })
  })
})

describe('securityHeaders', () => {
  it('then it carries the CSP for its nonce plus every hardening header', () => {
    expect(securityHeaders('n1')).toEqual({
      'content-security-policy': contentSecurityPolicy('n1'),
      'strict-transport-security': 'max-age=63072000',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy':
        'camera=(), microphone=(), geolocation=(), browsing-topics=()',
    })
  })
})
