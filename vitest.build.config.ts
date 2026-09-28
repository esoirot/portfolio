import { defineConfig } from 'vitest/config'

// Runs against the production output in .output/ — `pnpm test:build`
// builds first, then checks what actually ships.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/build/**/*.test.ts'],
    testTimeout: 30000,
  },
})
