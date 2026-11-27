import { Link, useParams } from 'react-router'

interface ClaimDrawerProps {
  mode: 'create' | 'edit'
}

/** T7 builds the shared create/edit claim form here, as a drawer over the claims table. */
export function ClaimDrawer({ mode }: ClaimDrawerProps) {
  const { id } = useParams()
  const title = mode === 'create' ? 'New claim' : `Edit claim ${id}`
  return (
    <aside aria-label={title}>
      <h2>{title}</h2>
      <p>The claim form comes in T7.</p>
      <Link to="/claims">Close</Link>
    </aside>
  )
}
