import type { Specialty } from '../doctors/types'

export const BOOKING_STATUSES = ['confirmed', 'cancelled'] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export interface Booking {
  /** e.g. BK-2031 */
  id: string
  doctorId: string
  doctorName: string
  specialty: Specialty
  /** YYYY-MM-DD, clinic's local date. */
  date: string
  /** HH:mm, clinic's local time. */
  time: string
  patientName: string
  phone: string
  reason: string
  status: BookingStatus
  cancelReason?: string
  /** ISO timestamp. */
  createdAt: string
}

/** Body of POST /api/bookings. */
export type NewBooking = Pick<Booking, 'doctorId' | 'date' | 'time' | 'patientName' | 'phone' | 'reason'>
