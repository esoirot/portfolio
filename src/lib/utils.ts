import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'

// No tailwind-merge: a className override that fights a base utility
// (e.g. font-bold vs Button's font-medium) needs Tailwind's `!` suffix.
export function cn(...inputs: Array<ClassValue>) {
  return clsx(inputs)
}
