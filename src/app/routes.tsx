import { Navigate, type RouteObject } from 'react-router'
import { ClaimDetailPage } from '../features/claims/pages/ClaimDetailPage'
import { ClaimFormPage } from '../features/claims/pages/ClaimFormPage'
import { ClaimsPage } from '../features/claims/pages/ClaimsPage'
import { MembersPage } from '../features/members/pages/MembersPage'
import { Layout } from './Layout'
import { NotFoundPage } from './pages/NotFoundPage'
import { RouteErrorPage } from './pages/RouteErrorPage'

/** Route tree, kept apart from the router so tests can mount it in a memory router. */
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/claims" replace /> },
      {
        path: 'claims',
        children: [
          { index: true, element: <ClaimsPage /> },
          { path: 'new', element: <ClaimFormPage mode="create" /> },
          { path: ':id', element: <ClaimDetailPage /> },
          { path: ':id/edit', element: <ClaimFormPage mode="edit" /> },
        ],
      },
      { path: 'members', element: <MembersPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
