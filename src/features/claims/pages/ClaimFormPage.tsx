import { useParams } from 'react-router'

interface ClaimFormPageProps {
  mode: 'create' | 'edit'
}

/** T4 builds the shared create/edit form here. */
export function ClaimFormPage({ mode }: ClaimFormPageProps) {
  const { id } = useParams()
  return (
    <section>
      <h1>{mode === 'create' ? 'New claim' : `Edit claim ${id}`}</h1>
      <p>The claim form comes in T4.</p>
    </section>
  )
}
