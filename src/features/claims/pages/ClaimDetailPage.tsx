import { Link, useParams } from 'react-router'

/** T6 builds the detail page and review form here. */
export function ClaimDetailPage() {
  const { id } = useParams()
  return (
    <section>
      <h1>Claim {id}</h1>
      <p>Claim details come in T6.</p>
      <Link to={`/claims/${id}/edit`}>Edit</Link>
    </section>
  )
}
