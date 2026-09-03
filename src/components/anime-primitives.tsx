import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { animate, cubicBezier, onScroll, stagger, svg } from 'animejs'

export const EASE_OUT = cubicBezier(0.16, 1, 0.3, 1)

export function useReducedMotionSafe() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setReduced(query.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return reduced
}

/** Replaces the static `.rise-in` fade-up with a scroll-triggered reveal. */
export function useReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotionSafe()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    el.style.opacity = '0'
    const animation = animate(el, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 600,
      delay,
      ease: EASE_OUT,
      autoplay: onScroll({
        target: el,
        enter: 'bottom-=80 top',
        repeat: false,
      }),
      // anime.js leaves the final translateY as an inline transform (not
      // `none`) — any non-`none` transform permanently creates a new
      // stacking context, which traps z-indexed descendants (e.g. title
      // sparks) below unrelated siblings elsewhere on the page. Clear it
      // once settled so the element stops isolating its descendants.
      onComplete: () => {
        el.style.transform = 'none'
      },
    })

    return () => {
      animation.revert()
    }
  }, [reduced, delay])

  return ref
}

/** Scroll-triggered stagger reveal for lists of panels (children matching `itemSelector`). */
export function useStagger<T extends HTMLElement>(
  itemSelector: string,
  staggerMs = 80,
) {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotionSafe()

  useLayoutEffect(() => {
    const container = ref.current
    if (!container || reduced) return
    const items = container.querySelectorAll<HTMLElement>(itemSelector)
    if (!items.length) return

    items.forEach((item) => {
      item.style.opacity = '0'
    })

    const animation = animate(items, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 600,
      delay: stagger(staggerMs),
      ease: EASE_OUT,
      autoplay: onScroll({
        target: container,
        enter: 'bottom-=80 top',
        repeat: false,
      }),
      // see useReveal — clear the residual transform so these items stop
      // permanently creating their own stacking contexts once settled.
      onComplete: () => {
        items.forEach((item) => {
          item.style.transform = 'none'
        })
      },
    })

    return () => {
      animation.revert()
    }
  }, [reduced, itemSelector, staggerMs])

  return ref
}

/** Counts a span's text up from 0 to `target` once it scrolls into view. */
export function useCountUp(target: number | null, suffix = '') {
  const ref = useRef<HTMLSpanElement | null>(null)
  const reduced = useReducedMotionSafe()

  useEffect(() => {
    const el = ref.current
    if (!el || target === null) return

    if (reduced) {
      el.textContent = `${target}${suffix}`
      return
    }

    const counter = { value: 0 }
    const animation = animate(counter, {
      value: target,
      duration: 700,
      ease: EASE_OUT,
      modifier: (v: number) => Math.round(v),
      onUpdate: () => {
        el.textContent = `${counter.value}${suffix}`
      },
      autoplay: onScroll({
        target: el,
        enter: 'bottom-=40 top',
        repeat: false,
      }),
    })

    return () => {
      animation.revert()
    }
  }, [reduced, target, suffix])

  return ref
}

/** Scroll-linked (not scroll-triggered) opacity pulse for a decorative backdrop behind a section. */
export function useScrollGlow<T extends HTMLElement>() {
  const sectionRef = useRef<T | null>(null)
  const glowRef = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotionSafe()

  useEffect(() => {
    if (reduced) return
    const section = sectionRef.current
    const glow = glowRef.current
    if (!section || !glow) return

    const observer = onScroll({
      target: section,
      enter: 'top bottom',
      leave: 'bottom top',
      sync: true,
    })

    const animation = animate(glow, {
      opacity: [0.15, 0.55, 0.15],
      autoplay: observer,
    })

    return () => {
      animation.revert()
      observer.revert()
    }
  }, [reduced])

  return { sectionRef, glowRef }
}

/** Draw-in animation for a circuit-trace SVG path, triggered on scroll into view. */
export function useDrawIn<T extends SVGPathElement>() {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotionSafe()

  useEffect(() => {
    const path = ref.current
    if (!path) return

    if (reduced) {
      path.style.opacity = '1'
      return
    }

    const [drawable] = svg.createDrawable(path)
    const animation = animate(drawable, {
      draw: ['0 0', '0 1'],
      duration: 900,
      ease: EASE_OUT,
      autoplay: onScroll({
        target: path,
        enter: 'bottom-=60 top',
        repeat: false,
      }),
    })

    return () => {
      animation.revert()
    }
  }, [reduced])

  return ref
}

export function CircuitDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="circuit-trace-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--orange)" />
          <stop offset="100%" stopColor="var(--cyan)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function CircuitConnector({
  className,
  orientation = 'vertical',
}: {
  className?: string
  orientation?: 'vertical' | 'horizontal'
}) {
  const pathRef = useDrawIn<SVGPathElement>()
  const d =
    orientation === 'vertical'
      ? 'M 12 0 L 12 20 L 12 40'
      : 'M 0 12 L 20 12 L 40 12'

  return (
    <svg
      className={className}
      aria-hidden="true"
      focusable="false"
      viewBox={orientation === 'vertical' ? '0 0 24 40' : '0 0 40 24'}
    >
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="url(#circuit-trace-gradient)"
        strokeWidth={2}
      />
    </svg>
  )
}
