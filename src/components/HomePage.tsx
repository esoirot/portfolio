import { CircuitDefs } from './anime-primitives.tsx'
import { Nav } from './Nav.tsx'
import { Contact } from './Contact.tsx'
import { Experience } from './Experience.tsx'
import { HangarBay } from './HangarBay.tsx'
import { Hero } from './Hero.tsx'
import { Projects } from './Projects.tsx'
import { TechStack } from './TechStack.tsx'

/** HangarBay (Battletech-style hangar bay, see HangarBay.tsx/.hangar-bay
    in styles.css) mounts before .scanline-overlay so the CRT scanline
    texture layers on top of it. Every section heading (Experience,
    TechStack, Projects, Contact) renders via FlipDiskHeading
    (FlipDisplay.tsx) — index/kicker flips as a split-flap row (Projects
    sizes it `kickerSize="lg"` to match its title), and every section's
    title renders inside an arm-less LcdMount screen instead of flipping
    (`plainTitle` + `titleLcd`).

    No standalone Education section: it was down to a single Blueprint
    card (the Cnam diploma, data.ts's `formations`), too thin to carry
    its own heading/spacing — Experience.tsx renders that card itself,
    beside its title on lg+ and after its content on small screens. */
export function HomePage() {
  return (
    <div className="portfolio-v5">
      <HangarBay />
      <div className="scanline-overlay" aria-hidden="true" />
      <CircuitDefs />
      <Nav />
      <Hero />
      <TechStack />
      <div className="v4-experience">
        <Experience />
      </div>
      <Projects />
      <Contact />
    </div>
  )
}
