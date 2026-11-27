import { EmptyState, ErrorState } from '../../../shared/ui/StatePanel'
import { DoctorCard } from '../components/DoctorCard'
import { DoctorsFilters } from '../components/DoctorsFilters'
import { DoctorsGrid, DoctorsGridSkeleton } from '../components/DoctorsGrid'
import type { Doctor, Specialty } from '../types'
import './DoctorsPage.css'

/**
 * T1 — Doctors list. The markup below is done. Your part is everything marked TODO(T1):
 * the values in the stub block are fake, replace them with real state, URL params and fetching.
 * Change the shape freely (e.g. a status union, or useReducer) — the JSX only needs these values.
 */
export function DoctorsPage() {
  // ── TODO(T1): stub values, replace with your code ──────────────────────────
  const query = '' //               raw search box text, from ?q= in the URL
  const specialty: Specialty | '' = '' // from ?specialty= in the URL
  const isLoading = true
  const error: string | null = null
  const doctors: Doctor[] = []
  const onQueryChange = (_value: string) => {} //            write ?q= (keep the other params)
  const onSpecialtyChange = (_value: Specialty | '') => {} // write ?specialty=
  const onRetry = () => {} //                                 fetch again
  const onClearSearch = () => {} //                           remove q and specialty
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <section className="doctors-page">
      <header className="doctors-page__header">
        <div>
          <h1 className="doctors-page__title">Doctors</h1>
          <p className="doctors-page__subtitle">
            {!isLoading && !error && `${doctors.length} doctors · `}book an appointment or manage the list
          </p>
        </div>
        {/* T2 adds the "Add doctor" button here. */}
      </header>

      <DoctorsFilters query={query} specialty={specialty} onQueryChange={onQueryChange} onSpecialtyChange={onSpecialtyChange} />

      {isLoading ? (
        <DoctorsGridSkeleton />
      ) : error ? (
        <ErrorState
          title="Could not load doctors"
          action={
            <button type="button" className="btn" onClick={onRetry}>
              Retry
            </button>
          }
        >
          {error}
        </ErrorState>
      ) : doctors.length === 0 ? (
        <EmptyState
          title="No doctors match your search"
          action={
            <button type="button" className="btn" onClick={onClearSearch}>
              Clear search
            </button>
          }
        >
          Try another name or specialty.
        </EmptyState>
      ) : (
        <DoctorsGrid>
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </DoctorsGrid>
      )}
    </section>
  )
}
