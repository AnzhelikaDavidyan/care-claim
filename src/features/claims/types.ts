export const CLAIM_STATUSES = ['submitted', 'in_review', 'approved', 'rejected', 'needs_document'] as const
export type ClaimStatus = (typeof CLAIM_STATUSES)[number]

export const CARE_TYPES = ['general_practice', 'dental', 'optical', 'hospital', 'pharmacy', 'physiotherapy'] as const
export type CareType = (typeof CARE_TYPES)[number]

export interface Claim {
  id: string
  memberId: string
  memberName: string
  careType: CareType
  provider: string
  /** Amount in euros, two decimals. */
  amount: number
  /** Date of care, ISO date (YYYY-MM-DD). */
  careDate: string
  /** ISO timestamp. */
  submittedAt: string
  status: ClaimStatus
  note?: string
}
