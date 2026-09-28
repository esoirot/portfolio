import { createFileRoute } from '@tanstack/react-router'
import { ProjectPage } from '#/components/ProjectPage.tsx'
import { pageHead } from '#/seo.ts'
import { findProject } from '../-project-loader.ts'

export const Route = createFileRoute('/en/projects/$slug')({
  // dynamic import: see routes/projects.$slug.tsx
  loader: async ({ params }) => {
    const { projects } = await import('#/components/data.en.ts')
    return findProject(projects, params.slug, '/en/projects/$slug')
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead({
          locale: 'en',
          frPath: `/projects/${loaderData.slug}`,
          title: `${loaderData.title} — Eliott Soirot`,
          description: loaderData.summary,
        })
      : {},
  component: () => <ProjectPage project={Route.useLoaderData()} />,
})
