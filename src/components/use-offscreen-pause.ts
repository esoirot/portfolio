import { useEffect, useRef } from 'react'

/** Marks the element `data-offscreen` while it's out of view — styles.css
    pauses every CSS animation inside a marked element, so the page's
    many infinite loops (marquee, CRT static/roll, LCD jitter, conveyor…)
    only cost CPU where someone can see them. */
export function useOffscreenPause<T extends HTMLElement>(
  rootMargin = '200px 0px',
) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => el.toggleAttribute('data-offscreen', !entry.isIntersecting),
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return ref
}
