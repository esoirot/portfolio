/** Content-Security-Policy. Everything the site loads is same-origin
    (self-hosted fonts, no third-party scripts). Server-rendered pages in
    production get a per-request script nonce (router.tsx); everything
    else — dev server, non-HTML responses (vite.config.ts) — gets the
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
