import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { securityHeaders } from './src/security-headers.ts'

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro({
      routeRules: {
        // URL carries the file's content hash (?v=, tech-icons.tsx)
        '/tech-icons.svg': {
          // a static file (routing ends on it), so it needs its own
          // security headers — getRouter() only covers rendered responses
          headers: {
            'cache-control': 'public, max-age=31536000, immutable',
            ...securityHeaders(),
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
