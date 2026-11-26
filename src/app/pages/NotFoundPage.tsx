import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <p>This page does not exist.</p>
      <Link to="/claims">Go to claims</Link>
    </section>
  )
}
