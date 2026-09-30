import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { createIsomorphicFn } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'
import { routeTree } from './routeTree.gen'
import { securityHeaders } from './security-headers.ts'

/** Server: sends this request's security headers + CSP (getRouter runs
    once per request on the server, for pages and server routes alike). Production mints a
    script nonce; dev falls back to 'unsafe-inline', since Vite's dev
    tooling injects inline scripts without one. */
const requestNonce = createIsomorphicFn()
  .server(() => {
    const nonce = import.meta.env.PROD
      ? btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))))
      : undefined
    for (const [name, value] of Object.entries(securityHeaders(nonce)))
      setResponseHeader(name, value)
    return nonce
  })
  .client(() => undefined)

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    ssr: { nonce: requestNonce() },
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
