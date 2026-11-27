import { SPECIALTIES, type Specialty } from '../types'
import './DoctorsFilters.css'

interface DoctorsFiltersProps {
  /** What the search box shows (the raw input, not the debounced value). */
  query: string
  /** '' means all specialties. */
  specialty: Specialty | ''
  onQueryChange: (query: string) => void
  onSpecialtyChange: (specialty: Specialty | '') => void
}

/** Search box and specialty select. Controlled: the parent owns both values. */
export function DoctorsFilters({ query, specialty, onQueryChange, onSpecialtyChange }: DoctorsFiltersProps) {
  return (
    <div className="doctors-filters" role="search">
      <div className="field doctors-filters__search">
        <label className="field__label" htmlFor="doctors-search">
          Search
        </label>
        <input
          id="doctors-search"
          className="field__control"
          type="search"
          placeholder="Doctor or clinic name"
          autoComplete="off"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
      <div className="field doctors-filters__specialty">
        <label className="field__label" htmlFor="doctors-specialty">
          Specialty
        </label>
        <select
          id="doctors-specialty"
          className="field__control"
          value={specialty}
          onChange={(event) => onSpecialtyChange(event.target.value as Specialty | '')}
        >
          <option value="">All specialties</option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
