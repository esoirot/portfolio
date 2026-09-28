import type { CSSProperties, ReactNode } from 'react'
import { cn } from '#/lib/utils.ts'
import { useOffscreenPause } from './use-offscreen-pause.ts'

// Title spark effect: 10 glowing-dot pellets fired in one synced
// "shotgun" blast (see .title-spark-pellet in styles.css), heading
// sideways — toward whichever side the blast's corner is on (left corner
// -> left, right corner -> right). SPARK_CYCLE_MS must match
// .title-spark-pellet's `animation: title-spark-shotgun 4s` in
// styles.css. Used by FlipDisplay.tsx's replay button burst.
export const SPARK_CYCLE_MS = 4000

// real projectile motion, vertical axis: launched at `angle` with
// `speed`, constant `gravity` pulling it back down —
//   y(t) = sin(angle) * speed * t + gravity * t²
// t is normalized progress (0 = launch, 1 = landed). Unlike the earlier
// two-phase version (a separate decelerating-rise curve glued to a
// separate accelerating-fall curve), this is ONE continuous parabola —
// the "goes up, slows, turns, speeds up falling" shape falls out of the
// math on its own instead of being stitched together by hand. (x isn't
// driven off this same formula — see randomSparkPellet for why.)
function moltenSlugY(
  t: number,
  angle: number,
  speed: number,
  gravity: number,
): number {
  return Math.sin(angle) * speed * t + gravity * t * t
}

// keyframe % offsets can't read a CSS var — they're static per rule — so
// a per-pellet random flight (apex timing, fall speed, distance) means
// each pellet needs its own @keyframes rule. Built here as plain CSS
// text and injected via a <style> tag rather than driving the motion
// from a JS rAF loop — one rule per pellet instead of one shared rule.
//
// `angle`/`speed`/`gravity` are solved (not guessed) from two things we
// actually want to control: when the apex happens (`apexFrac`, 0-1 of
// the flight) and how far it's fallen by the time the flight ends
// (`fallPx`) — see randomSparkPellet for the solve. `flightPct` is what
// % of the pellet's full (4s) animation cycle that flight takes; past
// it the pellet just holds at its last (already faded-out) position —
// CSS keeps the last defined keyframe value when nothing redefines it,
// so that needs no extra stop. `driftPx` is x's own (linear, constant-
// velocity) sideways distance — see randomSparkPellet for why it's not
// sharing `speed`/`angle` with the vertical formula.
//
// `translate`/`scale` are used as their own CSS properties (not the
// `transform` shorthand) so the motion curve (translate, on the formula
// above) and the launch-flash pop (scale/opacity/box-shadow, on its own
// hand-tuned pacing) don't have to share keyframe stops.
function buildSparkKeyframes(
  name: string,
  flightPct: number,
  driftPx: number,
  angle: number,
  speed: number,
  gravity: number,
): string {
  const visual = [
    { opacity: 0, scale: 0.4, shadow: 'none' },
    {
      opacity: 1,
      scale: 1.8,
      shadow: '0 0 10px 4px rgba(255, 255, 255, 0.95)',
    },
    { opacity: 1, scale: 1.2, shadow: '0 0 8px 3px var(--spark-glow)' },
    { opacity: 0.9, scale: 0.85, shadow: '0 0 6px 2px var(--spark-glow)' },
    { opacity: 0.65, scale: 0.65, shadow: '0 0 5px 1px var(--spark-glow)' },
    { opacity: 0.4, scale: 0.5, shadow: 'none' },
    { opacity: 0.2, scale: 0.35, shadow: 'none' },
    { opacity: 0, scale: 0.25, shadow: 'none' },
  ]
  const fracs = [0, 0.1, 0.25, 0.4, 0.6, 0.75, 0.9, 1]

  const body = fracs
    .map((t, i) => {
      const x = driftPx * t
      const y = moltenSlugY(t, angle, speed, gravity)
      const v = visual[i]
      return `  ${(flightPct * t).toFixed(3)}% {
    opacity: ${v.opacity};
    scale: ${v.scale};
    translate: ${x.toFixed(1)}px ${y.toFixed(1)}px;
    box-shadow: ${v.shadow};
  }`
    })
    .join('\n')

  return `@keyframes ${name} {\n${body}\n}`
}

export function randomSparkPellet(
  name: string,
  direction: -1 | 1,
): { style: CSSProperties; keyframes: string } {
  // launch angle: mostly sideways (toward `direction`), tilted a little
  // above horizontal (4-18deg, ~10deg average) — "up" is negative y on
  // screen, so this is always slightly negative regardless of direction.
  const tiltRad = ((4 + Math.random() * 14) * Math.PI) / 180
  const angle = direction === 1 ? -tiltRad : Math.PI + tiltRad

  // angle/speed/gravity are solved (not guessed) from the two things
  // that actually matter for "feel": apexFrac (0-1, when the pellet
  // turns — kept small so it reads as a quick up-flick, not a lob) and
  // fallPx (how far it's dropped by the time the flight ends). Given
  // those, moltenSlugY(t) = sin(angle)*speed*t + gravity*t² has to
  // satisfy y'(apexFrac) = 0 (apex) and y(1) = fallPx (landing spot):
  //   gravity = fallPx / (1 - 2 * apexFrac)
  //   speed   = -2 * gravity * apexFrac / sin(angle)
  // speed only drives the vertical formula — x below is its own
  // independent, constant-velocity drift, not cos(angle)*speed. Sharing
  // one speed between both axes (the literal sideways/vertical split of
  // a single launch vector) would shrink x toward 0 right along with
  // speed whenever apexFrac is near 0 (almost no upward velocity),
  // silently killing the sideways drift that's the whole point of
  // `direction`.
  const apexFrac = 0.05 + Math.random() * 0.2
  const fallPx = 150 + Math.random() * 200
  const gravity = fallPx / (1 - 2 * apexFrac)
  const speed = (-2 * gravity * apexFrac) / Math.sin(angle)

  const driftPx = direction * (90 + Math.random() * 70)

  // random flight duration: 0.5-1.5s total (of which apexFrac is spent
  // rising, so ~0.025-0.3s of that is the "up" part) — independent of
  // the fixed 4s/SPARK_CYCLE_MS total, which is just how often
  // a looping blast re-rolls; past this the pellet holds
  // at its already-faded final position.
  const flightMs = 500 + Math.random() * 1000
  const flightPct = (flightMs / SPARK_CYCLE_MS) * 100

  return {
    style: { animationName: name },
    keyframes: buildSparkKeyframes(
      name,
      flightPct,
      driftPx,
      angle,
      speed,
      gravity,
    ),
  }
}

export function TechChip({ children }: { children: ReactNode }) {
  return <span className="tech-chip">{children}</span>
}

export function Section({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: ReactNode
}) {
  const ref = useOffscreenPause<HTMLElement>()

  return (
    <section
      id={id}
      ref={ref}
      className={cn('scroll-mt-24 relative py-20 sm:py-28', className)}
    >
      <div className="page-wrap relative">{children}</div>
    </section>
  )
}
