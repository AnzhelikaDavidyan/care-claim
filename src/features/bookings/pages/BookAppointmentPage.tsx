import { Link, useParams } from 'react-router'

/** T3 builds the booking flow here: day → slot → patient → confirm. */
export function BookAppointmentPage() {
  const { id } = useParams()
  return (
    <section>
      <h1>Book an appointment</h1>
      <p>Booking flow for doctor {id} comes in T3.</p>
      <Link to="/doctors">Back to doctors</Link>
    </section>
  )
}
