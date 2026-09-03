import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Hammer, Power } from 'lucide-react'
import { Section } from './shared.tsx'
import { useReducedMotionSafe, useStagger } from './anime-primitives.tsx'
import { projects as projectsFr } from './data.ts'
import { projects as projectsEn } from './data.en.ts'
import { FlipDiskHeading } from './FlipDisplay.tsx'
import { useLocale, useStrings } from '#/i18n.tsx'

// same per-card randomized static-burst / roll-sweep timing as
// TechStack's own randomCrtTiming — kept as its own copy (this file is a
// deliberate fork, not a shared module) so the 3 cards don't flicker in
// lockstep with each other or with TechStack's 4 panels.
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

const CONTENT_MODE_CLASS = [
  'tech-crt-content--green',
  'tech-crt-content--cyan',
  '',
]
// screen frame's own border/glow — matches whichever phosphor channel is
// active instead of always green (see same fix in TechStack.tsx).
const SCREEN_MODE_CLASS = [
  '',
  'tech-crt-screen--cyan',
  'tech-crt-screen--orange',
]
// scanline-roll sweep — same per-channel recolor as SCREEN_MODE_CLASS.
const ROLL_MODE_CLASS = ['', 'tech-crt-roll--cyan', 'tech-crt-roll--orange']
const BUTTON_LABELS = [
  'Green phosphor mode',
  'Cyan phosphor mode',
  'Normal color mode',
]
// reset button's power-icon glow — same phosphor color as whichever
// channel is currently lit (see TechStack.tsx).
const RESET_MODE_CLASS = [
  'tech-crt-btn--reset-green',
  'tech-crt-btn--reset-cyan',
  'tech-crt-btn--reset-orange',
]
// how fast the boot typewriter types the title — same pace as
// TechStack's own TYPEWRITER_CHAR_MS.
const TYPEWRITER_CHAR_MS = 45

// plain row of 3 cards, not TechStack's radial layout, but every card
// still gets a top bevel: left/right cards reuse TechStack's own
// top-left / top-right diagonal corner (default housing / --tr), each
// with just its usual cube-h+cube-v pair. The center card needs a 3rd
// bevel (top+left *and* right) — default housing (top-left, via
// cube-h+cube-v) plus --bevel-center's extra ::after backing layer and
// its own right-side cube-v (cube-v--right), mirroring the left tube.
const HOUSING_BEVEL_CLASS = [
  '',
  'tech-crt-housing--bevel-center',
  'tech-crt-housing--tr',
]
const HOUSING_HAS_RIGHT_SIDE = [false, true, false]

/** v5-only fork of v3's Projects: identical CRT-housing card grid. The
    heading is a reversed mix versus most other v5 sections — index/
    kicker ("04 PROJECTS") flips as a split-flap row, sized to match the
    title (`kickerSize="lg"`, still teal/orange toned); the title
    ("Consultez un projet") is `plainTitle` (no flip) with `titleLcd`,
    which renders it inside an arm-less LcdMount screen (v2's
    lcd-screens.tsx, same CRT tech as every Hero) linked to the flip
    board above by steel struts. Forked instead of edited in place so v3
    keeps the fully plain heading. */
export function Projects() {
  const locale = useLocale()
  const strings = useStrings()
  const projects = locale === 'en' ? projectsEn : projectsFr
  const projectRoute =
    locale === 'en' ? '/en/projects/$slug' : '/projects/$slug'
  const navigate = useNavigate()
  const gridRef = useStagger<HTMLDivElement>('.reveal-item')
  const reduced = useReducedMotionSafe()
  // both of these need a real Math.random() roll, but NOT during the
  // initial render — see the identical fix (and its full reasoning) in
  // TechStack.tsx. Start deterministic (matches server + client's first
  // render), roll the real random values client-side-only afterward.
  const [activeMode, setActiveMode] = useState<Array<number>>(() =>
    projects.map(() => 2),
  )
  const [crtTimings, setCrtTimings] = useState<Array<CSSProperties>>(() =>
    projects.map(() => ({})),
  )

  useEffect(() => {
    setActiveMode(projects.map(() => Math.floor(Math.random() * 3)))
    setCrtTimings(projects.map(() => randomCrtTiming()))
  }, [])

  // boot typewriter — same idea as TechStack's runTypewriter, minus the
  // "then pop chips in" second half: a project card has nothing to type
  // but its own title. Gated behind the grid actually scrolling into
  // view (same IntersectionObserver, one-shot, as TechStack's stage 1)
  // rather than firing at mount — this row sits below the fold, so
  // typing it out immediately at page load meant it had long finished
  // typing by the time anyone scrolled down to see it, reading as "no
  // animation" rather than a boot sequence. bootedIndices guards
  // against re-running it once already booted; the power button's
  // replayBoot bypasses that guard on purpose.
  const [typeCounts, setTypeCounts] = useState<Array<number>>(() =>
    projects.map(() => 0),
  )
  const typewriterTimers = useRef<
    Array<ReturnType<typeof setTimeout> | undefined>
  >([])
  const bootedIndices = useRef<Set<number>>(new Set())

  useEffect(
    () => () => typewriterTimers.current.forEach((t) => clearTimeout(t)),
    [],
  )

  function setTypeCount(i: number, count: number) {
    setTypeCounts((prev) => {
      const next = [...prev]
      next[i] = count
      return next
    })
  }

  function runTypewriter(i: number) {
    clearTimeout(typewriterTimers.current[i])

    const total = projects[i].title.length

    if (reduced) {
      setTypeCount(i, total)
      return
    }

    setTypeCount(i, 0)
    let count = 0

    const tick = () => {
      count += 1
      setTypeCount(i, count)
      if (count >= total) return
      typewriterTimers.current[i] = setTimeout(tick, TYPEWRITER_CHAR_MS)
    }

    typewriterTimers.current[i] = setTimeout(tick, TYPEWRITER_CHAR_MS)
  }

  function bootAll() {
    projects.forEach((_, i) => {
      if (bootedIndices.current.has(i)) return
      bootedIndices.current.add(i)
      runTypewriter(i)
    })
  }

  // stage 1: boot only once the grid actually scrolls into view.
  useLayoutEffect(() => {
    const container = gridRef.current
    if (!container) return

    if (reduced) {
      bootAll()
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        bootAll()
        observer.disconnect()
      },
      { rootMargin: '-80px 0px 0px 0px' },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [reduced])

  // power button: replays the boot effect regardless of whether this
  // card already booted — bypasses bootedIndices on purpose.
  function replayBoot(i: number) {
    runTypewriter(i)
  }

  return (
    <Section id="projects">
      <FlipDiskHeading
        index="03"
        kicker={strings.kickerProjects}
        title={strings.projectsTitle}
        description=""
        kickerSize="lg"
        plainTitle
        titleLcd
      />

      <div ref={gridRef} className="grid gap-5 sm:grid-cols-3">
        {projects.map((project, i) => {
          const typeCount = typeCounts[i] ?? 0
          const typedTitle = project.title.slice(0, typeCount)
          const stillTyping = typeCount < project.title.length
          return (
            <div key={project.slug} className="reveal-item">
              <div
                className={`tech-crt-housing ${HOUSING_BEVEL_CLASS[i]}`.trim()}
              >
                <span className="tech-crt-cube-h" aria-hidden="true" />
                <span className="tech-crt-cube-v" aria-hidden="true" />
                {HOUSING_HAS_RIGHT_SIDE[i] && (
                  <span
                    className="tech-crt-cube-v tech-crt-cube-v--right"
                    aria-hidden="true"
                  />
                )}
                <div
                  role="link"
                  tabIndex={0}
                  aria-label={
                    locale === 'en'
                      ? `View project ${project.title}`
                      : `Voir le projet ${project.title}`
                  }
                  onClick={() =>
                    navigate({
                      to: projectRoute,
                      params: { slug: project.slug },
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate({
                        to: projectRoute,
                        params: { slug: project.slug },
                      })
                    }
                  }}
                  className={`tech-crt-screen cursor-pointer ${SCREEN_MODE_CLASS[activeMode[i]]}`.trim()}
                >
                  <div
                    className={`tech-crt-content flex min-h-40 flex-col items-center justify-center gap-3 text-center ${CONTENT_MODE_CLASS[activeMode[i]]}`.trim()}
                  >
                    {project.logo ? (
                      <img
                        src={project.logo}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="size-5 object-contain"
                      />
                    ) : (
                      <Hammer className="size-5 text-(--orange)" />
                    )}
                    <span className="font-mono-tech text-xs tracking-widest text-(--orange) uppercase">
                      {typedTitle}
                      {stillTyping && (
                        <span className="tech-crt-cursor" aria-hidden="true" />
                      )}
                    </span>
                  </div>
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
                  <div className="tech-crt-vent" aria-hidden="true">
                    <span className="tech-crt-vent-slot" />
                    <span className="tech-crt-vent-slot" />
                    <span className="tech-crt-vent-slot" />
                    <span className="tech-crt-vent-slot" />
                    <span className="tech-crt-vent-slot" />
                  </div>
                  <div className="tech-crt-buttons">
                    {BUTTON_LABELS.map((buttonLabel, modeIndex) => (
                      <button
                        key={buttonLabel}
                        type="button"
                        aria-label={buttonLabel}
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
    </Section>
  )
}
