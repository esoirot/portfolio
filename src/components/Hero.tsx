import { useLayoutEffect, useRef } from 'react'
import type { MouseEvent } from 'react'
import { createTimeline, stagger } from 'animejs'
import {
  ArrowRight,
  Boxes,
  ChevronsUp,
  Download,
  Mail,
  Rocket,
} from 'lucide-react'
import { Button } from '#/components/ui/button.tsx'
import {
  EASE_OUT,
  useCountUp,
  useReducedMotionSafe,
} from './anime-primitives.tsx'
import { useStrings } from '#/i18n.tsx'

/** Headline KPI set. Each carries a small pictogram: stacked chevrons
    read as military rank/veterancy stripes for years of experience,
    boxes for shipped products, a rocket for co-founding a SaaS from
    launch. */
function getStats(strings: {
  yearsExperience: string
  productsShipped: string
  saasCofounded: string
}) {
  return [
    { value: '10+', label: strings.yearsExperience, icon: ChevronsUp },
    { value: '4', label: strings.productsShipped, icon: Boxes },
    { value: '1', label: strings.saasCofounded, icon: Rocket },
  ]
}

/** Marquee keywords — same list as HeroLab's Signage concept (#15),
    reused here for the Signage × Two-Tone (#111) banner. */
const KEYWORDS = [
  'TYPESCRIPT',
  'REACT',
  'NEXT.JS',
  'NESTJS',
  'POSTGRESQL',
  'AWS',
  'ARCHITECTURE',
  'DDD',
]

/** Real-world container-line paint, cycled per box instead of the brand
    orange/cyan — reads as cargo, not a UI chip. */
const CONTAINER_COLORS = [
  'dock-container--blue',
  'dock-container--green',
  'dock-container--steel',
]

function StatValue({
  value,
  className = 'font-display text-2xl font-bold text-[var(--orange)]',
}: {
  value: string
  className?: string
}) {
  const match = /^(\d+)(.*)$/.exec(value)
  const numeric = match ? Number(match[1]) : null
  const suffix = match ? match[2] : value
  const ref = useCountUp(numeric, suffix)

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}

/** Writes the pointer position (as a % of the tile's own box) onto
    --mx/--my — .kpi-glass::after (styles.css) reads those to center its
    hover spotlight under the cursor instead of the tile's center. */
function handleTileMouseMove(e: MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  e.currentTarget.style.setProperty('--mx', `${x}%`)
  e.currentTarget.style.setProperty('--my', `${y}%`)
}

/** v5 Hero = HeroLab's Signage × Two-Tone (#111) framing — hazard stripes
    + scrolling keyword marquee — wrapped around #108's Two-Tone Cascade:
    diagonal orange/cyan wash, split-color name, staggered KPI cards. */
export function Hero() {
  const strings = useStrings()
  const stats = getStats(strings)
  const word1Ref = useRef<HTMLSpanElement | null>(null)
  const word2Ref = useRef<HTMLSpanElement | null>(null)
  const subtitleRef = useRef<HTMLParagraphElement | null>(null)
  const ctaRef = useRef<HTMLDivElement | null>(null)
  const statsRef = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotionSafe()

  useLayoutEffect(() => {
    if (reduced) return
    const word1 = word1Ref.current
    const word2 = word2Ref.current
    const subtitle = subtitleRef.current
    const cta = ctaRef.current
    const statsEl = statsRef.current
    if (!word1 || !word2 || !subtitle || !cta || !statsEl) return

    const ctaButtons = cta.querySelectorAll<HTMLElement>('.cta-btn')
    const statCards = statsEl.querySelectorAll<HTMLElement>('.cascade-stat')

    word1.style.opacity = '0'
    word2.style.opacity = '0'
    subtitle.style.opacity = '0'
    ctaButtons.forEach((btn) => (btn.style.opacity = '0'))
    statCards.forEach((card) => (card.style.opacity = '0'))

    const tl = createTimeline({ defaults: { ease: EASE_OUT } })
      .add(
        [word1, word2],
        {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 450,
          delay: stagger(120),
        },
        250,
      )
      .add(
        subtitle,
        { opacity: [0, 1], translateY: [12, 0], duration: 400 },
        500,
      )
      .add(
        ctaButtons,
        {
          opacity: [0, 1],
          translateY: [8, 0],
          duration: 300,
          delay: stagger(80),
        },
        650,
      )
      .add(
        statCards,
        {
          opacity: [0, 1],
          translateY: [16, 0],
          duration: 350,
          delay: stagger(90),
        },
        750,
      )

    return () => {
      tl.revert()
    }
  }, [reduced])

  return (
    <section
      id="home"
      className="scroll-mt-24 relative overflow-hidden pt-16 pb-20 sm:pb-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, var(--orange-glow) 0%, transparent 35%, transparent 65%, var(--cyan-glow) 100%)',
          opacity: 0.22,
        }}
      />

      <div className="hazard-stripe relative w-full" aria-hidden="true" />
      <div className="herolab-marquee page-wrap relative border-b border-[var(--hairline)] pt-[9px] pb-3">
        <div className="herolab-marquee-track items-end gap-3 text-xs uppercase">
          {[...KEYWORDS, ...KEYWORDS].map((k, i) => (
            <span key={`${k}-${i}`} className="dock-unit">
              <span className="dock-clamp" aria-hidden="true" />
              <span
                className={`dock-container ${CONTAINER_COLORS[i % CONTAINER_COLORS.length]}`}
              >
                {k}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="page-wrap relative mt-14 flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <p className="hud-kicker !text-base lg:!hidden">
          Fullstack Engineer · Tech Lead · Entrepreneur
        </p>

        <div className="flex flex-col items-center gap-6 text-center lg:max-w-xl lg:items-start lg:text-left">
          <h1 className="font-display flex w-fit flex-col text-5xl leading-[1.05] font-black tracking-tight sm:text-7xl lg:w-full">
            <span ref={word1Ref} className="lg:self-start text-[var(--orange)]">
              ELIOTT
            </span>
            <span ref={word2Ref} className="lg:self-end text-white">
              SOIROT
            </span>
          </h1>

          <p
            ref={subtitleRef}
            className="max-w-2xl text-lg leading-relaxed text-[var(--text-strong)] sm:text-xl"
          >
            {strings.heroSubtitle}
            <span className="block text-base text-[var(--text-dim)] sm:text-lg">
              {strings.heroSubtitleDetail}
            </span>
          </p>

          <div
            ref={ctaRef}
            className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <Button
              asChild
              size="lg"
              className="cta-btn font-bold transition-shadow hover:shadow-[0_0_20px_5px_rgba(247,165,49,0.65)]"
            >
              <a href="#experience">
                {strings.seeWork}
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="cta-btn transition-shadow hover:shadow-[0_0_18px_4px_rgba(79,216,224,0.6)]"
            >
              <a href="#contact">
                <Mail className="size-4" />
                {strings.contactMe}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="cta-btn transition-shadow hover:shadow-[0_0_18px_4px_rgba(79,216,224,0.6)]"
            >
              <a href={strings.cvHref} download>
                <Download className="size-4" />
                {strings.downloadCv}
              </a>
            </Button>
          </div>
        </div>

        <div className="w-full lg:w-auto">
          <p className="hud-kicker !text-base mb-3 !hidden lg:!flex lg:justify-end">
            Fullstack Engineer · Tech Lead · Entrepreneur
          </p>

          <div
            ref={statsRef}
            className="mx-auto grid w-full max-w-2xl grid-cols-3 gap-4 lg:mx-0 lg:w-auto lg:max-w-none"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="kpi-glass cascade-stat relative overflow-hidden rounded-md p-4 text-left"
                onMouseMove={handleTileMouseMove}
              >
                {/* Corner Peel — the top-right corner "peels" back, the
                    icon printed underneath as if revealed by the lifted
                    flap. Picked over 49 other candidates compared in
                    place (KpiCardConcepts.tsx, since deleted). */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 right-0 size-11"
                  style={{
                    clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                    background: 'var(--orange)',
                    boxShadow: 'inset 2px -2px 3px rgba(0,0,0,0.35)',
                  }}
                >
                  <stat.icon className="absolute top-1 right-1 size-4 text-white" />
                </div>
                <StatValue
                  value={stat.value}
                  className="font-display text-3xl font-bold text-white"
                />
                <div className="mt-1 text-sm leading-snug text-white">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hazard-stripe relative mt-14 w-full" aria-hidden="true" />
    </section>
  )
}
