export const CLAIM_STATUSES = ['submitted', 'in_review', 'approved', 'rejected', 'paid'] as const
export type ClaimStatus = (typeof CLAIM_STATUSES)[number]

export const CARE_TYPES = ['consultation', 'dental', 'optical', 'dermatology', 'pediatrics', 'physiotherapy'] as const
export type CareType = (typeof CARE_TYPES)[number]

export interface Claim {
  /** e.g. CL-1001 */
  id: string
  /** The booking the claim was created from, if any. */
  bookingId?: string
  patientName: string
  careType: CareType
  /** Date of care, YYYY-MM-DD. */
  careDate: string
  /** Amount in cents, to avoid floating point errors. Shown in euros. */
  amountCents: number
  status: ClaimStatus
  note?: string
}
