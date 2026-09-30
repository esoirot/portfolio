/** Content-Security-Policy. Everything the site loads is same-origin
    (self-hosted fonts, no third-party scripts). Server-rendered pages in
    production get a per-request script nonce (router.tsx); the dev
    server and the static sprite (vite.config.ts) get the
    'unsafe-inline' fallback, since Vite's dev tooling injects inline
    scripts. Styles stay 'unsafe-inline': React style attributes can't
    carry a nonce. */
export function contentSecurityPolicy(nonce?: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' ${nonce ? `'nonce-${nonce}'` : "'unsafe-inline'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self'",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
}

/** Every security header, sent per request by getRouter() for pages and
    server routes. Not a catch-all nitro routeRule: nitro's Vercel preset
    emits header rules without `continue`, so a `/**` rule would end
    routing before the server function and 404 every page. */
export function securityHeaders(nonce?: string): Record<string, string> {
  return {
    'content-security-policy': contentSecurityPolicy(nonce),
    'strict-transport-security': 'max-age=63072000',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy':
      'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  }
}
