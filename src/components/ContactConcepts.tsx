import { Barcode, Download, Github, Linkedin, UserRound } from 'lucide-react'
import { Button } from '#/components/ui/button.tsx'
import { contact } from './data.ts'
import { useStrings } from '#/i18n.tsx'

/** Same variant/glow pattern as the Hero banner's CTAs (Hero.tsx):
    solid + orange glow for the primary link (LinkedIn here, "Voir le
    parcours" there), outline + cyan glow for the rest. */
function LinkRow() {
  const strings = useStrings()
  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <Button
        asChild
        className="font-bold transition-shadow hover:shadow-[0_0_20px_5px_rgba(247,165,49,0.65)]"
      >
        <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
          <Linkedin className="size-4" />
          LinkedIn
        </a>
      </Button>
      <Button
        asChild
        variant="outline"
        className="transition-shadow hover:shadow-[0_0_18px_4px_rgba(79,216,224,0.6)]"
      >
        <a href={strings.cvHref} download>
          <Download className="size-4" />
          {strings.downloadCv}
        </a>
      </Button>
      <Button
        asChild
        variant="outline"
        className="transition-shadow hover:shadow-[0_0_18px_4px_rgba(79,216,224,0.6)]"
      >
        <a href={contact.github} target="_blank" rel="noopener noreferrer">
          <Github className="size-4" />
          GitHub
        </a>
      </Button>
    </div>
  )
}

/** Contact section body — a mech-pilot ID card: silhouette block,
    callsign, contact lines, small barcode footer. Picked over 9 other
    candidates compared in place before this file was trimmed down to
    the winner (the CyberdeckHolo/comms-terminal first attempt was
    rejected before that comparison). */
export function PilotIdBadgeConcept() {
  const strings = useStrings()
  return (
    <div className="contact-idcard">
      <div className="contact-idcard-photo">
        <UserRound className="size-8 text-(--text-dim)" />
      </div>
      <div className="contact-idcard-body">
        <p className="contact-idcard-callsign">ELIOTT SOIROT</p>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="contact-idcard-email">{contact.email}</p>
          <p className="contact-idcard-sub">{strings.responseTime}</p>
        </div>
        <LinkRow />
      </div>
      <Barcode
        className="contact-idcard-barcode size-6 text-(--text-dim)"
        aria-hidden="true"
      />
    </div>
  )
}
