import './DoctorCard.css'

/** Grey placeholder with the same shape as a DoctorCard. */
export function DoctorCardSkeleton() {
  return (
    <div className="doctor-card doctor-card--skeleton" aria-hidden="true">
      <div className="doctor-card__head">
        <div className="skeleton skeleton--avatar" />
        <div className="doctor-card__title" style={{ flex: 1, gap: 8 }}>
          <div className="skeleton skeleton--line" style={{ width: '70%' }} />
          <div className="skeleton skeleton--line" style={{ width: '45%' }} />
        </div>
      </div>
      <div className="doctor-card__meta" style={{ gap: 8 }}>
        <div className="skeleton skeleton--line" style={{ width: '85%' }} />
        <div className="skeleton skeleton--line" style={{ width: '35%' }} />
      </div>
      <div className="skeleton skeleton--button" />
    </div>
  )
}
