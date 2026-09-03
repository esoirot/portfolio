import { GraduationCap } from 'lucide-react'
import type { Formation } from './data.ts'

/** A formation rendered as an architectural blueprint document —
    `.blueprint-*` in styles.css: navy ground, graph-paper grid, corner
    registration ticks, mono typography, a torn top-right corner + a
    coffee stain/crease/scuffs (`.blueprint-card::before`). Sized to its
    own content (`w-fit`), centered in whatever it's placed in
    (`mx-auto`) rather than stretching to fill it — its row can be much
    wider than a document needs to be. `max-w-full` + `min-w-0` on the
    text column let it actually shrink instead of overflowing when that
    row gets tight (e.g. beside the Experience heading below lg); padding
    and title size are `clamp()`-based in styles.css so the whole card
    scales down smoothly rather than just wrapping text abruptly. */
export function Blueprint({ formation }: { formation: Formation }) {
  // Split on the first comma so a long degree name wraps as "Diplôme
  // d'ingénieur," on its own line, specialization below — rather than
  // running the whole thing together or wrapping wherever the column
  // happens to be narrow enough.
  const [degreeLead, ...degreeRest] = formation.degree.split(', ')

  return (
    <div className="blueprint-card mx-auto h-full w-fit max-w-full">
      <span className="blueprint-corner blueprint-corner--tl" aria-hidden="true" />
      {/* no --tr tick: that corner is torn off (clip-path), nothing to
          anchor it to */}
      <span className="blueprint-corner blueprint-corner--bl" aria-hidden="true" />
      <span className="blueprint-corner blueprint-corner--br" aria-hidden="true" />
      {/* absolute, not a flex sibling: an icon in the flow would push
          the text column over by its own width + gap ("tabbing" the
          content in) — floated in the corner instead, clear of the
          title/degree text. */}
      <GraduationCap
        className="blueprint-icon absolute top-4 left-4 size-5"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <h3 className="blueprint-title">
          <span className="flex items-baseline justify-between gap-x-4 pl-7">
            <span>{degreeLead}</span>
            <span className="blueprint-period">{formation.period}</span>
          </span>
          {degreeRest.length > 0 && (
            <>
              <br />
              {degreeRest.join(', ')}
            </>
          )}
        </h3>
        <p className="blueprint-degree mt-2">{formation.school}</p>
        {formation.detail && (
          <p className="blueprint-detail mt-2">{formation.detail}</p>
        )}
      </div>
      <span className="blueprint-label" aria-hidden="true">
        FIG. 03
      </span>
    </div>
  )
}
