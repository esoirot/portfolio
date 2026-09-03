import { Section } from './shared.tsx'
import { useReveal } from './anime-primitives.tsx'
import { FlipDiskHeading } from './FlipDisplay.tsx'
import { AmmoConveyorDivider } from './HangarFooter.tsx'
import { PilotIdBadgeConcept } from './ContactConcepts.tsx'

/** v5-only fork of v2's Contact: the heading is FlipDiskHeading
    (FlipDisplay.tsx) instead of shared.tsx's plain-text SectionHeading,
    same as every other v5 section. The body is PilotIdBadgeConcept
    (ContactConcepts.tsx) — picked over 9 other candidates compared in
    place, after the first attempt (CyberdeckHolo + .card-comm*,
    Experience's comms-terminal look) was rejected. */
export function Contact() {
  const panelRef = useReveal<HTMLDivElement>()

  return (
    <Section id="contact">
      <FlipDiskHeading
        index="04"
        kicker="Contact"
        title=""
        kickerSize="lg"
        plainTitle
      />

      <div ref={panelRef} className="max-w-2xl">
        <PilotIdBadgeConcept />
      </div>

      <div className="mt-16">
        <AmmoConveyorDivider />
      </div>
      <p className="font-mono-tech mt-4 text-center text-xs text-[var(--text-dim)]">
        © {new Date().getFullYear()} Eliott Soirot
      </p>
    </Section>
  )
}
