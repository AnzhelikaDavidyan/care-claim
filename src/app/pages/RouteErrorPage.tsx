import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

/** Shown when a route throws while rendering. T10 adds per-route error boundaries with Retry. */
export function RouteErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : 'Unknown error'
  return (
    <section style={{ padding: 32 }}>
      <h1>Something went wrong</h1>
      <p>{message}</p>
      <Link to="/claims">Go to claims</Link>
    </section>
  )
}
