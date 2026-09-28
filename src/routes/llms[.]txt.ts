import { createFileRoute } from '@tanstack/react-router'
import * as content from '#/components/data.en.ts'
import { buildLlmsTxt } from '#/seo.ts'

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(buildLlmsTxt(content), {
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        }),
    },
  },
})
