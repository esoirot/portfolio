import type { CSSProperties, MouseEvent } from 'react'
import {
  ArrowRight,
  Boxes,
  ChevronsUp,
  Download,
  Mail,
  Rocket,
} from 'lucide-react'
import { Button } from '#/components/ui/button.tsx'
import { useOffscreenPause } from './use-offscreen-pause.ts'
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
    {
      count: 10,
      suffix: '+',
      label: strings.yearsExperience,
      icon: ChevronsUp,
    },
    { count: 4, suffix: '', label: strings.productsShipped, icon: Boxes },
    { count: 1, suffix: '', label: strings.saasCofounded, icon: Rocket },
  ]
}

/** Marquee keywords, shipped as cargo containers on the dock banner. */
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

/** Count-up is pure CSS (.count-up, styles.css: an @property integer
    animated from 0 and printed via counter()), synced to the tile's
    entrance delay. The real value stays as text for crawlers and screen
    readers; the counting digits are decorative. */
function StatValue({ count, suffix }: { count: number; suffix: string }) {
  return (
    <span className="font-display text-3xl font-bold text-white">
      <span className="sr-only">{`${count}${suffix}`}</span>
      <span
        aria-hidden="true"
        className="count-up"
        data-suffix={suffix}
        style={{ '--count-to': count } as CSSProperties}
      />
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

/** Staggered entrance, pure CSS (.hero-enter, styles.css): runs from
    first paint instead of waiting for hydration, and never hides content
    the server already rendered. */
function enter(delayMs: number, risePx: number, durationMs: number) {
  return {
    '--enter-delay': `${delayMs}ms`,
    '--enter-rise': `${risePx}px`,
    '--enter-duration': `${durationMs}ms`,
  } as CSSProperties
}

/** Hero: hazard stripes + scrolling keyword marquee framing a diagonal
    orange/cyan wash, split-color name and staggered KPI cards. */
export function Hero() {
  const strings = useStrings()
  const stats = getStats(strings)
  const sectionRef = useOffscreenPause<HTMLElement>()
  // no margin: on a short screen the stats sit below the fold, and their
  // entrance + count-up should play when seen, not at load
  const statsRef = useOffscreenPause<HTMLDivElement>('0px')

  return (
    <section
      ref={sectionRef}
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
      {/* decorative: the keywords repeat the Tech Stack section */}
      <div
        className="dock-marquee page-wrap relative border-b border-[var(--hairline)] pt-[9px] pb-3"
        aria-hidden="true"
      >
        <div className="dock-marquee-track">
          {[0, 1, 2, 3].map((copy) => (
            <div
              key={copy}
              className="dock-marquee-group items-end text-xs uppercase"
            >
              {KEYWORDS.map((k, i) => (
                <span key={`${k}-${i}`} className="dock-unit mr-3">
                  <span className="dock-clamp" aria-hidden="true" />
                  <span
                    className={`dock-container ${CONTAINER_COLORS[i % CONTAINER_COLORS.length]}`}
                  >
                    {k}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="page-wrap relative mt-14 flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <p className="hud-kicker !text-base lg:!hidden">
          Fullstack Developer · Tech Lead · Entrepreneur
        </p>

        <div className="flex flex-col items-center gap-6 text-center lg:max-w-xl lg:items-start lg:text-left">
          <h1 className="font-display flex w-fit flex-col text-5xl leading-[1.05] font-black tracking-normal sm:text-7xl lg:w-full">
            <span
              className="hero-enter lg:self-start text-[var(--orange)]"
              style={enter(250, 24, 450)}
            >
              E<span>L</span>
              <span className="ml-[0.08em]">I</span>
              OTT
            </span>{' '}
            <span
              className="hero-enter lg:self-end text-white"
              style={enter(370, 24, 450)}
            >
              SOIROT
            </span>
          </h1>

          <p
            className="hero-enter max-w-2xl text-lg leading-relaxed text-[var(--text-strong)] sm:text-xl"
            style={enter(500, 12, 400)}
          >
            {strings.heroSubtitle}
            <span className="block text-base text-[var(--text-dim)] sm:text-lg">
              {strings.heroSubtitleDetail}
            </span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button
              asChild
              size="lg"
              className="cta-btn hero-enter font-bold! transition-shadow hover:shadow-[0_0_20px_5px_rgba(247,165,49,0.65)]"
              style={enter(650, 8, 300)}
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
              className="cta-btn hero-enter transition-shadow hover:shadow-[0_0_18px_4px_rgba(79,216,224,0.6)]"
              style={enter(730, 8, 300)}
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
              className="cta-btn hero-enter transition-shadow hover:shadow-[0_0_18px_4px_rgba(79,216,224,0.6)]"
              style={enter(810, 8, 300)}
            >
              <a href={strings.cvHref} download={strings.cvFileName}>
                <Download className="size-4" />
                {strings.downloadCv}
              </a>
            </Button>
          </div>
        </div>

        <div className="w-full lg:w-auto">
          <p className="hud-kicker !text-base mb-3 !hidden lg:!flex lg:justify-end">
            Fullstack Developer · Tech Lead · Entrepreneur
          </p>

          <div
            ref={statsRef}
            className="mx-auto grid w-full max-w-2xl grid-cols-3 gap-4 lg:mx-0 lg:w-auto lg:max-w-none"
          >
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                style={enter(750 + i * 90, 16, 350)}
                className="kpi-glass cascade-stat hero-enter relative overflow-hidden rounded-md p-4 text-left"
                onMouseMove={handleTileMouseMove}
              >
                {/* Corner peel — the top-right corner "peels" back, the
                    icon printed underneath as if revealed by the lifted
                    flap. */}
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
                <StatValue count={stat.count} suffix={stat.suffix} />
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
