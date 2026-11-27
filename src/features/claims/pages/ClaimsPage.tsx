import { Link, Outlet } from 'react-router'

/**
 * T6 builds the claims table here. The New / Edit claim drawer (T7) is a nested
 * route rendered in the <Outlet />, so the table stays visible behind it.
 */
export function ClaimsPage() {
  return (
    <section>
      <h1>Claims</h1>
      <p>The claims table comes in T6.</p>
      <Link to="/claims/new">New claim</Link>
      <Outlet />
    </section>
  )
}
