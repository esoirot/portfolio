import { useState } from 'react'
import { Folder } from 'lucide-react'
import type { Formation, Role } from './data.ts'
import { Section, TechChip } from './shared.tsx'
import { TechIcon, hasTechIcon } from './tech-icons.tsx'
import {
  clearTechFilters,
  roleMatchesFilters,
  useTechFilters,
} from './tech-filter.tsx'
import { Blueprint } from './Blueprint.tsx'
import { FlipDiskHeading } from './FlipDisplay.tsx'
import { useStrings } from '#/i18n.tsx'

const MAX_VISIBLE_CHIPS = 5

/** .tech-chip pill, with a brand logo in front when one exists for
    this exact stack string (see tech-icons.tsx). Logo tinted cyan by
    default to match the left-column dossier's blue tone; the right-side
    detail panel passes orange to match its HUD-bracket tone. */
function TechChipOrLogo({
  tech,
  logoColor = 'var(--cyan)',
}: {
  tech: string
  logoColor?: string
}) {
  if (!hasTechIcon(tech)) return <TechChip>{tech}</TechChip>
  return (
    <span className="tech-logo-chip">
      <TechIcon tech={tech} color={logoColor} />
      {tech}
    </span>
  )
}

/** Every chip a role has, in one row. Past `max`, the last slot becomes
    a "+N" count of the remaining ones instead of another chip, rather
    than growing the row unbounded — unless `full` (the detail panel
    always passes this), which shows every chip with no cap. `max`
    defaults to MAX_VISIBLE_CHIPS for the detail panel's wider row; the
    narrow left-column DossierTab passes a smaller cap so its chips
    don't wrap past 2 lines in the 420px column. */
function ChipRow({
  stack,
  full = false,
  max = MAX_VISIBLE_CHIPS,
  className = 'mt-8 flex flex-wrap items-center gap-2',
  logoColor,
}: {
  stack: Array<string>
  full?: boolean
  max?: number
  className?: string
  logoColor?: string
}) {
  const overflow = !full && stack.length > max
  const visible = overflow ? stack.slice(0, max - 1) : stack
  const hiddenCount = stack.length - visible.length

  return (
    <div className={className}>
      {visible.map((tech) => (
        <TechChipOrLogo key={tech} tech={tech} logoColor={logoColor} />
      ))}
      {overflow && (
        <span className="font-mono-tech text-xs text-(--text-dim)">
          +{hiddenCount}
        </span>
      )}
    </div>
  )
}

type TabProps = { role: Role; active: boolean; onSelect: () => void }

/** The dossier card's stamp content — raw contract nature
    (CDI/Freelance/Internship/…), with role 1 (own product/no employer)
    reading as a "SaaS product" stamp instead. Shared between DossierTab's
    stamp and CommDetailPanel's header so the right panel echoes the
    exact same label. Branches on `contractKind` (language-independent),
    not `contract`'s own localized display text. */
function stampLabelFor(
  role: Role,
  strings: { ownProductStamp: string; workFallback: string },
): string {
  return role.contractKind === 'own-product'
    ? strings.ownProductStamp
    : (role.contract ?? strings.workFallback)
}

/** Left-column card: a mission-briefing dossier (.card-dossier*,
    styles.css). The whole tile is the interactive control, so it holds
    no nested button.

    The folder tab reads the role's employment qualifier — its
    `contract` field ("Produit personnel", "CDI"…) — falling back to
    "Work" for roles with none set (e.g. Adaequatio's co-founder stint). */
function DossierTab({ role, active, onSelect }: TabProps) {
  const strings = useStrings()
  // Role 1 (own product, no employer) swaps the usual tab/stamp roles:
  // the tab reads "Entrepreneur" (its actual nature of engagement) and
  // the stamp carries a "SaaS product" label instead — every other role
  // keeps tab = distinctive contract (falling back to the job title for
  // a standard employment contract, which doesn't distinguish
  // SESAME/KIS/it'smycar) and stamp = raw contract nature.
  const tabLabel =
    role.contractKind === 'own-product'
      ? 'Entrepreneur'
      : role.contract && role.contractKind !== 'standard-employment'
        ? role.contract
        : role.title
  const stampLabel = stampLabelFor(role, strings)
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={
        active
          ? 'card-dossier role-card-select role-card-select--active'
          : 'card-dossier role-card-select'
      }
    >
      <span className="card-dossier-tab">
        <Folder className="size-3 shrink-0" />
        <span className="card-dossier-tab-text">{tabLabel.toUpperCase()}</span>
      </span>
      <span className="card-dossier-stamp">{stampLabel.toUpperCase()}</span>
      <h3 className="card-dossier-title">{role.company}</h3>
      <div className="card-dossier-meta">
        {role.location} · {role.period}
      </div>
      {role.summary && <p className="card-dossier-summary">{role.summary}</p>}
      <div className="card-dossier-redaction" aria-hidden="true" />
      <ChipRow
        stack={role.stack}
        max={3}
        className="role-tab-chips"
        logoColor="var(--orange)"
      />
    </button>
  )
}

/** Right-column detail panel: corner brackets framing a glowing
    category label (.card-hudbracket*, styles.css), carrying the *full*
    role — every bullet, every stack chip, no caps. No CyberdeckHolo
    housing: the bracket's corner accents would double up against the
    holo frame's. */
function CommDetailPanel({ role }: { role: Role }) {
  const strings = useStrings()
  return (
    <div className="card-hudbracket card-hudbracket--orange">
      <span
        className="card-hudbracket-corner card-hudbracket-corner--tl"
        aria-hidden="true"
      />
      <span
        className="card-hudbracket-corner card-hudbracket-corner--tr"
        aria-hidden="true"
      />
      <span
        className="card-hudbracket-corner card-hudbracket-corner--bl"
        aria-hidden="true"
      />
      <span
        className="card-hudbracket-corner card-hudbracket-corner--br"
        aria-hidden="true"
      />
      <div className="card-hudbracket-label">
        {stampLabelFor(role, strings).toUpperCase()} — {role.period}
      </div>
      <h3 className="card-hudbracket-title">{role.title}</h3>
      <div className="card-hudbracket-meta">
        {role.company}
        {role.contract && ` · ${role.contract}`} · {role.location}
      </div>
      {role.summary && (
        <p className="card-hudbracket-summary">{role.summary}</p>
      )}
      <ul className="mt-3 space-y-1.5">
        {role.bullets.map((bullet) => (
          <li
            key={bullet}
            className="flex gap-2.5 text-sm leading-relaxed text-(--text-soft)"
          >
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-(--orange)" />
            {bullet}
          </li>
        ))}
      </ul>
      <ChipRow stack={role.stack} full logoColor="var(--orange)" />
    </div>
  )
}

/** Two-column master/detail layout — a vertical list of DossierTab
    selectors on the left, the selected role's full detail
    (CommDetailPanel) on the right. Selection tracks by `company`
    (stable across tech-filter changes) rather than array index, so
    filtering never silently swaps which role is showing. */
export function Experience({
  experience,
  formations,
}: {
  experience: Array<Role>
  formations: Array<Formation>
}) {
  const strings = useStrings()
  const filters = useTechFilters()
  const hasFilters = filters.size > 0
  const [selectedCompany, setSelectedCompany] = useState(experience[0]?.company)

  // Every role stays mounted at all times — filtering only toggles
  // visibility via CSS (.is-filtered-out, styles.css), so a filter
  // change never remounts the whole list in one React commit.
  const visibleRoles = hasFilters
    ? experience.filter((role) => roleMatchesFilters(role, filters))
    : experience
  const matchCount = visibleRoles.length
  const totalCount = experience.length
  const hasResults = matchCount > 0
  const activeRole =
    visibleRoles.find((role) => role.company === selectedCompany) ??
    visibleRoles[0]

  return (
    <Section id="experience">
      {/* Blueprint (the Cnam diploma card) sits beside the title from
          sm up; below sm there's no room for a row, so it drops under
          the title instead (centered). */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-4">
        <div className="sm:shrink-0">
          <FlipDiskHeading
            index="02"
            kicker={strings.kickerExperience}
            title={strings.experienceTitle}
            filters={{
              active: hasFilters,
              onClear: clearTechFilters,
              badge: (
                <span
                  className={`filter-count ${hasResults ? '' : 'filter-count--empty'}`.trim()}
                >
                  {matchCount} / {totalCount}
                </span>
              ),
            }}
          />
        </div>
        {/* flex-1: fills whatever space the heading leaves in the row
            rather than a fixed column — the @container wrapper's
            resulting width is what `.blueprint-card`'s cqw-based sizing
            (styles.css) scales against, so the card grows to use that
            space up to its own clamp() max, never past it. */}
        <div className="@container flex w-full min-w-0 justify-center sm:flex-1">
          <Blueprint formation={formations[0]} />
        </div>
      </div>

      {!hasResults && (
        <p className="font-mono-tech mt-8 text-sm text-(--text-dim) lg:mt-0">
          {strings.noExperienceMatch}
        </p>
      )}

      {hasResults && (
        <div className="mt-8 grid gap-6 lg:mt-0 lg:grid-cols-[420px_1fr]">
          {/* gap-7, not gap-3: .card-dossier-tab pokes out 18px above its
              own card via position:absolute (see styles.css) — that's
              outside the card's own box, so a tighter gap here would let
              it overlap the card sitting above it in the list. The
              hover lift (.role-card-select:hover, translateY(-4px))
              eats further into that clearance, hence 7 instead of 6. */}
          <div className="flex flex-col gap-7">
            {experience.map((role) => {
              const active = activeRole.company === role.company
              const onSelect = () => setSelectedCompany(role.company)
              return (
                <div
                  key={role.company}
                  className={
                    hasFilters && !roleMatchesFilters(role, filters)
                      ? 'is-filtered-out'
                      : undefined
                  }
                >
                  <DossierTab role={role} active={active} onSelect={onSelect} />
                  {/* Small screens have no right column: the detail
                      renders inline under the active card, below lg only
                      (the lg:sticky column takes over at that breakpoint,
                      so the two must never both show). */}
                  {active && (
                    <div className="mt-3 lg:hidden">
                      <CommDetailPanel role={role} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="hidden self-start lg:sticky lg:top-24 lg:block">
            {/* every role's panel is rendered (only the active one
                shown) so all of them are in the server HTML for crawlers,
                not just whichever role happens to be selected */}
            {experience.map((role) => (
              <div
                key={role.company}
                data-role-panel
                hidden={role.company !== activeRole.company}
              >
                <CommDetailPanel role={role} />
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}
