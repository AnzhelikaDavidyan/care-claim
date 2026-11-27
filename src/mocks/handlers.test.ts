import type { Booking, NewBooking } from '../features/bookings/types'
import type { Claim } from '../features/claims/types'
import type { Doctor, Slot } from '../features/doctors/types'
import { server } from '../test/server'
import { addDays, createDb, scheduleFor } from './db'
import { createHandlers } from './handlers'

const TODAY = '2026-11-27' // a Friday
const api = (path: string) => new URL(path, window.location.origin)
const post = (path: string, body: unknown) =>
  fetch(api(path), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

/** Each test gets its own db, so POSTs do not leak between tests. */
function useFreshDb() {
  const db = createDb({ today: TODAY })
  server.use(...createHandlers({ db, delayMs: [0, 0], errorRate: 0 }))
  return db
}

async function firstFreeSlot(doctorId: string): Promise<Slot> {
  for (let offset = 1; offset < 14; offset++) {
    const res = await fetch(api(`/api/doctors/${doctorId}/slots?date=${addDays(TODAY, offset)}`))
    const free = ((await res.json()) as Slot[]).find((s) => s.available)
    if (free) return free
  }
  throw new Error('no free slot in two weeks')
}

describe('mock API', () => {
  test('GET /api/doctors returns doctors, filtered by name or clinic and specialty', async () => {
    const db = useFreshDb()
    const all: Doctor[] = await (await fetch(api('/api/doctors'))).json()
    expect(all).toHaveLength(24)

    const dentists: Doctor[] = await (await fetch(api('/api/doctors?specialty=Dentist'))).json()
    expect(dentists.length).toBeGreaterThan(0)
    expect(dentists.every((d) => d.specialty === 'Dentist')).toBe(true)

    const clinic = db.doctors[0].clinic
    const byClinic: Doctor[] = await (await fetch(api(`/api/doctors?q=${encodeURIComponent(clinic.toLowerCase())}`))).json()
    expect(byClinic.every((d) => d.clinic === clinic)).toBe(true)
  })

  test('GET /api/doctors/:id returns 404 for an unknown doctor', async () => {
    useFreshDb()
    expect((await fetch(api('/api/doctors/d-001'))).status).toBe(200)
    expect((await fetch(api('/api/doctors/nope'))).status).toBe(404)
  })

  test('GET slots follows opening hours and marks booked slots unavailable', async () => {
    const db = useFreshDb()
    const sunday = addDays(TODAY, 2)
    const sundaySlots: Slot[] = await (await fetch(api(`/api/doctors/d-001/slots?date=${sunday}`))).json()
    expect(sundaySlots).toEqual([])

    const upcoming = db.bookings.find((b) => b.status === 'confirmed' && b.date >= TODAY)!
    const slots: Slot[] = await (await fetch(api(`/api/doctors/${upcoming.doctorId}/slots?date=${upcoming.date}`))).json()
    expect(slots.map((s) => s.time)).toEqual(scheduleFor(upcoming.date))
    expect(slots.find((s) => s.time === upcoming.time)?.available).toBe(false)
  })

  test('POST /api/bookings creates a booking, then answers 409 for the same slot', async () => {
    useFreshDb()
    const slot = await firstFreeSlot('d-001')
    const body: NewBooking = { doctorId: 'd-001', date: slot.date, time: slot.time, patientName: 'Camille Martin', phone: '06 12 34 56 78', reason: 'Check-up' }

    const created = await post('/api/bookings', body)
    expect(created.status).toBe(201)
    const booking: Booking = await created.json()
    expect(booking).toMatchObject({ id: 'BK-2061', status: 'confirmed', patientName: 'Camille Martin' })

    const again = await post('/api/bookings', { ...body, patientName: 'Someone Else' })
    expect(again.status).toBe(409)
  })

  test('POST /api/bookings rejects a missing patient name', async () => {
    useFreshDb()
    const res = await post('/api/bookings', { doctorId: 'd-001', date: addDays(TODAY, 3), time: '09:00', patientName: ' ', phone: '06' })
    expect(res.status).toBe(400)
  })

  test('GET /api/claims returns claims made from past bookings, in cents', async () => {
    const db = useFreshDb()
    const claims: Claim[] = await (await fetch(api('/api/claims'))).json()
    expect(claims.length).toBeGreaterThan(10)
    const bookingIds = new Set(db.bookings.map((b) => b.id))
    for (const claim of claims) {
      expect(bookingIds.has(claim.bookingId!)).toBe(true)
      expect(claim.careDate < TODAY).toBe(true)
      expect(Number.isInteger(claim.amountCents)).toBe(true)
    }
  })

  test('seeded data is the same on every run', () => {
    expect(createDb({ today: TODAY })).toEqual(createDb({ today: TODAY }))
  })

  test('returns a 500 when the error rate hits', async () => {
    server.use(...createHandlers({ delayMs: [0, 0], errorRate: 1 }))
    const res = await fetch(api('/api/doctors'))
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ message: 'Random server error (mock)' })
  })
})
