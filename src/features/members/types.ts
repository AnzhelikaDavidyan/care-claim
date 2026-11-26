export const PLANS = ['essential', 'standard', 'premium'] as const
export type Plan = (typeof PLANS)[number]

export const MEMBER_STATUSES = ['active', 'inactive'] as const
export type MemberStatus = (typeof MEMBER_STATUSES)[number]

export interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  /** ISO date (YYYY-MM-DD). */
  dateOfBirth: string
  plan: Plan
  /** ISO date (YYYY-MM-DD). */
  coverageStart: string
  status: MemberStatus
}
