import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

const BAR_LEVEL_STOPS = 5

function randomBarLevel({
  minDelay = 0,
  maxDelay = 1.5,
  minDur = 1.5,
  maxDur = 2,
} = {}) {
  return {
    delay: Math.random() * (maxDelay - minDelay) + minDelay,
    duration: Math.random() * (maxDur - minDur) + minDur,
    levels: Array.from({ length: BAR_LEVEL_STOPS }, () => Math.random()),
  }
}

/** Per-bar random delay/duration/levels. Starts at a fixed, all-zero
    baseline (matches the server-rendered markup, since Math.random would
    otherwise pick differently on server vs. client and break hydration)
    and reshuffles once on mount, client-side only, so every bar drifts
    out of phase with its neighbors. `levels` is a run of random scaleY
    stops in [0, 1] — CSS keyframes (footer-div-bar-pulse, styles.css)
    walk through --s0..--s4 and loop back to --s0, so each bar takes its
    own jittery path across the full range instead of a fixed min/max
    pair. */
function useRandomBarLevels(
  count: number,
  options: { minDelay?: number; maxDelay?: number; minDur?: number; maxDur?: number } = {},
) {
  const [items, setItems] = useState(() =>
    Array.from({ length: count }, () => ({
      delay: 0,
      duration: options.minDur ?? 1.5,
      levels: Array.from({ length: BAR_LEVEL_STOPS }, () => 0),
    })),
  )
  useEffect(() => {
    setItems(Array.from({ length: count }, () => randomBarLevel(options)))
    // options intentionally excluded: reshuffle should run once on mount,
    // not whenever the caller's inline options object gets a new identity.
  }, [count])
  return items
}

/** Spreads a useRandomBarLevels item's delay/duration/levels into the
    --delay/--dur/--s0.. custom properties footer-div-bar-pulse (styles.css)
    reads from. */
function barLevelStyle(b: {
  delay: number
  duration: number
  levels: Array<number>
}): CSSProperties {
  const vars: Record<string, string> = {
    '--delay': `${b.delay}s`,
    '--dur': `${b.duration}s`,
  }
  b.levels.forEach((level, i) => {
    vars[`--s${i}`] = `${level}`
  })
  return vars
}

/** Project detail page footer separator — a live equalizer read, picked
    over 64 other R&D-lab-themed candidates compared in place before this
    file was trimmed down to the winner. The homepage keeps .hazard-stripe
    (styles.css) instead. */
export function SpectroBarsLiveDivider() {
  const bars = useRandomBarLevels(20)
  return (
    <div className="footer-div footer-div-spectrolive" aria-hidden="true">
      {bars.map((b, i) => (
        <span
          key={i}
          className="footer-div-spectrolive-bar"
          style={{
            ...barLevelStyle(b),
            background: i % 3 === 0 ? 'var(--cyan-deep)' : 'var(--cyan)',
          }}
        />
      ))}
    </div>
  )
}
