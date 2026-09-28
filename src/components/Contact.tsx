import { Section } from './shared.tsx'
import { FlipDiskHeading } from './FlipDisplay.tsx'
import { AmmoConveyorDivider } from './HangarFooter.tsx'
import { PilotIdBadge } from './ContactBadge.tsx'

/** Contact: a flip-board heading (no title screen) over the pilot ID
    badge (ContactBadge.tsx), then the conveyor footer. */
export function Contact() {
  return (
    <Section id="contact">
      <FlipDiskHeading index="04" kicker="Contact" title="" />

      <div className="scroll-reveal max-w-2xl">
        <PilotIdBadge />
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
