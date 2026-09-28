import type { ReactNode } from 'react'

/** A boxy CRT monitor: flies in from the left, boots up with a power-on
    flicker, sparks periodically. The children are real content (title
    or filter controls) — this is chrome around it, so it carries no
    aria-hidden. */
export function LcdMount({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="lcd-mount">
      <div className="lcd-screen lcd-screen--enter-left">
        <div className="lcd-rivet lcd-rivet--tl" aria-hidden="true" />
        <div className="lcd-rivet lcd-rivet--tr" aria-hidden="true" />
        <div className="lcd-rivet lcd-rivet--bl" aria-hidden="true" />
        <div className="lcd-rivet lcd-rivet--br" aria-hidden="true" />
        <div className="lcd-static" aria-hidden="true" />
        <div className="lcd-spark" aria-hidden="true" />
        <div className="lcd-power-led" aria-hidden="true" />
        <div className="lcd-screen-content">{children}</div>
        <div className="lcd-label" aria-hidden="true">
          {label}
        </div>
      </div>
    </div>
  )
}
