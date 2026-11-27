import { Navigate, type RouteObject } from 'react-router'
import { BookAppointmentPage } from '../features/bookings/pages/BookAppointmentPage'
import { BookingsPage } from '../features/bookings/pages/BookingsPage'
import { ReschedulePage } from '../features/bookings/pages/ReschedulePage'
import { ClaimDrawer } from '../features/claims/pages/ClaimDrawer'
import { ClaimsPage } from '../features/claims/pages/ClaimsPage'
import { DoctorsPage } from '../features/doctors/pages/DoctorsPage'
import { Layout } from './Layout'
import { NotFoundPage } from './pages/NotFoundPage'
import { RouteErrorPage } from './pages/RouteErrorPage'

/** Route tree, kept apart from the router so tests can mount it in a memory router. */
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/doctors" replace /> },
      {
        path: 'doctors',
        children: [
          { index: true, element: <DoctorsPage /> },
          { path: ':id/book', element: <BookAppointmentPage /> },
        ],
      },
      {
        path: 'bookings',
        children: [
          { index: true, element: <BookingsPage /> },
          { path: ':id/reschedule', element: <ReschedulePage /> },
        ],
      },
      {
        // The drawer routes are children of the claims page, so the table stays mounted behind them.
        path: 'claims',
        element: <ClaimsPage />,
        children: [
          { path: 'new', element: <ClaimDrawer mode="create" /> },
          { path: ':id/edit', element: <ClaimDrawer mode="edit" /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
