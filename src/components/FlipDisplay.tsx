import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { cn } from '#/lib/utils.ts'
import { useReducedMotionSafe } from './use-reduced-motion.ts'
import { LcdMount } from './lcd-screens.tsx'
import { SPARK_CYCLE_MS, randomSparkPellet } from './shared.tsx'
import { useStrings } from '#/i18n.tsx'

// the replay button's click spark: 10 pellets (randomSparkPellet's
// solved-parabola trajectory, ember-tinted alternates, the
// .title-spark-burst muzzle flash), half-and-half sideways direction.
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
  // starts on its final char so the server HTML reads correctly
  // (crawlers, no-JS); blanked on mount to await the flip (the board
  // only goes active, or learns motion is reduced, after mount — both
  // then settle the tile via the effect below).
  const [shown, setShown] = useState(char)
  const [leaf, setLeaf] = useState<Leaf | null>(null)
  const shownRef = useRef(char)

  useLayoutEffect(() => {
    setShown(' ')
    shownRef.current = ' '
  }, [])

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
  active,
  reduced,
  cycleKey,
}: {
  segments: Array<FlipSegment>
  active: boolean
  reduced: boolean
  cycleKey: number
}) {
  let index = 0
  return (
    <div className="flip-row flip-row--lg">
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

/** Section heading as a split-flap board (airport departure board):
    index + kicker flip in on the board, with a replay button (bumps
    `cycleKey`, which every FlipChar's effect depends on purely to force
    a re-run). A non-empty `title` mounts an LcdMount screen under the
    board: it shows the title, or — when `filters` is given — the
    clear-filters control and match-count badge instead (TechStack,
    Experience). Contact passes an empty title: board only.

    The board fades/slides in on scroll via CSS (.scroll-reveal, a
    view() scroll timeline); an IntersectionObserver flips `active` true
    as it enters, which kicks off every tile's flip sequence. */
export function FlipDiskHeading({
  index,
  kicker,
  title,
  filters,
}: {
  index: string
  kicker: string
  title: string
  filters?: { active: boolean; onClear: () => void; badge: ReactNode }
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

  // the board's fade-in is pure CSS (.scroll-reveal); this only starts
  // the flip, once, when the board scrolls into view
  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (reduced) {
      setActive(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setActive(true)
        observer.disconnect()
      },
      { rootMargin: '0px 0px -80px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced])

  return (
    <div
      className={
        title
          ? 'sign-holoonly-frame mb-10 max-w-3xl'
          : 'mb-10 flex max-w-3xl flex-wrap items-center justify-between gap-4'
      }
    >
      {/* the board's tiles are aria-hidden art — this names the section
          for the document outline, crawlers and screen readers */}
      <h2 className="sr-only">{kicker}</h2>
      <div ref={ref} className="flip-board scroll-reveal">
        <div className="flip-board-frame">
          <div className="flip-row-line">
            <FlipRow
              segments={[
                { text: index.toUpperCase(), tone: 'teal' },
                { text: ' ' },
                { text: kicker.toUpperCase(), tone: 'orange' },
              ]}
              active={active}
              reduced={reduced}
              cycleKey={cycleKey}
            />
          </div>
        </div>
        <div className="flip-board-controls">
          <button
            type="button"
            className="flip-board-btn flip-board-btn--icon"
            aria-label={strings.replayAnimation}
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
      {title && (
        <>
          <div className="sign-holoonly-struts" aria-hidden="true">
            <span className="sign-holoonly-strut" />
            <span className="sign-holoonly-strut" />
          </div>
          <LcdMount label={kicker.toUpperCase()}>
            {filters ? (
              <div className="lcd-filter-controls flex w-full flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="flip-board-btn flip-board-btn--text"
                  disabled={!filters.active}
                  onClick={filters.onClear}
                >
                  <X className="size-3" />
                  {strings.clearFilters}
                </button>
                {filters.badge}
              </div>
            ) : (
              <h3 className="font-display w-full self-start text-left text-lg font-bold tracking-tight text-[var(--text-strong)] sm:text-xl">
                {title}
              </h3>
            )}
          </LcdMount>
        </>
      )}
    </div>
  )
}
