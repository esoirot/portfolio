import type { ReactNode } from 'react'

/** Holographic Deck — barely-there housing: thin corner struts only, a
    glowing cyan edge, content reads as a floating projection rather
    than sitting behind physical bezel. Wraps ProjectPage's comms-terminal
    card. */
export function CyberdeckHolo({ children }: { children: ReactNode }) {
  return (
    <div className="cyberdeck-holo">
      <span
        className="cyberdeck-holo-corner cyberdeck-holo-corner--tl"
        aria-hidden="true"
      />
      <span
        className="cyberdeck-holo-corner cyberdeck-holo-corner--tr"
        aria-hidden="true"
      />
      <span
        className="cyberdeck-holo-corner cyberdeck-holo-corner--bl"
        aria-hidden="true"
      />
      <span
        className="cyberdeck-holo-corner cyberdeck-holo-corner--br"
        aria-hidden="true"
      />
      <div className="cyberdeck-holo-sweep" aria-hidden="true" />
      <div className="cyberdeck-holo-screen">{children}</div>
    </div>
  )
}
