import { Link } from 'react-router'

/** T1 builds the claims table here. */
export function ClaimsPage() {
  return (
    <section>
      <h1>Claims</h1>
      <p>The claims table comes in T1.</p>
      <Link to="/claims/new">New claim</Link>
    </section>
  )
}
