import type { Booking } from '../features/bookings/types'
import type { CareType, Claim, ClaimStatus } from '../features/claims/types'
import { SPECIALTIES, type Doctor, type Slot, type Specialty } from '../features/doctors/types'

/** Small seeded PRNG so the mock data is the same on every reload. */
function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32
    return state / 2 ** 32
  }
}

/** Stable 0..1 value for a string, so a slot is pre-booked the same way on every request. */
function hashToUnit(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 2 ** 32
}

function pick<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)]
}

export const CLINIC_TIME_ZONE = 'Europe/Paris'

/** Today's date in the clinic's time zone, YYYY-MM-DD. */
export function clinicToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: CLINIC_TIME_ZONE }).format(now)
}

/** Adds days to a YYYY-MM-DD date. Works in UTC so no time zone can shift the day. */
export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function weekday(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCDay()
}

function halfHours(from: string, to: string) {
  const times: string[] = []
  for (let m = toMinutes(from); m < toMinutes(to); m += 30) {
    times.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  }
  return times
}

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const WEEKDAY_TIMES = [...halfHours('09:00', '12:00'), ...halfHours('14:00', '17:30')]
const SATURDAY_TIMES = halfHours('09:00', '12:00')

/** Opening times for a day: Mon–Fri 09:00–12:00 and 14:00–17:30, Sat mornings, closed on Sunday. */
export function scheduleFor(date: string): string[] {
  const day = weekday(date)
  if (day === 0) return []
  return day === 6 ? SATURDAY_TIMES : WEEKDAY_TIMES
}

/** Share of slots already taken by patients outside the app. */
const PRE_BOOKED_RATE = 0.3

const FIRST_NAMES = ['Camille', 'Lucas', 'Léa', 'Hugo', 'Chloé', 'Louis', 'Manon', 'Gabriel', 'Inès', 'Jules', 'Sarah', 'Adam', 'Emma', 'Nathan', 'Zoé', 'Arthur', 'Lina', 'Raphaël', 'Jade', 'Paul']
const LAST_NAMES = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier']
const CLINICS = [
  { clinic: 'Centre Médical Bastille', city: 'Paris' },
  { clinic: 'Cabinet Voltaire', city: 'Paris' },
  { clinic: 'Clinique des Lilas', city: 'Les Lilas' },
  { clinic: 'Maison de Santé République', city: 'Paris' },
  { clinic: 'Centre de Santé Croix-Rousse', city: 'Lyon' },
  { clinic: 'Cabinet du Vieux-Port', city: 'Marseille' },
]
const FEE_RANGE: Record<Specialty, [number, number]> = {
  'General practitioner': [26.5, 30],
  Dentist: [30, 60],
  Ophthalmologist: [50, 80],
  Dermatologist: [50, 70],
  Pediatrician: [32, 45],
  Physiotherapist: [25, 40],
}
const CARE_TYPE_BY_SPECIALTY: Record<Specialty, CareType> = {
  'General practitioner': 'consultation',
  Dentist: 'dental',
  Ophthalmologist: 'optical',
  Dermatologist: 'dermatology',
  Pediatrician: 'pediatrics',
  Physiotherapist: 'physiotherapy',
}
const REASONS = ['Check-up', 'Follow-up visit', 'Pain', 'Prescription renewal', 'Skin rash', 'Back pain', 'Vaccination', 'Eye test']
const CANCEL_REASONS = ['Patient unavailable', 'Feeling better', 'Booked by mistake']
const CLAIM_STATUSES_BY_AGE: ClaimStatus[] = ['submitted', 'in_review', 'approved', 'rejected', 'paid']

function randomName(random: () => number) {
  return `${pick(random, FIRST_NAMES)} ${pick(random, LAST_NAMES)}`
}

function seedDoctors(random: () => number, count: number): Doctor[] {
  return Array.from({ length: count }, (_, i) => {
    const specialty = SPECIALTIES[i % SPECIALTIES.length]
    const [min, max] = FEE_RANGE[specialty]
    return {
      id: `d-${String(i + 1).padStart(3, '0')}`,
      name: `Dr. ${randomName(random)}`,
      specialty,
      ...pick(random, CLINICS),
      fee: Math.round((min + random() * (max - min)) * 100) / 100,
    }
  })
}

function seedBookings(random: () => number, count: number, doctors: Doctor[], today: string): Booking[] {
  const bookings: Booking[] = []
  const taken = new Set<string>()
  while (bookings.length < count) {
    const doctor = pick(random, doctors)
    const date = addDays(today, Math.floor(random() * 75) - 60)
    const times = scheduleFor(date)
    if (times.length === 0) continue
    const time = pick(random, times)
    const key = slotKey(doctor.id, date, time)
    if (taken.has(key)) continue
    taken.add(key)
    const cancelled = random() < 0.15
    bookings.push({
      id: '',
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date,
      time,
      patientName: randomName(random),
      phone: `06 ${Array.from({ length: 4 }, () => String(Math.floor(random() * 100)).padStart(2, '0')).join(' ')}`,
      reason: pick(random, REASONS),
      status: cancelled ? 'cancelled' : 'confirmed',
      ...(cancelled ? { cancelReason: pick(random, CANCEL_REASONS) } : {}),
      createdAt: `${addDays(date, -Math.floor(1 + random() * 20))}T09:00:00.000Z`,
    })
  }
  bookings.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
  return bookings.map((b, i) => ({ ...b, id: `BK-${2001 + i}` }))
}

/** About 70% of past confirmed bookings already have a claim. */
function seedClaims(random: () => number, bookings: Booking[], doctors: Doctor[], today: string): Claim[] {
  const doctorsById = new Map(doctors.map((d) => [d.id, d]))
  const claims: Claim[] = []
  for (const booking of bookings) {
    if (booking.status !== 'confirmed' || booking.date >= today || random() > 0.7) continue
    const doctor = doctorsById.get(booking.doctorId)!
    claims.push({
      id: `CL-${1001 + claims.length}`,
      bookingId: booking.id,
      patientName: booking.patientName,
      careType: CARE_TYPE_BY_SPECIALTY[doctor.specialty],
      careDate: booking.date,
      amountCents: Math.round(doctor.fee * 100),
      status: pick(random, CLAIM_STATUSES_BY_AGE),
    })
  }
  return claims.reverse()
}

export function slotKey(doctorId: string, date: string, time: string) {
  return `${doctorId}|${date}|${time}`
}

export interface Db {
  doctors: Doctor[]
  bookings: Booking[]
  claims: Claim[]
  /** Today in the clinic's time zone, fixed when the db is built. */
  today: string
}

export interface SeedOptions {
  doctors?: number
  bookings?: number
  seed?: number
  /** YYYY-MM-DD. Defaults to today in the clinic's time zone. */
  today?: string
}

/** Builds a fresh in-memory database. Tests call this to start from a known state. */
export function createDb({ doctors = 24, bookings = 60, seed = 42, today = clinicToday() }: SeedOptions = {}): Db {
  const random = createRandom(seed)
  const doctorList = seedDoctors(random, doctors)
  const bookingList = seedBookings(random, bookings, doctorList, today)
  return {
    doctors: doctorList,
    bookings: bookingList,
    claims: seedClaims(random, bookingList, doctorList, today),
    today,
  }
}

/**
 * Slots for one doctor on one day. A slot is unavailable when a confirmed booking holds it
 * or when it was pre-booked outside the app. Past days have no slots.
 */
export function slotsFor(db: Db, doctorId: string, date: string): Slot[] {
  if (date < db.today) return []
  const held = new Set(db.bookings.filter((b) => b.status === 'confirmed').map((b) => slotKey(b.doctorId, b.date, b.time)))
  return scheduleFor(date).map((time) => {
    const key = slotKey(doctorId, date, time)
    return { doctorId, date, time, available: !held.has(key) && hashToUnit(key) >= PRE_BOOKED_RATE }
  })
}
