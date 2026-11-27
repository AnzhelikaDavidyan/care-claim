import { Link } from 'react-router'
import type { Doctor } from '../types'
import './DoctorCard.css'

interface DoctorCardProps {
  doctor: Doctor
  /** T2 passes these. Without them the Edit and Delete buttons are not shown. */
  onEdit?: (doctor: Doctor) => void
  onDelete?: (doctor: Doctor) => void
}

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

function initials(name: string) {
  return name
    .replace(/^Dr\.\s*/, '')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

/** One doctor in the grid. Markup only: no state, no fetching. */
export function DoctorCard({ doctor, onEdit, onDelete }: DoctorCardProps) {
  return (
    <article className="doctor-card">
      <div className="doctor-card__head">
        <div className="doctor-card__avatar" aria-hidden="true">
          {initials(doctor.name)}
        </div>
        <div className="doctor-card__title">
          <h2 className="doctor-card__name">{doctor.name}</h2>
          <span className="doctor-card__specialty">{doctor.specialty}</span>
        </div>
      </div>

      <div className="doctor-card__meta">
        <span>
          {doctor.clinic} · {doctor.city}
        </span>
        <span>Fee {euros.format(doctor.fee)}</span>
      </div>

      <div className="doctor-card__actions">
        <Link to={`/doctors/${doctor.id}/book`} className="btn btn--primary doctor-card__book">
          Book
        </Link>
        {onEdit && (
          <button type="button" className="btn btn--icon" aria-label={`Edit ${doctor.name}`} onClick={() => onEdit(doctor)}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button type="button" className="btn btn--icon btn--icon-danger" aria-label={`Delete ${doctor.name}`} onClick={() => onDelete(doctor)}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
            </svg>
          </button>
        )}
      </div>
    </article>
  )
}
