import { spawn } from 'node:child_process'
import type { ChildProcess } from 'node:child_process'
import { afterAll, beforeAll } from 'vitest'

/** Boots the built prod server (.output) on `port` for the test file. */
export function useProdServer(port: number) {
  let server: ChildProcess

  beforeAll(async () => {
    server = spawn('node', ['.output/server/index.mjs'], {
      env: { ...process.env, PORT: String(port) },
      stdio: 'ignore',
    })
    for (let i = 0; i < 50; i++) {
      try {
        await fetch(`http://localhost:${port}/`)
        return
      } catch {
        await new Promise((r) => setTimeout(r, 100))
      }
    }
    throw new Error('prod server did not start')
  })

  afterAll(() => {
    server.kill()
  })

  const get = (path: string) =>
    fetch(`http://localhost:${port}${path}`, { redirect: 'manual' })
  const page = async (path: string) => (await get(path)).text()
  return { get, page }
}
