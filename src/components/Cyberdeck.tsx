import type { ReactNode } from 'react'

/** Holographic Deck — barely-there housing: thin corner struts only, a
    glowing cyan edge, content reads as a floating projection rather
    than sitting behind physical bezel. Picked (over 4 sibling concepts —
    Slab Deck, Wrist Gauntlet, Briefcase Deck, Rack-Mount Module, all
    since deleted along with the comparison showcase that fed them
    sample content) to wrap Experience.tsx's real CommDetailPanel: a
    floating-projection frame suits a radio transcript better than a
    physical bezel would. */
export function CyberdeckHolo({ children }: { children: ReactNode }) {
  return (
    <div className="cyberdeck-holo">
      <span className="cyberdeck-holo-corner cyberdeck-holo-corner--tl" aria-hidden="true" />
      <span className="cyberdeck-holo-corner cyberdeck-holo-corner--tr" aria-hidden="true" />
      <span className="cyberdeck-holo-corner cyberdeck-holo-corner--bl" aria-hidden="true" />
      <span className="cyberdeck-holo-corner cyberdeck-holo-corner--br" aria-hidden="true" />
      <div className="cyberdeck-holo-sweep" aria-hidden="true" />
      <div className="cyberdeck-holo-screen">{children}</div>
    </div>
  )
}
