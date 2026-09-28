import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '#/components/HomePage.tsx'
import * as content from '#/components/data.ts'
import { homeHead } from '#/seo.ts'

export const Route = createFileRoute('/')({
  head: () => homeHead('fr'),
  component: () => <HomePage content={content} />,
})
