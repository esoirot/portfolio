import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Cloud, Code2, Power, Server, Sparkles } from 'lucide-react'
import { AttentionSign } from './AttentionSign.tsx'
import {
  experience as experienceFr,
  techStack as techStackFr,
} from './data.ts'
import {
  experience as experienceEn,
  techStack as techStackEn,
} from './data.en.ts'
import { Section, TechChip } from './shared.tsx'
import { useReducedMotionSafe } from './anime-primitives.tsx'
import { TECH_ICONS } from './tech-icons.ts'
import {
  clearTechFilters,
  roleMatchesFilters,
  toggleTechFilter,
  useTechFilters,
} from './tech-filter.tsx'
import { FlipDiskHeading } from './FlipDisplay.tsx'
import { useLocale, useStrings } from '#/i18n.tsx'

const icons = [Code2, Server, Cloud, Sparkles]

// old-CRT panel overlay: each panel gets its own randomized static-burst
// / roll-sweep timing (computed once per mount) so the 4 don't flicker in
// lockstep — same desync trick as LcdMount's own randomLcdTiming().
function randomCrtTiming(): CSSProperties {
  const staticDuration = 12 + Math.random() * 10 // 12-22s
  const rollDuration = 5 + Math.random() * 5 // 5-10s
  return {
    '--crt-static-duration': `${staticDuration.toFixed(2)}s`,
    '--crt-static-delay': `-${(Math.random() * staticDuration).toFixed(2)}s`,
    '--crt-roll-duration': `${rollDuration.toFixed(2)}s`,
    '--crt-roll-delay': `-${(Math.random() * rollDuration).toFixed(2)}s`,
  } as CSSProperties
}

// how many screens "load" at once, and how long (ms) to wait before
// loading the next batch — see the visibleCount effect below.
const BATCH_SIZE = 2
const BATCH_DELAY_MS = 550

// every panel's boot effect — see runTypewriter. Chips reveal much
// slower than title characters do, so each one reads as its own beat
// instead of a blur of chips. Each panel runs its own independent
// counter/timer (see typeCounts/typewriterTimers) since 2 of them can
// load — and so be typing — in the same batch at once.
const TYPEWRITER_CHAR_MS = 45
const TYPEWRITER_CHIP_MS = 150

// .tech-crt-housing's fake-3D "outer layer" (see styles.css) offsets
// diagonally away from whichever corner of the 2x2 grid a panel sits in
// — same quadrant order the grid renders in (Frontend top-left, Backend
// top-right, Data & Cloud bottom-left, Product/AI/Tools bottom-right).
// tl has no modifier (it's the housing's own default).
const HOUSING_QUADRANT_CLASS = [
  '',
  'tech-crt-housing--tr',
  'tech-crt-housing--bl',
  'tech-crt-housing--br',
]

// the 3 physical buttons on each housing act as a channel selector for
// that panel's screen content — mutually exclusive (radio-style). Left =
// green phosphor tint, center = cyan phosphor tint, right = normal color,
// matching old monochrome-monitor "color" switches. Which one starts lit
// is randomized per panel per mount (see activeMode below) rather than
// always defaulting to the same button on every load.
const CONTENT_MODE_CLASS = [
  'tech-crt-content--green',
  'tech-crt-content--cyan',
  '',
]
// screen frame's own border/glow (styles.css .tech-crt-screen) — matches
// whichever phosphor channel is active instead of always green.
const SCREEN_MODE_CLASS = [
  '',
  'tech-crt-screen--cyan',
  'tech-crt-screen--orange',
]
// scanline-roll sweep — same per-channel recolor as SCREEN_MODE_CLASS.
const ROLL_MODE_CLASS = ['', 'tech-crt-roll--cyan', 'tech-crt-roll--orange']
// reset button's power-icon glow — same phosphor color as whichever
// channel is currently lit, so the icon never clashes with its own screen.
const RESET_MODE_CLASS = [
  'tech-crt-btn--reset-green',
  'tech-crt-btn--reset-cyan',
  'tech-crt-btn--reset-orange',
]
const BUTTON_LABELS = [
  'Green phosphor mode',
  'Cyan phosphor mode',
  'Normal color mode',
]

// per-bay "wear" look on the hand-labeled sticker (see .tech-crt-sticker
// in styles.css) — each bay gets its own distinct damage/quirk so the 4
// don't read as identical labels, just tilted/scarred differently.
const STICKER_MODIFIER_CLASS = [
  'tech-crt-sticker--angled',
  'tech-crt-sticker--burned',
  'tech-crt-sticker--angled-rev tech-crt-sticker--torn',
  'tech-crt-sticker--peel',
]

/** v5-only fork of v4's TechStack (which forked v3): same CRT panels
    (housing, phosphor channel selector, chip filter, overlay animation)
    in v4's static aligned 2x2 grid, but v4/v3's spring "boing" scale
    entrance is gone. In its place: the screens lazy-load `BATCH_SIZE`
    (2) at a time — `visibleCount` starts at 0, jumps to 2 once the
    section scrolls into view (IntersectionObserver, one-shot), then the
    effect below keeps adding 2 more every `BATCH_DELAY_MS` until all of
    them have loaded. A screen with index >= visibleCount renders its
    housing/buttons/static-and-roll overlay as normal (so it still reads
    as physical hardware, just idle) but no `.tech-crt-content` — the
    screen looks powered-off until its batch's turn.

    The first time a screen's content actually mounts, `bootPanel` fires
    via that div's own ref callback and plays the CRT "power-on" look:
    `runTypewriter` types that panel's group.label out character by
    character, then pops its tech chips in one at a time — one counter
    per panel drives both (0..label.length is "typing the title",
    label.length..label.length+items.length is "chips popping in"), so
    each screen reads as one continuous "content appearing piece by
    piece" sequence rather than two animations glued together.
    `bootedIndices` guards against re-triggering it if this inline ref
    callback re-fires on an unrelated re-render (React calls ref
    callbacks with the same element again whenever the callback's own
    function identity changes, which an inline arrow does on every
    render) — the guard is keyed on panel index, not element identity,
    so it holds regardless. Every panel runs its own independent
    counter/timer (typeCounts/typewriterTimers, both arrays) since 2 of
    them load — and so can be typing — in the same batch at once.
    Forked instead of edited in place so v4/v3 keep their entrance/
    orbit. */
export function TechStack() {
  const locale = useLocale()
  const strings = useStrings()
  const techStack = locale === 'en' ? techStackEn : techStackFr
  const experience = locale === 'en' ? experienceEn : experienceFr
  const containerRef = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotionSafe()
  // both of these need a real Math.random() roll, but NOT during the
  // initial render: this app is SSR'd, and a value picked during render
  // runs once on the server and gets baked into the HTML — the client's
  // own independent Math.random() call during hydration then produces a
  // different value, which React can't patch onto already-hydrated
  // attributes and warns about ("didn't match the client properties").
  // Same fix as SectionHeading's spark corner in shared.tsx: start both
  // at a fixed, deterministic value (identical on server and the
  // client's first render) and roll the real random ones in the
  // useEffect below, which only ever runs client-side, after hydration.
  const [crtTimings, setCrtTimings] = useState<Array<CSSProperties>>(() =>
    techStack.map(() => ({})),
  )
  const [activeMode, setActiveMode] = useState<Array<number>>(() =>
    techStack.map(() => 2),
  )

  useEffect(() => {
    setCrtTimings(techStack.map(() => randomCrtTiming()))
    setActiveMode(techStack.map(() => Math.floor(Math.random() * 3)))
  }, [])

  const [visibleCount, setVisibleCount] = useState(0)
  const bootedIndices = useRef<Set<number>>(new Set())
  const filters = useTechFilters()
  const hasFilters = filters.size > 0
  const matchCount = hasFilters
    ? experience.filter((role) => roleMatchesFilters(role, filters)).length
    : experience.length
  const totalCount = experience.length

  // every panel's boot effect: types its group.label out one character
  // at a time, then reveals its tech chips one at a time — a single
  // counter per panel drives both (0..label.length is "typing the
  // title", label.length..label.length+items.length is "chips popping
  // in") so each reads as one continuous "content appearing piece by
  // piece" sequence instead of two animations glued together. Arrays
  // (one counter/timer per panel index), not single shared values,
  // since 2 panels can load — and so be typing — in the same batch.
  const [typeCounts, setTypeCounts] = useState<Array<number>>(() =>
    techStack.map(() => 0),
  )
  const typewriterTimers = useRef<
    Array<ReturnType<typeof setTimeout> | undefined>
  >([])

  useEffect(
    () => () => typewriterTimers.current.forEach((t) => clearTimeout(t)),
    [],
  )

  // every panel must end up the SAME size — its own final size, reserved
  // up front, not whatever size its currently-typed content happens to
  // need. measureRefs point at an invisible clone of each panel holding
  // its FULL (untruncated) label+chips, always rendered regardless of
  // visibleCount/typeCounts; the max height across all 4 (panelHeight)
  // is what every real (typing) panel reserves via min-height, so no
  // panel grows as it types and none is smaller than the biggest one's
  // finished content, even while still empty.
  const measureRefs = useRef<Array<HTMLDivElement | null>>([])
  const [panelHeight, setPanelHeight] = useState<number | null>(null)

  useLayoutEffect(() => {
    const container = containerRef.current

    // a stale (too-small) reservation, from *any* cause, always shows up
    // the same way: some panel's real, fully-typed content ends up
    // taller than min-height instead of matching it, so the 4 land at
    // different final sizes instead of the same one. Re-measuring is
    // the fix regardless of *why* the first number was wrong, and there
    // are two real causes here, not one:
    //  1. webfonts (Orbitron/JetBrains Mono) usually haven't finished
    //     downloading yet at first measure, so text wraps per the
    //     fallback font's (different) metrics — document.fonts.ready
    //     catches this.
    //  2. the column width itself can change after this first
    //     measurement — most visibly on mobile, where the viewport
    //     narrows once the browser UI (address bar, etc.) settles after
    //     load, changing where chips wrap — a ResizeObserver on the
    //     grid catches this, and anything else that changes its width
    //     later (window resize, orientation change).
    // Recomputing is always take-the-new-max, never shrink: once a
    // panel's real typed content has grown into a reserved height, nothing
    // legitimate should ever call for less room than that again.
    const measure = () => {
      const heights = measureRefs.current.map(
        (el) => el?.getBoundingClientRect().height ?? 0,
      )
      const max = Math.max(...heights)
      if (max > 0)
        setPanelHeight((prev) => (prev === null ? max : Math.max(prev, max)))
    }

    measure()
    document.fonts.ready.then(measure)

    if (!container) return
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // stage 1: nothing is "loaded" until the grid scrolls into view.
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (reduced) {
      setVisibleCount(techStack.length)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisibleCount(BATCH_SIZE)
        observer.disconnect()
      },
      { rootMargin: '-80px 0px 0px 0px' },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [reduced])

  // stage 2: once loading has started, keep loading BATCH_SIZE more
  // every BATCH_DELAY_MS until every screen has loaded.
  useEffect(() => {
    if (reduced) return
    if (visibleCount === 0 || visibleCount >= techStack.length) return

    const timer = setTimeout(() => {
      setVisibleCount((count) => Math.min(techStack.length, count + BATCH_SIZE))
    }, BATCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [visibleCount, reduced])

  function setTypeCount(i: number, count: number) {
    setTypeCounts((prev) => {
      const next = [...prev]
      next[i] = count
      return next
    })
  }

  function runTypewriter(i: number) {
    clearTimeout(typewriterTimers.current[i])

    const group = techStack[i]
    const total = group.label.length + group.items.length

    if (reduced) {
      setTypeCount(i, total)
      return
    }

    setTypeCount(i, 0)
    const labelLength = group.label.length
    let count = 0

    const tick = () => {
      count += 1
      setTypeCount(i, count)
      if (count >= total) return
      // still typing the title -> fast char-by-char; once into the chips
      // -> a much slower beat so each chip reads as its own reveal.
      const delay =
        count < labelLength ? TYPEWRITER_CHAR_MS : TYPEWRITER_CHIP_MS
      typewriterTimers.current[i] = setTimeout(tick, delay)
    }

    typewriterTimers.current[i] = setTimeout(tick, TYPEWRITER_CHAR_MS)
  }

  function bootPanel(el: HTMLDivElement | null, i: number) {
    if (!el || bootedIndices.current.has(i)) return
    bootedIndices.current.add(i)
    runTypewriter(i)
  }

  // red reset button: replays the boot effect regardless of whether this
  // panel already booted — bypasses bootedIndices on purpose.
  function replayBoot(i: number) {
    runTypewriter(i)
  }

  // shared between the real (typing) content and the hidden full-size
  // measurement clone, so the two are guaranteed to render identically
  // (same markup -> same size) other than which label/items slice each
  // one is given.
  function renderScreenBody(
    Icon: (typeof icons)[number],
    label: string,
    items: Array<string>,
    useLogos: boolean,
    showCursor: boolean,
  ) {
    return (
      <>
        <div className="flex items-center gap-2.5">
          <Icon className="size-4 text-(--orange)" />
          <h3 className="font-mono-tech text-xs font-semibold tracking-widest text-(--orange) uppercase">
            {label}
            {showCursor && (
              <span className="tech-crt-cursor" aria-hidden="true" />
            )}
          </h3>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {items.map((item) => {
            const LogoIcon = useLogos ? TECH_ICONS[item] : undefined
            return (
              <button
                key={item}
                type="button"
                className="tech-chip-btn"
                aria-pressed={filters.has(item)}
                aria-label={`Filtrer l'expérience par ${item}`}
                onClick={() => toggleTechFilter(item)}
              >
                {LogoIcon ? (
                  <span className="tech-logo-chip">
                    <LogoIcon title={item} size={14} color="var(--orange)" />
                    {item}
                  </span>
                ) : (
                  <TechChip>{item}</TechChip>
                )}
              </button>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <Section id="stack">
      {/* AttentionSign (variant 32, AttentionSign.tsx) sits beside the
          title from sm up, same slot Experience's Blueprint card uses —
          the LCD screen carries the filter controls instead of the
          title text, so the title moved here. */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-4">
        <div className="sm:shrink-0">
          <FlipDiskHeading
            index="01"
            kicker="Tech Stack"
            title={strings.techStackTitle}
            kickerSize="lg"
            plainTitle
            titleLcd
            filtersActive={hasFilters}
            onClearFilters={() => clearTechFilters()}
            filterBadge={
              <span
                className={`filter-count ${matchCount > 0 ? '' : 'filter-count--empty'}`.trim()}
              >
                {matchCount} / {totalCount}
              </span>
            }
          />
        </div>
        <div className="flex w-full min-w-0 justify-center sm:flex-1">
          <AttentionSign text={strings.techStackTitle} />
        </div>
      </div>

      <div ref={containerRef} className="tech-grid mt-8 sm:mt-0">
        {/* pure-SVG TV static: feTurbulence generates its own noise texture
            regardless of source content, feColorMatrix maps it to white so
            it reads as static/snow — referenced from CSS via
            filter: url(#techCrtStaticFilter) on each panel's
            .tech-crt-static overlay (this file's own panels and
            Projects.tsx's cards both point at this one definition). */}
        <svg
          width={0}
          height={0}
          aria-hidden="true"
          style={{ position: 'absolute' }}
        >
          <defs>
            <filter id="techCrtStaticFilter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves={2}
                stitchTiles="stitch"
                result="noise"
              />
              <feColorMatrix
                in="noise"
                type="matrix"
                values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"
              />
            </filter>
          </defs>
        </svg>

        <div className="tech-grid-panels">
          {techStack.map((group, i) => {
            const Icon = icons[i % icons.length]
            const useLogos =
              group.label === 'Frontend' ||
              group.label === 'Backend' ||
              group.label === 'Data & Cloud' ||
              group.label === 'Product, AI & Tools'
            const typeCount = typeCounts[i] ?? 0
            const typewriterTotal = group.label.length + group.items.length
            const typedLabel = group.label.slice(
              0,
              Math.min(typeCount, group.label.length),
            )
            const typedItems = group.items.slice(
              0,
              Math.max(0, typeCount - group.label.length),
            )
            const stillTyping = typeCount < typewriterTotal
            return (
              <div key={group.label} className="tech-grid-panel">
                <div
                  className={`tech-crt-housing ${HOUSING_QUADRANT_CLASS[i]}`.trim()}
                >
                  <span className="tech-crt-cube-h" aria-hidden="true" />
                  <span className="tech-crt-cube-v" aria-hidden="true" />
                  <div className="tech-crt-vent" aria-hidden="true">
                    <span className="tech-crt-vent-slot" />
                    <span className="tech-crt-vent-slot" />
                    <span className="tech-crt-vent-slot" />
                    <span className="tech-crt-vent-slot" />
                    <span className="tech-crt-vent-slot" />
                  </div>
                  <div
                    className={`tech-crt-screen ${SCREEN_MODE_CLASS[activeMode[i]]}`.trim()}
                  >
                    {/* invisible, always-rendered clone with the FULL
                        (untruncated) label+chips — exists purely so the
                        layout effect below can measure every panel's
                        final size up front, before any typing starts.
                        visibility:hidden still lays out (unlike
                        display:none), so it has real dimensions to
                        measure; it just never paints or intercepts
                        clicks. */}
                    <div
                      ref={(el) => {
                        measureRefs.current[i] = el
                      }}
                      className="tech-crt-content"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: 0,
                        // matches .tech-crt-screen's own horizontal padding
                        // (var(--tech-screen-pad-x)) instead of left/right:
                        // 0 — absolute positioning anchors to the padding
                        // box, so 0/0 would span 40px WIDER than the real
                        // in-flow content ever gets, under-wrapping chips
                        // and under-measuring height for panels near a
                        // wrap boundary (e.g. Frontend's 10 items).
                        left: 'var(--tech-screen-pad-x)',
                        right: 'var(--tech-screen-pad-x)',
                        visibility: 'hidden',
                        pointerEvents: 'none',
                      }}
                    >
                      {renderScreenBody(
                        Icon,
                        group.label,
                        group.items,
                        useLogos,
                        false,
                      )}
                    </div>
                    {i < visibleCount && (
                      <div
                        ref={(el) => bootPanel(el, i)}
                        className={`tech-crt-content ${CONTENT_MODE_CLASS[activeMode[i]]}`.trim()}
                        style={
                          panelHeight ? { minHeight: panelHeight } : undefined
                        }
                      >
                        {renderScreenBody(
                          Icon,
                          typedLabel,
                          typedItems,
                          useLogos,
                          stillTyping,
                        )}
                      </div>
                    )}
                    <div
                      className="tech-crt-overlay"
                      style={crtTimings[i]}
                      aria-hidden="true"
                    >
                      <div className="tech-crt-vignette" />
                      <div
                        className={`tech-crt-roll ${ROLL_MODE_CLASS[activeMode[i]]}`.trim()}
                      />
                      <div className="tech-crt-static" />
                      <div className="tech-crt-diode" />
                    </div>
                  </div>

                  <div className="tech-crt-controls">
                    <span
                      className={`tech-crt-sticker ${STICKER_MODIFIER_CLASS[i]}`.trim()}
                      aria-hidden="true"
                    >
                      Hangar Bay {i + 1}
                    </span>
                    <div className="tech-crt-buttons">
                      {BUTTON_LABELS.map((label, modeIndex) => (
                        <button
                          key={label}
                          type="button"
                          aria-label={label}
                          aria-pressed={activeMode[i] === modeIndex}
                          className={`tech-crt-btn tech-crt-btn--${modeIndex === 0 ? 'green' : modeIndex === 1 ? 'cyan' : 'orange'} ${activeMode[i] === modeIndex ? 'is-active' : ''}`.trim()}
                          onClick={() => {
                            setActiveMode((prev) => {
                              const next = [...prev]
                              next[i] = modeIndex
                              return next
                            })
                          }}
                        />
                      ))}
                      <button
                        type="button"
                        aria-label="Rejouer l'animation de démarrage"
                        className={`tech-crt-btn tech-crt-btn--reset ${RESET_MODE_CLASS[activeMode[i]]}`.trim()}
                        onClick={() => replayBoot(i)}
                      >
                        <Power aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
