// Roughneck's own in-lore height (meters) — the reference every other
// mech's heightM is scaled against, so it renders at MECH_HEIGHT_PCT of
// its bay's cover canvas and the rest scale relative to it.
const ROUGHNECK_HEIGHT_M = 12.5

// mech height as a fraction of its bay's cover canvas (see
// .hangar-bay-cover in styles.css) at resolvedScale 1 (Roughneck) —
// tuned to read at a sensible size against the hangar photo.
const MECH_HEIGHT_PCT = 70

// default mech foot position, as a fraction of its bay's cover canvas
// (matches .hangar-mech's own `bottom: 8%` — a mech only needs
// bottomPct set below when it should sit off that default).
const MECH_BOTTOM_PCT = 8

// one mech per bay it stands in (bay index, 0-based) — add an entry here
// once its backgroundless sprite exists in /public. heightM is the
// mech's in-lore height, used to scale its sprite relative to
// ROUGHNECK_HEIGHT_M so mechs read at their actual relative sizes rather
// than all filling the same box. scale, when set, overrides the
// heightM-derived ratio with a flat multiplier of Roughneck's full
// height instead — for manual sizing tweaks that aren't meant to track
// in-lore height. bottomPct, when set, overrides MECH_BOTTOM_PCT for
// manual vertical placement
// tweaks (e.g. valkyrie's sprite has more empty space below its feet
// than Roughneck's, so it needs a higher bottomPct to read as standing
// at the same height on the floor).
const MECHS = [
  {
    bay: 0,
    src: '/Roughneck%20backgroundless%20(purple).webp',
    heightM: 12.5,
  },
  {
    bay: 1,
    src: '/valkyrie%2016%20bit%20backgroundless%20(purple).webp',
    heightM: 10,
    // lore-accurate 10/12.5 ratio (0.8) still read as bulky/tall as
    // Shadow Hawk (0.88) — height scale alone can't slim its silhouette
    // (width follows the sprite's own aspect ratio), so this manually
    // overrides the ratio smaller to read clearly as the lightest mech.
    scale: 0.65,
    bottomPct: 10,
  },
  {
    bay: 2,
    src: '/Urbanmech%2016%20bit%20backgroundless%20(purple).webp',
    heightM: 8,
  },
  { bay: 3, src: '/shadowhawk_16_Bit-backgroundless.webp', heightM: 11, bottomPct: 9 },
]
const MECHS_BY_BAY = new Map(MECHS.map((mech) => [mech.bay, mech]))

// number of hangar-bay slots laid side by side in the row — see
// --hangar-pan-x in styles.css, which derives the pan distance from this
// count too (keep in sync if this changes).
const HANGAR_COUNT = 4
const HANGAR_BAYS = Array.from({ length: HANGAR_COUNT }, (_, i) => i)

// one bay slot: the hangar photo and (if this bay has one) its mech,
// both living inside the same .hangar-bay-cover canvas — a square sized
// and centered with the exact same max(cqh, cqw) cover math the photo
// alone used to use (see .hangar-bay-cover in styles.css). Because the
// photo fills that canvas at 100%/100% and the mech is positioned/sized
// as a percentage *of that same canvas*, the two can never drift apart:
// there's only one cover transform, applied once, and both ride it
// together — scale the canvas up and everything inside it, mech
// included, scales and repositions identically, with zero separate
// per-mech position math to keep in sync.
function BaySlot({ bay }: { bay: number }) {
  const mech = MECHS_BY_BAY.get(bay)
  const resolvedScale = mech && (mech.scale ?? mech.heightM / ROUGHNECK_HEIGHT_M)
  // bays 2 and 4 (odd index) mirror the photo horizontally, so four
  // copies of the same shot in a row don't read as an obvious repeat.
  const mirrored = bay % 2 === 1
  return (
    <div className="hangar-bay-slot">
      <div className="hangar-bay-cover">
        <img
          className={
            mirrored ? 'hangar-bay-photo hangar-bay-photo--mirror' : 'hangar-bay-photo'
          }
          src="/hangar-16-bit.webp"
          alt=""
          loading={bay === 0 ? 'eager' : 'lazy'}
        />
        {mech && (
          <img
            className="hangar-mech"
            src={mech.src}
            alt=""
            loading={bay === 0 ? 'eager' : 'lazy'}
            style={{
              height: `${MECH_HEIGHT_PCT * (resolvedScale ?? 1)}%`,
              bottom: `${mech.bottomPct ?? MECH_BOTTOM_PCT}%`,
            }}
          />
        )}
      </div>
    </div>
  )
}

/** v5-only: hangar bay backdrop — HANGAR_COUNT bay slots (BaySlot) laid
    side by side and panned horizontally as the page scrolls (see
    .hangar-bay-row in styles.css), with a dark scrim, a couple of
    localized warm work-lights, a haze band, and a vignette layered over
    the whole row for mood, plus drifting dust on top. The row pan and the
    dust drift both use `animation-timeline: scroll(root)` — no scroll
    listener, no JS. Entirely aria-hidden, no interactive content, renders
    once at the top of HomePage so it sits behind everything in paint
    order.

    Used to also carry a hazard-stripe floor line pinned to its own
    bottom edge — but this element is `position: fixed; inset: 0`
    (styles.css), so that stripe stayed glued to the viewport bottom on
    every scroll position across the whole page instead of scrolling away
    with the hangar backdrop. Moved to HomePage.tsx as an in-flow divider
    right after Hero instead (.hero-hazard-divider, styles.css) — same
    stripe, now scoped to where it visually belongs. */
export function HangarBay() {
  return (
    <div className="hangar-bay" aria-hidden="true">
      <div className="hangar-bay-row">
        {HANGAR_BAYS.map((i) => (
          <BaySlot key={i} bay={i} />
        ))}
      </div>
      <div className="hangar-scrim" />
      <div className="hangar-worklight hangar-worklight--1" />
      <div className="hangar-worklight hangar-worklight--2" />
      <div className="hangar-haze" />
      <div className="hangar-vignette" />

      <div className="hangar-layer hangar-layer--near">
        <div className="hangar-dust" />
      </div>
    </div>
  )
}
