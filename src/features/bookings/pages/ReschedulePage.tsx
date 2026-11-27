import { Link, useParams } from 'react-router'

/** T5 reuses the T3 booking flow here, prefilled with the patient details. */
export function ReschedulePage() {
  const { id } = useParams()
  return (
    <section>
      <h1>Reschedule booking {id}</h1>
      <p>Rescheduling comes in T5.</p>
      <Link to="/bookings">Back to bookings</Link>
    </section>
  )
}
