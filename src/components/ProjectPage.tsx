import { ExternalLink, Radio } from 'lucide-react'
import type { Project } from './data.ts'
import { TechChip } from './shared.tsx'
import { Nav } from './Nav.tsx'
import { MechBayChevronBack } from './BackToHome.tsx'
import { CyberdeckHolo } from './Cyberdeck.tsx'
import { SpectroBarsLiveDivider } from './FooterDividers.tsx'
import { useStrings } from '#/i18n.tsx'

/** Shared project-detail body, reused by both the French (routes/
    projects.$slug.tsx) and English (routes/en/projects.$slug.tsx) route
    files — each just picks the localized `project` from data.ts/
    data.en.ts and passes it in. */
export function ProjectPage({ project }: { project: Project }) {
  const strings = useStrings()

  return (
    <div
      className="relative min-h-screen bg-[var(--void)] bg-cover bg-center bg-fixed text-[var(--text-strong)]"
      style={{ backgroundImage: "url('/rd-lab-16-bit.webp')" }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(9, 11, 13, 0.8)' }}
        aria-hidden="true"
      />
      <Nav />
      <div className="page-wrap relative py-20 sm:py-28">
        <MechBayChevronBack />

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          {project.logo && (
            <img
              src={project.logo}
              alt=""
              aria-hidden="true"
              className="size-8 object-contain"
            />
          )}
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {project.title}
          </h1>

          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono-tech text-xs tracking-widest text-[var(--orange)] uppercase hover:underline"
            >
              {strings.visitSite}
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
        <p className="mt-2 text-sm text-[var(--text-dim)]">{project.tagline}</p>

        <div className="mt-8 max-w-2xl">
          <CyberdeckHolo>
            <div className="card-comm card-comm--detail">
              <div className="card-comm-head">
                <Radio className="size-4" />
                {project.status.toUpperCase()}
                <span className="card-comm-bars" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              </div>
              <div className="card-comm-line">
                &lt;{project.title}&gt; {project.summary}
              </div>

              {project.bullets.map((bullet) => (
                <div
                  key={bullet}
                  className="card-comm-line card-comm-line--bullet"
                >
                  &gt; {bullet}
                </div>
              ))}

              {project.stack.length > 0 && (
                <>
                  <div className="card-comm-stack-label">
                    {strings.stackLabel}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {project.stack.map((tech) => (
                      <TechChip key={tech}>{tech}</TechChip>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CyberdeckHolo>
        </div>

        <div className="mt-16">
          <SpectroBarsLiveDivider />
        </div>
        <p className="font-mono-tech mt-4 text-center text-xs text-[var(--text-dim)]">
          © {new Date().getFullYear()} Eliott Soirot
        </p>
      </div>
    </div>
  )
}
