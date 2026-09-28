import { createFileRoute } from '@tanstack/react-router'
import { ProjectPage } from '#/components/ProjectPage.tsx'
import { pageHead } from '#/seo.ts'
import { findProject } from './-project-loader.ts'

export const Route = createFileRoute('/projects/$slug')({
  // dynamic import: loaders aren't code-split, so a static one would
  // put this locale's whole data file in every page's startup bundle.
  loader: async ({ params }) => {
    const { projects } = await import('#/components/data.ts')
    return findProject(projects, params.slug, '/projects/$slug')
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead({
          locale: 'fr',
          frPath: `/projects/${loaderData.slug}`,
          title: `${loaderData.title} — Eliott Soirot`,
          description: loaderData.summary,
        })
      : {},
  component: () => <ProjectPage project={Route.useLoaderData()} />,
})
