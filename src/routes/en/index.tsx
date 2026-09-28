import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '#/components/HomePage.tsx'
import * as content from '#/components/data.en.ts'
import { homeHead } from '#/seo.ts'

export const Route = createFileRoute('/en/')({
  head: () => homeHead('en'),
  component: () => <HomePage content={content} />,
})
