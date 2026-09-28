import { createFileRoute } from '@tanstack/react-router'
import { projects } from '#/components/data.ts'
import { buildSitemap } from '#/seo.ts'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemap(projects.map((p) => p.slug)), {
          headers: { 'content-type': 'application/xml; charset=utf-8' },
        }),
    },
  },
})
