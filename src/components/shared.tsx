import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { cn } from '#/lib/utils.ts'
import { useReveal, useScrollGlow } from './anime-primitives.tsx'

// v4-only title spark effect: 10 glowing-dot pellets fired in one synced
// "shotgun" blast (see .title-spark-pellet in styles.css), heading
// sideways — toward whichever side the blast's corner is on (left corner
// -> left, right corner -> right).
// spark blast spawns at one of the title's 4 corners, never along an edge.
// Must match .title-spark-pellet's `animation: title-spark-shotgun 4s` in
// styles.css — this is how often SectionHeading re-rolls corner/pellets.
// Exported (with randomSparkPellet below) so other v5-only components can
// reuse the exact same pellet trajectory/look for a one-shot, click-
// triggered burst instead of this file's own ambient auto-fire loop —
// see FlipDisplay.tsx's replay button.
export type SparkCornerStyle = CSSProperties &
  Record<'--spark-left' | '--spark-top', string>

export const SPARK_CYCLE_MS = 4000
export const SPARK_CORNERS: Array<SparkCornerStyle> = [
  { '--spark-left': '0%', '--spark-top': '0%' },
  { '--spark-left': '100%', '--spark-top': '0%' },
  { '--spark-left': '0%', '--spark-top': '100%' },
  { '--spark-left': '100%', '--spark-top': '100%' },
]

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
// from a JS rAF loop — keeps the "no animation orchestrator" approach
// the rest of this effect (and useReveal/useStagger) already uses, just
// with one rule per pellet instead of one shared rule.
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
  // SectionHeading re-rolls the whole blast; past this the pellet holds
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

export function SectionKicker({
  index,
  label,
}: {
  index: string
  label: string
}) {
  return (
    <div className="hud-kicker">
      <span className="hud-index">// {index}</span>
      <span>{label}</span>
    </div>
  )
}

export function SectionHeading({
  index,
  kicker,
  title,
  description,
  action,
}: {
  index: string
  kicker: string
  title: string
  description?: string
  action?: ReactNode
}) {
  const ref = useReveal<HTMLDivElement>()
  // v4-only: random corner spawn point + per-pellet trajectories for the
  // title's spark effect (see .section-heading-title/.title-spark-* in
  // styles.css) — inert on v1-v3, which don't read any of these vars.
  // Rolled in a useEffect (client-only, post-hydration) rather than a
  // useState lazy initializer — this app is SSR'd, and a value picked
  // during render runs once on the server and gets baked into the HTML;
  // React's hydration doesn't patch mismatched style attributes back to
  // the client's own random pick, so every title was stuck showing
  // whatever corner the server happened to roll.
  //
  // Re-rolled every SPARK_CYCLE_MS, not just once on mount, so each
  // shotgun blast fires from a fresh corner/spread instead of repeating
  // the same one forever. --spark-delay (this title's random offset
  // before its *first* blast, keeping the 4 section titles from firing in
  // lockstep) drives both the CSS animation-delay and this timer, so the
  // reroll lands in the ~35%-of-cycle gap where pellets are already
  // faded out — no visible teleport mid-flight.
  const [sparkCorner, setSparkCorner] = useState<SparkCornerStyle>(
    SPARK_CORNERS[0],
  )
  const [sparkDelay, setSparkDelay] = useState('0s')
  const [pellets, setPellets] = useState<
    Array<{ style: CSSProperties; keyframes: string }>
  >([])

  useEffect(() => {
    const roll = () => {
      const corner =
        SPARK_CORNERS[Math.floor(Math.random() * SPARK_CORNERS.length)]
      setSparkCorner(corner)
      const direction: -1 | 1 = corner['--spark-left'] === '0%' ? -1 : 1
      setPellets(
        Array.from({ length: 10 }, (_, i) =>
          randomSparkPellet(`title-spark-${index}-${i}`, direction),
        ),
      )
    }

    const initialDelayMs = Math.random() * 3000
    setSparkDelay(`${(initialDelayMs / 1000).toFixed(2)}s`)
    roll()

    let intervalId: ReturnType<typeof setInterval> | undefined
    const startId = setTimeout(() => {
      roll()
      intervalId = setInterval(roll, SPARK_CYCLE_MS)
    }, initialDelayMs + SPARK_CYCLE_MS)

    return () => {
      clearTimeout(startId)
      if (intervalId !== undefined) clearInterval(intervalId)
    }
  }, [index])

  return (
    <div ref={ref} className="mb-10 max-w-2xl">
      <SectionKicker index={index} label={kicker} />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h2
          className="section-heading-title font-display text-3xl font-bold tracking-tight text-[var(--text-strong)] sm:text-4xl"
          style={
            {
              ...sparkCorner,
              '--spark-delay': sparkDelay,
            } as CSSProperties
          }
        >
          <span className="title-spark-burst" aria-hidden="true">
            {pellets.length > 0 && (
              <style>
                {pellets.map((pellet) => pellet.keyframes).join('\n')}
              </style>
            )}
            {pellets.map((pellet, i) => (
              <span
                key={i}
                className={cn(
                  'title-spark-pellet',
                  i % 2 === 1 && 'title-spark-pellet--ember',
                )}
                style={pellet.style}
              />
            ))}
          </span>
          {title}
        </h2>
        {action}
      </div>
      {description && (
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-soft)]">
          {description}
        </p>
      )}
    </div>
  )
}

export function TechChip({ children }: { children: ReactNode }) {
  return <span className="tech-chip">{children}</span>
}

export function Section({
  id,
  className,
  glow = false,
  children,
}: {
  id: string
  className?: string
  glow?: boolean
  children: ReactNode
}) {
  const { sectionRef, glowRef } = useScrollGlow<HTMLElement>()

  return (
    <section
      id={id}
      ref={glow ? sectionRef : undefined}
      className={cn('scroll-mt-24 relative py-20 sm:py-28', className)}
    >
      {glow && (
        <div ref={glowRef} aria-hidden="true" className="section-glow" />
      )}
      <div className="page-wrap relative">{children}</div>
    </section>
  )
}
