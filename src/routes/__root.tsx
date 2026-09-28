import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'

import appCss from '../styles.css?url'
import orbitronWoff2 from '@fontsource-variable/orbitron/files/orbitron-latin-wght-normal.woff2?url'
import { homePathFor, useLocale, useStrings } from '#/i18n.tsx'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
    ],
    links: [
      // the hero name's font — preloaded so it doesn't wait on the CSS
      {
        rel: 'preload',
        href: orbitronWoff2,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
  errorComponent: ErrorScreen,
})

// Routes set their own title/meta (seo.ts); a 404 matches none, so it
// declares its own — React hoists these into <head>.
function NotFound() {
  const strings = useStrings()
  return (
    <>
      <title>{`${strings.notFoundTitle} — Eliott Soirot`}</title>
      <meta name="robots" content="noindex" />
      <StatusScreen code="404" message={strings.notFoundTitle} />
    </>
  )
}

function ErrorScreen() {
  const strings = useStrings()
  return <StatusScreen code={strings.errorCode} message={strings.errorTitle} />
}

function StatusScreen({ code, message }: { code: string; message: string }) {
  const locale = useLocale()
  const strings = useStrings()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--void)] px-4 text-center text-[var(--text-strong)]">
      <p className="font-mono-tech text-sm tracking-widest text-[var(--text-dim)] uppercase">
        {code}
      </p>
      <h1 className="font-display text-2xl font-bold">{message}</h1>
      <Link
        to={homePathFor(locale)}
        className="mt-2 text-sm text-[var(--orange)] underline underline-offset-4"
      >
        {strings.backToHome}
      </Link>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  return (
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
