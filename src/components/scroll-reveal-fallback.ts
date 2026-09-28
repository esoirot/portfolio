import { useEffect } from 'react'
import { useReducedMotionSafe } from './use-reduced-motion.ts'

/** .scroll-reveal is a CSS view() scroll timeline; browsers without
    scroll-driven animations get this one-shot stand-in instead: every
    reveal still below the fold is marked data-reveal="hidden" and flips
    to "shown" (a CSS transition, styles.css) the first time it scrolls
    into view. Mounted once per page. */
export function useScrollRevealFallback() {
  const reduced = useReducedMotionSafe()

  useEffect(() => {
    if (reduced || CSS.supports('animation-timeline: view()')) return

    const pending = [
      ...document.querySelectorAll<HTMLElement>('.scroll-reveal'),
    ].filter((el) => el.getBoundingClientRect().top > window.innerHeight)

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        el.dataset.reveal = 'shown'
        observer.unobserve(el)
      }
    })
    for (const el of pending) {
      el.dataset.reveal = 'hidden'
      observer.observe(el)
    }

    return () => {
      observer.disconnect()
      for (const el of pending)
        if (el.dataset.reveal === 'hidden') delete el.dataset.reveal
    }
  }, [reduced])
}
