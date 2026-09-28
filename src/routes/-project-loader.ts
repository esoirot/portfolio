import { notFound, redirect } from '@tanstack/react-router'
import type { Project } from '#/components/data.ts'

// slugs that used to exist — kept alive as permanent redirects so old
// links and indexed URLs land on the renamed project.
const LEGACY_SLUGS: Partial<Record<string, string>> = {
  'freelance-companion': 'translator-steward',
}

export function findProject(
  projects: Array<Project>,
  slug: string,
  to: '/projects/$slug' | '/en/projects/$slug',
): Project {
  const renamed = LEGACY_SLUGS[slug]
  if (renamed)
    throw redirect({ to, params: { slug: renamed }, statusCode: 301 })
  const project = projects.find((p) => p.slug === slug)
  if (!project) throw notFound()
  return project
}
