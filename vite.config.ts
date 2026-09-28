import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

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
          headers: { 'cache-control': 'public, max-age=31536000, immutable' },
        },
      },
    }),
    viteReact(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
  server: {
    allowedHosts: ['.ngrok-free.app'],
  },
})
export default config
