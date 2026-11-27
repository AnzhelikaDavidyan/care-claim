import { useEffect, useState } from 'react'
import { EmptyState, ErrorState } from '../../../shared/ui/StatePanel'
import { DoctorCard } from '../components/DoctorCard'
import { DoctorsFilters } from '../components/DoctorsFilters'
import { DoctorsGrid, DoctorsGridSkeleton } from '../components/DoctorsGrid'
import { SPECIALTIES, type Doctor, type Specialty } from '../types'
import './DoctorsPage.css'
import { fetchDoctors } from '../../../api/doctors'
import { useSearchParams } from 'react-router'
import { useDebounce } from '../../../shared/hooks/useDebounce'

function isSpecialty(value: string): value is Specialty {
  return (SPECIALTIES as readonly string[]).includes(value)
}

export function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(query, 300);
  const rawSpecialty = searchParams.get('specialty') || '';
  const specialty: Specialty | '' = isSpecialty(rawSpecialty) ? rawSpecialty : '';

  useEffect(() => {
    fetchDoctors({ q: debouncedQuery, specialty })
      .then((data) => setDoctors(data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setIsLoading(false))
  }, [reloadKey, debouncedQuery, specialty]);

  const startLoading = () => {
    setIsLoading(true)
    setError(null)
  }

  const onRetry = () => {
    startLoading()
    setReloadKey((key) => key + 1)
  }

  const updateParam = (key: string, value: string, replace = false) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace },
    )
  }

  const onQueryChange = (value: string) => {
    startLoading()
    updateParam('q', value, true)
  }

  const onSpecialtyChange = (value: Specialty | '') => {
    startLoading()
    updateParam('specialty', value)
  }

  const onClearSearch = () => {
    startLoading()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('q')
      next.delete('specialty')
      return next
    })
  }

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
