import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'

import appCss from '../styles.css?url'
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
      {
        title: 'Eliott Soirot — Fullstack Engineer & Tech Lead',
      },
      {
        name: 'description',
        content:
          "Eliott Soirot, développeur fullstack et tech lead — 10+ ans d'expérience en TypeScript, React, Node.js, architecture et produit.",
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'Eliott Soirot — Fullstack Engineer & Tech Lead',
      },
      {
        property: 'og:description',
        content:
          "Eliott Soirot, développeur fullstack et tech lead — 10+ ans d'expérience en TypeScript, React, Node.js, architecture et produit.",
      },
      {
        name: 'twitter:card',
        content: 'summary',
      },
      {
        name: 'twitter:title',
        content: 'Eliott Soirot — Fullstack Engineer & Tech Lead',
      },
      {
        name: 'twitter:description',
        content:
          "Eliott Soirot, développeur fullstack et tech lead — 10+ ans d'expérience en TypeScript, React, Node.js, architecture et produit.",
      },
    ],
    links: [
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Permanent+Marker&display=swap',
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

function NotFound() {
  const strings = useStrings()
  return <StatusScreen code="404" message={strings.notFoundTitle} />
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
