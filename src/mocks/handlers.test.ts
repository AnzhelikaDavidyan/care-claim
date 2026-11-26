import type { Claim } from '../features/claims/types'
import type { Member } from '../features/members/types'
import { server } from '../test/server'
import { createDb } from './db'
import { createHandlers } from './handlers'

const api = (path: string) => new URL(path, window.location.origin)

describe('mock API', () => {
  test('GET /api/claims returns claims, newest first', async () => {
    const res = await fetch(api('/api/claims'))
    expect(res.status).toBe(200)
    const claims: Claim[] = await res.json()
    expect(claims).toHaveLength(120)
    const dates = claims.map((c) => c.submittedAt)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  test('GET /api/members returns members', async () => {
    const res = await fetch(api('/api/members'))
    const members: Member[] = await res.json()
    expect(members).toHaveLength(40)
    expect(members[0]).toMatchObject({ id: 'm-0001', email: expect.stringMatching(/@example\.com$/) })
  })

  test('every claim belongs to an existing member and is not dated in the future', () => {
    const today = new Date('2026-11-27T12:00:00Z')
    const db = createDb({ today })
    const memberIds = new Set(db.members.map((m) => m.id))
    for (const claim of db.claims) {
      expect(memberIds.has(claim.memberId)).toBe(true)
      expect(claim.careDate <= '2026-11-27').toBe(true)
      expect(claim.amount).toBeGreaterThan(0)
    }
  })

  test('seeded data is the same on every run', () => {
    const today = new Date('2026-11-27T12:00:00Z')
    expect(createDb({ today })).toEqual(createDb({ today }))
  })

  test('returns a 500 when the error rate hits', async () => {
    server.use(...createHandlers({ delayMs: [0, 0], errorRate: 1 }))
    const res = await fetch(api('/api/claims'))
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ message: 'Random server error (mock)' })
  })
})
