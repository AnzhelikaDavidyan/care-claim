import type { ReactNode } from 'react'
import { DoctorCardSkeleton } from './DoctorCardSkeleton'
import './DoctorsGrid.css'

/** The cards grid. Put <DoctorCard /> elements inside. */
export function DoctorsGrid({ children }: { children: ReactNode }) {
  return (
    <section className="doctors-grid" aria-label="Doctors">
      {children}
    </section>
  )
}

/** The grid while loading: six skeleton cards, announced once to screen readers. */
export function DoctorsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="doctors-grid" aria-busy="true" aria-label="Loading doctors">
      <span className="visually-hidden" role="status">
        Loading doctors…
      </span>
      {Array.from({ length: count }, (_, i) => (
        <DoctorCardSkeleton key={i} />
      ))}
    </section>
  )
}
