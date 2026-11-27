export const SPECIALTIES = [
  'General practitioner',
  'Dentist',
  'Ophthalmologist',
  'Dermatologist',
  'Pediatrician',
  'Physiotherapist',
] as const
export type Specialty = (typeof SPECIALTIES)[number]

export interface Doctor {
  id: string
  name: string
  specialty: Specialty
  clinic: string
  city: string
  /** Consultation fee in euros, two decimals. */
  fee: number
}

/** A 30-minute appointment slot, in the clinic's local time (no time zone shift). */
export interface Slot {
  doctorId: string
  /** YYYY-MM-DD */
  date: string
  /** HH:mm */
  time: string
  available: boolean
}
