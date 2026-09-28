import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'
import { render } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import type { ReactNode } from 'react'

// Components read locale from the URL (useLocation), so they need a
// router around them — this mounts `ui` as the root route at `path`.
async function routerFor(ui: ReactNode, path: string) {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => ui }),
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  await router.load()
  return router
}

export async function renderAt(ui: ReactNode, path = '/') {
  const router = await routerFor(ui, path)
  return render(<RouterProvider router={router} />)
}

/** Server-render only: what crawlers and no-JS visitors get. */
export async function renderToHtmlAt(ui: ReactNode, path = '/') {
  const router = await routerFor(ui, path)
  const container = document.createElement('div')
  container.innerHTML = renderToString(<RouterProvider router={router} />)
  return container
}
