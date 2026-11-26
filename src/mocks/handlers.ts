import { delay, http, HttpResponse } from 'msw'
import { createDb, type Db } from './db'

export interface MockApiOptions {
  db?: Db
  /** Random latency range in ms. */
  delayMs?: [min: number, max: number]
  /** Share of requests that fail with a 500, from 0 to 1. */
  errorRate?: number
}

/**
 * The mock API. In the browser it is slow and fails on purpose, so every screen
 * has to handle loading and error states. Tests pass `delayMs: [0, 0]` and `errorRate: 0`.
 */
export function createHandlers({ db = createDb(), delayMs = [300, 1200], errorRate = 0.1 }: MockApiOptions = {}) {
  async function simulateNetwork() {
    const [min, max] = delayMs
    await delay(min + Math.random() * (max - min))
    if (Math.random() < errorRate) {
      return HttpResponse.json({ message: 'Random server error (mock)' }, { status: 500 })
    }
    return undefined
  }

  return [
    http.get('/api/claims', async () => {
      const failure = await simulateNetwork()
      if (failure) return failure
      return HttpResponse.json(db.claims)
    }),

    http.get('/api/members', async () => {
      const failure = await simulateNetwork()
      if (failure) return failure
      return HttpResponse.json(db.members)
    }),
  ]
}
