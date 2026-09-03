import { useSyncExternalStore } from 'react'
import type { Role } from './data.ts'

// Ephemeral (not localStorage-backed, unlike version-toggle/hero-toggle) —
// this is a per-visit filter, not a preference, so it should always start
// empty. Multi-select, AND semantics: a role must match every selected
// chip, not just one — selecting NestJS + PostgreSQL narrows down to
// roles using both, not either. A fresh Set is swapped in on every
// change (never mutated in place) so useSyncExternalStore's snapshot
// equality check actually sees the change.
let currentFilters: ReadonlySet<string> = new Set()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return currentFilters
}

// a fresh `new Set()` here would be a different reference on every call —
// useSyncExternalStore treats that as "the snapshot keeps changing" and
// warns about (then risks) an infinite loop, so this needs to be the
// same cached empty-set reference every time, not a literal recreated
// per call.
const EMPTY_FILTERS: ReadonlySet<string> = new Set()

function getServerSnapshot(): ReadonlySet<string> {
  return EMPTY_FILTERS
}

export function clearTechFilters() {
  currentFilters = new Set()
  listeners.forEach((listener) => listener())
}

export function toggleTechFilter(tech: string) {
  const next = new Set(currentFilters)
  if (next.has(tech)) {
    next.delete(tech)
  } else {
    next.add(tech)
  }
  currentFilters = next
  listeners.forEach((listener) => listener())
}

export function useTechFilters() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

/** TechStack's chip labels are sometimes a "/"-joined bucket (e.g. "MySQL
    / MariaDB", "AWS") while a role's own stack lists specific tech (e.g.
    "MariaDB", "AWS EC2") — neither side is reliably the more specific
    one, so match a role's stack item against every term in the bucket in
    both directions. */
export function techMatchesFilter(stackItem: string, filter: string) {
  const item = normalize(stackItem)
  return filter
    .split('/')
    .map(normalize)
    .some((term) => item.includes(term) || term.includes(item))
}

/** AND across selected filters: every chip in `filters` must be matched
    by at least one of the role's own stack entries. */
export function roleMatchesFilters(role: Role, filters: ReadonlySet<string>) {
  return Array.from(filters).every((filter) =>
    role.stack.some((item) => techMatchesFilter(item, filter)),
  )
}
