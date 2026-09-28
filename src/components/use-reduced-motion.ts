import { useEffect, useState } from 'react'

export function useReducedMotionSafe() {
  // starts false on the client too, so the first render matches the
  // server's (which can't know the preference) — synced right after.
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setReduced(query.matches)
    handler()
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return reduced
}
