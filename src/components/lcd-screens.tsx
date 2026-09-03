import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

export type EnterDirection = 'left' | 'right'

function randomLcdTiming(): CSSProperties {
  const jitterDuration = 6 + Math.random() * 4 // 6-10s
  const sparkDuration = 5 + Math.random() * 5 // 5-10s
  return {
    // negative delay starts the loop already mid-cycle, so instances
    // never launch in phase with each other even on first paint
    '--lcd-jitter-duration': `${jitterDuration.toFixed(2)}s`,
    '--lcd-jitter-delay': `-${(Math.random() * jitterDuration).toFixed(2)}s`,
    '--lcd-spark-duration': `${sparkDuration.toFixed(2)}s`,
    '--lcd-spark-delay': `-${(Math.random() * sparkDuration).toFixed(2)}s`,
  } as CSSProperties
}

/** One arm-mounted CRT monitor: flies in from `enterFrom` (off-canvas),
    boots up with a power-on flicker, sparks periodically. The children are
    real Hero content (text/buttons) — this is chrome around it, not a
    decorative stand-in, so it carries no aria-hidden.

    `randomize` (default off — v2's own Hero doesn't pass it, so its 5
    screens keep their existing fixed/nth-of-type timing exactly as
    before) gives the screen's jitter/spark loops their own randomized
    duration + a negative delay, computed once per mount so instances
    desync instead of pulsing in lockstep — useful when many LcdMounts
    share a page (v3's console) and looking identically-timed reads as
    artificial. */
export function LcdMount({
  enterFrom,
  delayMs,
  label,
  children,
  randomize = false,
  showArm = true,
}: {
  enterFrom: EnterDirection
  delayMs: number
  label: string
  children: ReactNode
  randomize?: boolean
  showArm?: boolean
}) {
  const [timing] = useState(() => (randomize ? randomLcdTiming() : null))

  return (
    <div className="lcd-mount">
      <div
        className={`lcd-screen lcd-screen--enter-${enterFrom}`}
        style={{ animationDelay: `${delayMs}ms`, ...timing }}
      >
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
      {showArm && (
        <div
          className={`lcd-armature lcd-armature--${enterFrom}`}
          aria-hidden="true"
        >
          <div className="lcd-arm-beam" />
          <div className="lcd-arm-beam-inner" />
          <div className="lcd-arm-flange" />
          <div className="lcd-arm-end-plate" />
        </div>
      )}
    </div>
  )
}
