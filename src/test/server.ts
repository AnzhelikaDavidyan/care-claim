import { setupServer } from 'msw/node'
import { createDb } from '../mocks/db'
import { createHandlers } from '../mocks/handlers'

/** Mock API for tests: no delay, no random errors. Override per test with `server.use(...)`. */
export const server = setupServer(...createHandlers({ db: createDb(), delayMs: [0, 0], errorRate: 0 }))
