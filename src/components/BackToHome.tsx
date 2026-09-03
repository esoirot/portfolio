import { ChevronLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { homePathFor, useLocale, useStrings } from '#/i18n.tsx'

export function MechBayChevronBack() {
  const locale = useLocale()
  const strings = useStrings()
  return (
    <Link
      to={homePathFor(locale)}
      hash="projects"
      className="back-home back-home-mechbay"
      aria-label={strings.backToHome}
    >
      <span className="back-home-mechbay-stripe" aria-hidden="true" />
      <span className="back-home-mechbay-status" aria-hidden="true" />
      <ChevronLeft className="back-home-mechbay-icon" aria-hidden="true" />
      <span className="back-home-mechbay-label">{strings.home}</span>
    </Link>
  )
}
