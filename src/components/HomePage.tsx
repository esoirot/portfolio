import type { Formation, Project, Role, TechGroup } from './data.ts'
import { Nav } from './Nav.tsx'
import { Contact } from './Contact.tsx'
import { Experience } from './Experience.tsx'
import { HangarBay } from './HangarBay.tsx'
import { Hero } from './Hero.tsx'
import { Projects } from './Projects.tsx'
import { TechStack } from './TechStack.tsx'
import { useScrollRevealFallback } from './scroll-reveal-fallback.ts'

export type HomeContent = {
  experience: Array<Role>
  formations: Array<Formation>
  techStack: Array<TechGroup>
  projects: Array<Project>
}

/** HangarBay (Battletech-style hangar bay, see HangarBay.tsx/.hangar-bay
    in styles.css) mounts before .scanline-overlay so the CRT scanline
    texture layers on top of it. Every section heading renders via
    FlipDiskHeading (FlipDisplay.tsx): index/kicker as a split-flap row,
    title on an arm-less LcdMount screen.

    No standalone Education section: the single diploma (data.ts's
    `formations`) is a Blueprint card rendered by Experience.tsx.

    `content` is the locale's data.ts/data.en.ts, picked by the route so
    each locale's bundle only carries its own copy. */
export function HomePage({ content }: { content: HomeContent }) {
  useScrollRevealFallback()

  return (
    <div className="portfolio">
      <HangarBay />
      <div className="scanline-overlay" aria-hidden="true" />
      <Nav />
      <Hero />
      <TechStack
        techStack={content.techStack}
        experience={content.experience}
      />
      <Experience
        experience={content.experience}
        formations={content.formations}
      />
      <Projects projects={content.projects} />
      <Contact />
    </div>
  )
}
