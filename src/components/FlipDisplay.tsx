import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { animate, onScroll } from 'animejs'
import { cn } from '#/lib/utils.ts'
import { EASE_OUT, useReducedMotionSafe } from './anime-primitives.tsx'
import { LcdMount } from './lcd-screens.tsx'
import type { SparkCornerStyle } from './shared.tsx'
import {
  SPARK_CYCLE_MS,
  SPARK_CORNERS,
  randomSparkPellet,
  SectionKicker,
} from './shared.tsx'
import { useStrings } from '#/i18n.tsx'

// the replay button's click spark — the exact same pellet system as
// section titles' ambient spark burst (SectionHeading in shared.tsx:
// randomSparkPellet's solved-parabola trajectory, the ember-tinted
// alternating pellets, the .title-spark-burst muzzle flash), just fired
// once on click instead of auto-looping every SPARK_CYCLE_MS from a
// random corner. 10 pellets, half-and-half sideways direction, same as
// there.
const SPARK_PELLET_COUNT = 10

// characters a tile cycles through on its way to its target — real
// split-flap boards are alpha/numeric only (mechanical constraint), and
// every string this component renders is uppercased before splitting
// into tiles, so this only needs to cover what that produces.
const REEL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const STEP_MS = 70
// how far apart (ms) each successive tile in a row starts its own cycle
// — the wave-sweep look of a real board booting up, not every tile
// flipping in lockstep.
const STAGGER_MS = 40

function randomReelChar(): string {
  return REEL[Math.floor(Math.random() * REEL.length)]
}

// a short run of random reel characters ending on `target` — how many
// intermediate flips a tile makes before settling, not just an instant
// swap.
function buildSequence(target: string): Array<string> {
  const steps = 4 + Math.floor(Math.random() * 3) // 4-6 intermediate flips
  const sequence = Array.from({ length: steps }, () => randomReelChar())
  sequence.push(target)
  return sequence
}

type Leaf = { from: string; to: string; key: number }

/** One character cell. At rest, shows `char` behind a fixed seam line
    (.flip-tile::after) so it always reads as a two-leaf tile, animating
    or not. When `active` flips true, cycles through a short random
    sequence before settling on `char` — each step renders a `.flip-tile-
    leaf` (a 3D rotateX flap, front face = outgoing char, back face =
    incoming, see @keyframes flip-tile-turn in styles.css) keyed by step
    index so React remounts it and the CSS animation replays every tick,
    no manual class-toggling needed. A plain space never flips — it's
    just a blank spacer tile (word gaps shouldn't animate). */
function FlipChar({
  char,
  delayMs,
  active,
  reduced,
  tone,
  cycleKey,
}: {
  char: string
  delayMs: number
  active: boolean
  reduced: boolean
  tone?: 'teal' | 'orange'
  cycleKey: number
}) {
  const [shown, setShown] = useState(' ')
  const [leaf, setLeaf] = useState<Leaf | null>(null)
  const shownRef = useRef(' ')

  useEffect(() => {
    if (!active) return
    if (char === ' ' || reduced) {
      setShown(char)
      shownRef.current = char
      return
    }

    let cancelled = false
    const sequence = buildSequence(char)
    let i = 0
    let tickTimer: ReturnType<typeof setTimeout> | undefined
    let clearTimer: ReturnType<typeof setTimeout> | undefined

    const tick = () => {
      if (cancelled || i >= sequence.length) return
      const to = sequence[i]
      setLeaf({ from: shownRef.current, to, key: i })
      shownRef.current = to
      setShown(to)
      i += 1
      if (i < sequence.length) {
        tickTimer = setTimeout(tick, STEP_MS)
      } else {
        clearTimer = setTimeout(() => setLeaf(null), STEP_MS)
      }
    }

    const startTimer = setTimeout(tick, delayMs)

    return () => {
      cancelled = true
      clearTimeout(startTimer)
      clearTimeout(tickTimer)
      clearTimeout(clearTimer)
    }
    // cycleKey isn't read in here — it's a pure re-run trigger: bumping
    // it (the panel's "replay" button, see FlipDiskHeading) re-fires this
    // effect with the exact same char/active/reduced, restarting the
    // cycle from scratch.
  }, [active, char, reduced, delayMs, cycleKey])

  if (char === ' ') {
    return <span className="flip-tile-space" aria-hidden="true" />
  }

  return (
    <span
      className={`flip-tile ${tone ? `flip-tile--${tone}` : ''}`.trim()}
      aria-hidden="true"
    >
      <span className="flip-tile-face">{shown}</span>
      {leaf && (
        <span key={leaf.key} className="flip-tile-leaf">
          <span className="flip-tile-leaf-front">{leaf.from}</span>
          <span className="flip-tile-leaf-back">{leaf.to}</span>
        </span>
      )}
    </span>
  )
}

type FlipSegment = { text: string; tone?: 'teal' | 'orange' }

/** One line of tiles, built from one or more color-toned segments (e.g.
    the index in teal followed by the kicker in orange) rather than a
    single plain string — spaces become blank spacer tiles, not flap
    tiles, and the whole line staggers left to right continuously across
    segment boundaries (each segment doesn't restart its own stagger). */
function FlipRow({
  segments,
  size,
  active,
  reduced,
  cycleKey,
}: {
  segments: Array<FlipSegment>
  size: 'sm' | 'lg'
  active: boolean
  reduced: boolean
  cycleKey: number
}) {
  let index = 0
  return (
    <div className={`flip-row flip-row--${size}`}>
      {segments.map((segment, s) =>
        Array.from(segment.text).map((char) => {
          const i = index
          index += 1
          return (
            <FlipChar
              key={`${s}-${i}`}
              char={char}
              tone={segment.tone}
              delayMs={i * STAGGER_MS}
              active={active}
              reduced={reduced}
              cycleKey={cycleKey}
            />
          )
        }),
      )}
    </div>
  )
}

/** v5-only replacement for shared.tsx's SectionHeading, forked for the
    Experience section: renders the kicker + title as a split-flap/
    flip-disc board (like an airport departure board) instead of plain
    text, with 2 physical buttons on the panel's right side — a replay
    (bumps `cycleKey`, which every FlipChar's effect depends on purely to
    force a re-run, restarting its cycle from scratch) and the section's
    existing "clear tech filters" control, moved from a standalone pill
    button into the panel as its 2nd physical button. `filterBadge` is
    the "3 / 9 matches" indicator — kept outside the panel (next to it,
    not one of its buttons) since it's informational, not a control.

    The board itself fades/slides in on scroll same as every other
    section heading (useLayoutEffect below, same animate()/onScroll()
    pattern as anime-primitives.tsx's useReveal) — its onBegin is what
    flips `active` true, which is what kicks off every tile's flip
    sequence, so the tiles start cycling the instant the board starts
    fading in rather than on a second, separate trigger. */
export function FlipDiskHeading({
  index,
  kicker,
  title,
  description,
  filterBadge,
  filtersActive = false,
  onClearFilters,
  plainTitle = false,
  plainKicker = false,
  kickerSize = 'sm',
  titleSpark = false,
  titleLcd = false,
}: {
  index: string
  kicker: string
  // Empty string, combined with plainTitle, skips the title entirely —
  // Contact-only ask (see plainTitle below), board flips just the
  // index/kicker line with no title anywhere beneath it.
  title: string
  description?: string
  filterBadge?: ReactNode
  filtersActive?: boolean
  onClearFilters?: () => void
  // Skips the title's flip-row and renders it as a plain <h3> under the
  // flip board instead (unless title is "", see above) — Contact-only
  // ask, board keeps flipping just the index/kicker line.
  plainTitle?: boolean
  // Mirror of plainTitle: skips the index/kicker flip-row (rendered as
  // shared.tsx's plain SectionKicker above the board instead) and keeps
  // only the title as a flip-row — Projects-only ask.
  plainKicker?: boolean
  // Size of the index/kicker flip-row's tiles — defaults to 'sm' (every
  // other section); Projects wants it to match the title row's 'lg'
  // tiles while keeping the same teal/orange tones.
  kickerSize?: 'sm' | 'lg'
  // Only meaningful when plainTitle is set — gives the plain <h3> the
  // same ambient grinding-spark burst as shared.tsx's SectionHeading
  // (random corner, reused .section-heading-title/.title-spark-* CSS,
  // already scoped for v4/v5). Projects-only ask; Contact's plainTitle
  // stays spark-free unless it opts in too.
  titleSpark?: boolean
  // Also only meaningful when plainTitle is set, and takes priority over
  // titleSpark — renders the plain title inside an arm-less LcdMount
  // screen (lcd-screens.tsx, same CRT tech as v2/v3/v4's Hero screens)
  // instead of the ambient-spark plain h3.
  titleLcd?: boolean
}) {
  const strings = useStrings()
  const ref = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(false)
  const [cycleKey, setCycleKey] = useState(0)
  const [sparkId, setSparkId] = useState(0)
  const [sparks, setSparks] = useState<
    Array<{ style: CSSProperties; keyframes: string }>
  >([])
  const burstSeq = useRef(0)
  const sparkTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const reduced = useReducedMotionSafe()

  const [titleSparkCorner, setTitleSparkCorner] = useState<SparkCornerStyle>(
    SPARK_CORNERS[0],
  )
  const [titleSparkDelay, setTitleSparkDelay] = useState('0s')
  const [titlePellets, setTitlePellets] = useState<
    Array<{ style: CSSProperties; keyframes: string }>
  >([])

  useEffect(() => {
    if (!titleSpark) return

    const roll = () => {
      const corner =
        SPARK_CORNERS[Math.floor(Math.random() * SPARK_CORNERS.length)]
      setTitleSparkCorner(corner)
      const direction: -1 | 1 = corner['--spark-left'] === '0%' ? -1 : 1
      setTitlePellets(
        Array.from({ length: 10 }, (_, i) =>
          randomSparkPellet(`flip-title-spark-${index}-${i}`, direction),
        ),
      )
    }

    const initialDelayMs = Math.random() * 3000
    setTitleSparkDelay(`${(initialDelayMs / 1000).toFixed(2)}s`)
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
  }, [titleSpark, index])

  const replay = () => {
    setCycleKey((k) => k + 1)
    if (reduced) return

    burstSeq.current += 1
    const burst = burstSeq.current
    const direction: -1 | 1 = Math.random() < 0.5 ? -1 : 1
    const pellets = Array.from({ length: SPARK_PELLET_COUNT }, (_, i) =>
      randomSparkPellet(`flip-replay-spark-${burst}-${i}`, direction),
    )
    setSparks(pellets)
    setSparkId(burst)

    clearTimeout(sparkTimer.current)
    sparkTimer.current = setTimeout(() => setSparks([]), SPARK_CYCLE_MS)
  }

  useEffect(() => () => clearTimeout(sparkTimer.current), [])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    if (reduced) {
      setActive(true)
      return
    }

    el.style.opacity = '0'
    const animation = animate(el, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 500,
      ease: EASE_OUT,
      autoplay: onScroll({
        target: el,
        enter: 'bottom-=80 top',
        repeat: false,
      }),
      onBegin: () => setActive(true),
      onComplete: () => {
        el.style.transform = 'none'
      },
    })

    return () => {
      animation.revert()
    }
  }, [reduced])

  return (
    <div
      className={
        titleLcd
          ? 'sign-holoonly-frame mb-10 max-w-3xl'
          : 'mb-10 flex max-w-3xl flex-wrap items-center justify-between gap-4'
      }
    >
      {plainKicker && (
        <div className="w-full">
          <SectionKicker index={index} label={kicker} />
        </div>
      )}
      <div ref={ref} className="flip-board">
        <div className="flip-board-frame">
          {!plainKicker && (
            <div className="flip-row-line">
              <FlipRow
                segments={[
                  { text: index.toUpperCase(), tone: 'teal' },
                  { text: ' ' },
                  { text: kicker.toUpperCase(), tone: 'orange' },
                ]}
                size={kickerSize}
                active={active}
                reduced={reduced}
                cycleKey={cycleKey}
              />
              {/* Experience-only (titleLcd + onClearFilters): the clear-filters
                  button moves inside the LCD screen below instead of sitting
                  here next to the flip-row. Every other titleLcd caller
                  (TechStack) has no onClearFilters, so this is unaffected. */}
              {onClearFilters && !titleLcd && (
                <button
                  type="button"
                  className="flip-board-btn flip-board-btn--text"
                  disabled={!filtersActive}
                  onClick={onClearFilters}
                >
                  <X className="size-3" />
                  {strings.clearFilters}
                </button>
              )}
            </div>
          )}
          {!plainTitle && (
            <FlipRow
              segments={[{ text: title.toUpperCase() }]}
              size="lg"
              active={active}
              reduced={reduced}
              cycleKey={cycleKey}
            />
          )}
        </div>
        <div className="flip-board-controls">
          <button
            type="button"
            className="flip-board-btn flip-board-btn--icon"
            aria-label="Rejouer l'animation"
            onClick={replay}
            style={
              {
                '--spark-top': '50%',
                '--spark-left': '50%',
              } as CSSProperties
            }
          >
            <RefreshCw className="size-3.5" />
            {sparks.length > 0 && (
              <span
                key={sparkId}
                className="title-spark-burst"
                aria-hidden="true"
              >
                <style>{sparks.map((p) => p.keyframes).join('\n')}</style>
                {sparks.map((pellet, i) => (
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
            )}
          </button>
        </div>
      </div>
      {plainTitle && titleLcd && (
        <>
          <div className="sign-holoonly-struts" aria-hidden="true">
            <span className="sign-holoonly-strut" />
            <span className="sign-holoonly-strut" />
          </div>
          <LcdMount
            enterFrom="left"
            delayMs={0}
            label={kicker.toUpperCase()}
            showArm={false}
          >
            {onClearFilters ? (
              // Experience-only: no title text on this screen — just the
              // clear-filters control and the match-count readout
              // (filterBadge), both formerly rendered outside the LCD.
              <div className="lcd-filter-controls flex w-full flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="flip-board-btn flip-board-btn--text"
                  disabled={!filtersActive}
                  onClick={onClearFilters}
                >
                  <X className="size-3" />
                  {strings.clearFilters}
                </button>
                {filterBadge}
              </div>
            ) : (
              <h3 className="font-display w-full self-start text-left text-lg font-bold tracking-tight text-[var(--text-strong)] sm:text-xl">
                {title}
              </h3>
            )}
          </LcdMount>
        </>
      )}
      {plainTitle && !titleLcd && title && (
        <h3
          className={cn(
            'font-display w-full text-2xl font-bold tracking-tight text-[var(--text-strong)] sm:text-3xl',
            titleSpark && 'section-heading-title',
          )}
          style={
            titleSpark
              ? ({
                  ...titleSparkCorner,
                  '--spark-delay': titleSparkDelay,
                } as CSSProperties)
              : undefined
          }
        >
          {titleSpark && (
            <span className="title-spark-burst" aria-hidden="true">
              {titlePellets.length > 0 && (
                <style>
                  {titlePellets.map((pellet) => pellet.keyframes).join('\n')}
                </style>
              )}
              {titlePellets.map((pellet, i) => (
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
          )}
          {title}
        </h3>
      )}
      {/* Experience (titleLcd + onClearFilters) already rendered
          filterBadge inside the LCD screen above — this is the fallback
          for any future titleLcd-less or onClearFilters-less caller. */}
      {!(titleLcd && onClearFilters) && filterBadge}
      {description && (
        <p className="mt-4 w-full text-[15px] leading-relaxed text-[var(--text-soft)]">
          {description}
        </p>
      )}
    </div>
  )
}
