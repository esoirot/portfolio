import { Link, useParams } from '@tanstack/react-router'
import { homePathFor, useLocale, useStrings } from '#/i18n.tsx'

/** FR/EN switcher, reusing the `.version-toggle` pill (styles.css) —
    leftover CSS from the old multi-version comparison site, unused
    until now. On a project detail page it swaps locale for the same
    project (both languages share the same slugs); everywhere else it
    just goes to the other locale's home page. */
function LangSwitch() {
  const locale = useLocale()
  const { slug } = useParams({ strict: false })

  return (
    <div className="version-toggle">
      {slug ? (
        <Link
          to="/projects/$slug"
          params={{ slug }}
          className={locale === 'fr' ? 'is-active' : undefined}
        >
          FR
        </Link>
      ) : (
        <Link to="/" className={locale === 'fr' ? 'is-active' : undefined}>
          FR
        </Link>
      )}
      {slug ? (
        <Link
          to="/en/projects/$slug"
          params={{ slug }}
          className={locale === 'en' ? 'is-active' : undefined}
        >
          EN
        </Link>
      ) : (
        <Link to="/en" className={locale === 'en' ? 'is-active' : undefined}>
          EN
        </Link>
      )}
    </div>
  )
}

/** Links route through TanStack Router (`to="/" hash={...}`) rather
    than plain `<a href="#...">` so this header still works when
    mounted on a non-home route (e.g. a project detail page) — it
    navigates back to "/" and scrolls to the section instead of trying
    (and failing) to scroll an anchor that doesn't exist on the current
    page.

    No #education link/section: Experience.tsx carries the single
    Blueprint diploma card itself instead of a standalone section. */
export function Nav() {
  const locale = useLocale()
  const homePath = homePathFor(locale)
  const strings = useStrings()
  const links = [
    { hash: 'stack', label: 'Tech Stack' },
    { hash: 'experience', label: strings.kickerExperience },
    { hash: 'projects', label: strings.kickerProjects },
    { hash: 'contact', label: 'Contact' },
  ]
  return (
    <header className="site-header sticky top-0 z-50">
      <div className="page-wrap flex h-16 items-center justify-between">
        <Link
          to={homePath}
          hash="home"
          className="font-display text-lg font-bold tracking-wide text-(--text-strong) no-underline"
        >
          <span className="text-(--orange)">E</span>S
          <span className="text-(--cyan)">.</span>
        </Link>

        <nav className="hidden items-center gap-7 sm:flex">
          {links.map((link) => (
            <Link
              key={link.hash}
              to={homePath}
              hash={link.hash}
              className="nav-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LangSwitch />
        </div>
      </div>
    </header>
  )
}
