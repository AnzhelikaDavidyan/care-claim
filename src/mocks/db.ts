import { CARE_TYPES, CLAIM_STATUSES, type CareType, type Claim } from '../features/claims/types'
import { PLANS, type Member } from '../features/members/types'

/** Small seeded PRNG so the mock data is the same on every reload. */
function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32
    return state / 2 ** 32
  }
}

const FIRST_NAMES = ['Camille', 'Lucas', 'Léa', 'Hugo', 'Chloé', 'Louis', 'Manon', 'Gabriel', 'Inès', 'Jules', 'Sarah', 'Adam', 'Emma', 'Nathan', 'Zoé', 'Arthur', 'Lina', 'Raphaël', 'Jade', 'Paul']
const LAST_NAMES = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier']

const PROVIDERS: Record<CareType, string[]> = {
  general_practice: ['Dr. Morel', 'Dr. Fontaine', 'Cabinet Voltaire'],
  dental: ['Centre Dentaire Bastille', 'Dr. Chevalier'],
  optical: ['Optique Lafayette', 'Krys Opéra'],
  hospital: ['Hôpital Saint-Louis', 'Clinique des Lilas'],
  pharmacy: ['Pharmacie du Marais', 'Pharmacie Centrale'],
  physiotherapy: ['Kiné République', 'Cabinet Kiné Nation'],
}

const AMOUNT_RANGE: Record<CareType, [number, number]> = {
  general_practice: [25, 60],
  dental: [40, 900],
  optical: [80, 450],
  hospital: [200, 3000],
  pharmacy: [5, 120],
  physiotherapy: [30, 80],
}

function pick<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)]
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function daysBefore(base: Date, days: number) {
  const d = new Date(base)
  d.setUTCDate(d.getUTCDate() - days)
  return d
}

function seedMembers(random: () => number, count: number, today: Date): Member[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length]
    const lastName = pick(random, LAST_NAMES)
    return {
      id: `m-${String(i + 1).padStart(4, '0')}`,
      firstName,
      lastName,
      email: `${firstName}.${lastName}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase() + '@example.com',
      dateOfBirth: isoDate(daysBefore(today, Math.floor(18 * 365 + random() * 50 * 365))),
      plan: pick(random, PLANS),
      coverageStart: isoDate(daysBefore(today, Math.floor(30 + random() * 1500))),
      status: random() < 0.85 ? 'active' : 'inactive',
    }
  })
}

function seedClaims(random: () => number, count: number, members: Member[], today: Date): Claim[] {
  return Array.from({ length: count }, (_, i) => {
    const member = pick(random, members)
    const careType = pick(random, CARE_TYPES)
    const [min, max] = AMOUNT_RANGE[careType]
    const careDate = daysBefore(today, Math.floor(random() * 120))
    const submittedAt = new Date(careDate)
    submittedAt.setUTCDate(submittedAt.getUTCDate() + Math.floor(random() * 10))
    submittedAt.setUTCHours(8 + Math.floor(random() * 10), Math.floor(random() * 60))
    return {
      id: `c-${String(i + 1).padStart(5, '0')}`,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      careType,
      provider: pick(random, PROVIDERS[careType]),
      amount: Math.round((min + random() * (max - min)) * 100) / 100,
      careDate: isoDate(careDate),
      submittedAt: (submittedAt > today ? today : submittedAt).toISOString(),
      status: pick(random, CLAIM_STATUSES),
    }
  })
}

export interface Db {
  claims: Claim[]
  members: Member[]
}

export interface SeedOptions {
  claims?: number
  members?: number
  seed?: number
  today?: Date
}

/** Builds a fresh in-memory database. Tests call this to start from a known state. */
export function createDb({ claims = 120, members = 40, seed = 42, today = new Date() }: SeedOptions = {}): Db {
  const random = createRandom(seed)
  const memberList = seedMembers(random, members, today)
  return {
    members: memberList,
    claims: seedClaims(random, claims, memberList, today).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
  }
}
