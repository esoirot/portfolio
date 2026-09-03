import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '#/components/HomePage.tsx'
import { strings } from '#/i18n.tsx'

export const Route = createFileRoute('/en/')({
  head: () => ({
    meta: [
      { title: 'Eliott Soirot — Fullstack Engineer & Tech Lead' },
      { name: 'description', content: strings.en.metaDescription },
      { property: 'og:description', content: strings.en.metaDescription },
      { name: 'twitter:description', content: strings.en.metaDescription },
    ],
  }),
  component: HomePage,
})
