import { createFileRoute, notFound } from '@tanstack/react-router'
import { projects } from '#/components/data.ts'
import { ProjectPage } from '#/components/ProjectPage.tsx'

export const Route = createFileRoute('/projects/$slug')({
  loader: ({ params }) => {
    const project = projects.find((p) => p.slug === params.slug)
    if (!project) throw notFound()
    return project
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.title} — Eliott Soirot` },
            { name: 'description', content: loaderData.summary },
            {
              property: 'og:title',
              content: `${loaderData.title} — Eliott Soirot`,
            },
            { property: 'og:description', content: loaderData.summary },
          ],
        }
      : {},
  component: () => <ProjectPage project={Route.useLoaderData()} />,
})
