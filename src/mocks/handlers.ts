import { delay, http, HttpResponse } from 'msw'
import type { Booking, NewBooking } from '../features/bookings/types'
import { createDb, slotsFor, type Db } from './db'

export interface MockApiOptions {
  db?: Db
  /** Random latency range in ms. */
  delayMs?: [min: number, max: number]
  /** Share of requests that fail with a 500, from 0 to 1. */
  errorRate?: number
}

const DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * The mock API. In the browser it is slow and fails on purpose, so every screen
 * has to handle loading and error states. Tests pass `delayMs: [0, 0]` and `errorRate: 0`.
 *
 * GET  /api/doctors?q=&specialty=   doctors, filtered by name or clinic and specialty
 * GET  /api/doctors/:id             one doctor, 404 if unknown
 * GET  /api/doctors/:id/slots?date= that day's slots, booked ones have available: false
 * GET  /api/bookings                all bookings, by date and time
 * POST /api/bookings                201 with the booking, 409 if the slot is already taken
 * GET  /api/claims                  all claims, newest care date first
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

  const findDoctor = (id: unknown) => db.doctors.find((d) => d.id === id)

  return [
    http.get('/api/doctors', async ({ request }) => {
      const failure = await simulateNetwork()
      if (failure) return failure
      const params = new URL(request.url).searchParams
      const q = (params.get('q') ?? '').trim().toLowerCase()
      const specialty = params.get('specialty')
      const doctors = db.doctors.filter(
        (d) => (!q || d.name.toLowerCase().includes(q) || d.clinic.toLowerCase().includes(q)) && (!specialty || d.specialty === specialty),
      )
      return HttpResponse.json(doctors)
    }),

    http.get('/api/doctors/:id', async ({ params }) => {
      const failure = await simulateNetwork()
      if (failure) return failure
      const doctor = findDoctor(params.id)
      if (!doctor) return HttpResponse.json({ message: 'Doctor not found' }, { status: 404 })
      return HttpResponse.json(doctor)
    }),

    http.get('/api/doctors/:id/slots', async ({ params, request }) => {
      const failure = await simulateNetwork()
      if (failure) return failure
      if (!findDoctor(params.id)) return HttpResponse.json({ message: 'Doctor not found' }, { status: 404 })
      const date = new URL(request.url).searchParams.get('date') ?? ''
      if (!DATE.test(date)) return HttpResponse.json({ message: 'date must be YYYY-MM-DD' }, { status: 400 })
      return HttpResponse.json(slotsFor(db, String(params.id), date))
    }),

    http.get('/api/bookings', async () => {
      const failure = await simulateNetwork()
      if (failure) return failure
      return HttpResponse.json(db.bookings)
    }),

    http.post('/api/bookings', async ({ request }) => {
      const failure = await simulateNetwork()
      if (failure) return failure
      const body = (await request.json()) as Partial<NewBooking>
      const { doctorId, date, time, patientName, phone, reason = '' } = body
      if (!doctorId || !date || !time || !patientName?.trim() || !phone?.trim()) {
        return HttpResponse.json({ message: 'doctorId, date, time, patientName and phone are required' }, { status: 400 })
      }
      const doctor = findDoctor(doctorId)
      if (!doctor) return HttpResponse.json({ message: 'Doctor not found' }, { status: 404 })
      // The server re-checks availability: the client's slot list may be out of date.
      const slot = slotsFor(db, doctorId, date).find((s) => s.time === time)
      if (!slot?.available) return HttpResponse.json({ message: 'This slot was just taken' }, { status: 409 })

      const lastNumber = Math.max(2000, ...db.bookings.map((b) => Number(b.id.slice(3))))
      const booking: Booking = {
        id: `BK-${lastNumber + 1}`,
        doctorId,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        date,
        time,
        patientName: patientName.trim(),
        phone: phone.trim(),
        reason: reason.trim(),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      }
      db.bookings.push(booking)
      db.bookings.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      return HttpResponse.json(booking, { status: 201 })
    }),

    http.get('/api/claims', async () => {
      const failure = await simulateNetwork()
      if (failure) return failure
      return HttpResponse.json(db.claims)
    }),
  ]
}
