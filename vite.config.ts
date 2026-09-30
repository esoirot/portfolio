import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { contentSecurityPolicy } from './src/csp.ts'

// CSP is per-request for everything the app renders (router.tsx);
// static files get these plus, for the SVG sprite, a static CSP below.
const SECURITY_HEADERS = {
  'strict-transport-security': 'max-age=63072000',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy':
    'camera=(), microphone=(), geolocation=(), browsing-topics=()',
}

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro({
      routeRules: {
        '/**': { headers: SECURITY_HEADERS },
        // URL carries the file's content hash (?v=, tech-icons.tsx)
        '/tech-icons.svg': {
          headers: {
            'cache-control': 'public, max-age=31536000, immutable',
            'content-security-policy': contentSecurityPolicy(),
          },
        },
      },
    }),
    viteReact(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
})
export default config
