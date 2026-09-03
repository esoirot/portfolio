import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

/** Homepage footer separator — an R&D-lab/hangar reskin of .hazard-stripe,
    picked over 121 other candidates compared in place before this file
    was trimmed down to the winner: a rollered conveyor belt carrying
    supply crates (ammo/missile/battery, randomized per slot) left to
    right, slow and continuous. */

const AMMO_ITEM_TYPES = ['shell', 'missile', 'battery'] as const
type AmmoItemType = (typeof AMMO_ITEM_TYPES)[number]
const AMMO_SPACING = 40
const AMMO_COUNT = 10

/** Random shell/missile/battery pick per belt slot. Starts as an all-
    "shell" sequence (matches the server-rendered markup, since Math.random
    would otherwise pick differently on server vs. client and break
    hydration) and reshuffles once on mount, client-side only. */
function useRandomAmmoSequence(count: number) {
  const [items, setItems] = useState<Array<AmmoItemType>>(() =>
    Array.from({ length: count }, () => AMMO_ITEM_TYPES[0]),
  )
  useEffect(() => {
    setItems(
      Array.from(
        { length: count },
        () => AMMO_ITEM_TYPES[Math.floor(Math.random() * AMMO_ITEM_TYPES.length)],
      ),
    )
  }, [count])
  return items
}

/** Shared crate shell — corner-riveted, void-stroked orange box — behind
    every crate's pictogram. */
function AmmoBoxShell({ x, children }: { x: number; children?: ReactNode }) {
  return (
    <g transform={`translate(${x} 10)`}>
      <rect
        x="-9"
        y="-10"
        width="18"
        height="20"
        rx="1.5"
        fill="var(--orange)"
        stroke="var(--void)"
        strokeWidth="1"
      />
      <circle cx="-6.5" cy="-7.5" r="0.8" fill="var(--void)" opacity="0.6" />
      <circle cx="6.5" cy="-7.5" r="0.8" fill="var(--void)" opacity="0.6" />
      <circle cx="-6.5" cy="7.5" r="0.8" fill="var(--void)" opacity="0.6" />
      <circle cx="6.5" cy="7.5" r="0.8" fill="var(--void)" opacity="0.6" />
      {children}
    </g>
  )
}

/** Crate pictogram — sized to fill the crate's biggest inscribed square
    rather than a small text label, so it reads at a glance: 3 bullets
    for shell/ammo, 1 rocket on the diagonal for missile, a bolt for
    battery. */
function AmmoShapeIcon({ type, x }: { type: AmmoItemType; x: number }) {
  return <AmmoBoxShell x={x}>{AMMO_BOX_ICON[type]}</AmmoBoxShell>
}

function BulletGlyph({ cx }: { cx: number }) {
  return (
    <path
      d="M-1 5.7 L-1 -1.7 Q -1 -5.7 0 -5.7 Q 1 -5.7 1 -1.7 L1 5.7 Z"
      fill="var(--void)"
      transform={`translate(${cx} 0)`}
    />
  )
}

const AMMO_BOX_ICON: Record<AmmoItemType, ReactNode> = {
  shell: (
    <>
      <BulletGlyph cx={-3} />
      <BulletGlyph cx={0} />
      <BulletGlyph cx={3} />
    </>
  ),
  missile: (
    <g transform="rotate(-45) scale(0.85)">
      {/* asymmetric — flared tail fins, slim body, pointed nose — rather
          than a symmetric bipyramid that reads as a crystal/gem. */}
      <path
        d="M-8 -3 L-8 3 L-5 3 L-5 1.8 L5 1.8 L8 0 L5 -1.8 L-5 -1.8 L-5 -3 Z"
        fill="var(--void)"
      />
      <line x1="-5" y1="0" x2="5" y2="0" stroke="var(--orange)" strokeWidth="0.6" opacity="0.85" />
      <line x1="-8" y1="-3" x2="-6" y2="-1.8" stroke="var(--orange)" strokeWidth="0.6" opacity="0.7" />
      <line x1="-8" y1="3" x2="-6" y2="1.8" stroke="var(--orange)" strokeWidth="0.6" opacity="0.7" />
    </g>
  ),
  battery: (
    <path
      d="M0.8 -8 L-2.8 0.6 L-0.6 0.6 L-1.8 8 L2.8 -1.2 L0.6 -1.2 Z"
      fill="var(--void)"
    />
  ),
}

/** Supply crates riding a conveyor belt across the footer, slow and
    continuous left to right. Two back-to-back copies of the same random
    sequence — one shifted a full sequence-width to the left, one at
    rest — translate together from x=0 to x=+seqWidth
    (hangar-footer-ammoconveyor-scroll, styles.css); since both copies
    are identical, the belt looks unbroken across the loop instead of
    resetting with a visible jump. */
export function AmmoConveyorDivider() {
  const sequence = useRandomAmmoSequence(AMMO_COUNT)
  const seqWidth = AMMO_COUNT * AMMO_SPACING
  return (
    <svg
      className="hangar-footer hangar-footer-ammoconveyor"
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line x1="0" y1="20" x2="400" y2="20" stroke="var(--orange)" strokeWidth="1.2" opacity="0.4" />
      <defs>
        <pattern id="hangar-footer-ammoconveyor-rollers" width="20" height="24" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="20" r="1.5" fill="var(--orange)" opacity="0.4" />
        </pattern>
      </defs>
      <rect x="0" y="16" width="400" height="8" fill="url(#hangar-footer-ammoconveyor-rollers)" />
      <g
        className="hangar-footer-ammoconveyor-items"
        style={{ '--seqw': `${seqWidth}px` } as CSSProperties}
      >
        {sequence.map((type, i) => (
          <AmmoShapeIcon
            key={`prev-${i}`}
            type={type}
            x={-seqWidth + i * AMMO_SPACING + AMMO_SPACING / 2}
          />
        ))}
        {sequence.map((type, i) => (
          <AmmoShapeIcon key={`cur-${i}`} type={type} x={i * AMMO_SPACING + AMMO_SPACING / 2} />
        ))}
      </g>
    </svg>
  )
}
