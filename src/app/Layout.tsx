import { NavLink, Outlet } from 'react-router'
import './Layout.css'

/** NavLink without `end` stays active on child routes, e.g. Doctors on /doctors/:id/book. */
const NAV_ITEMS = [
  { to: '/doctors', label: 'Doctors' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/claims', label: 'Claims' },
]

export function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <svg aria-hidden="true" width="30" height="30" viewBox="0 0 30 30">
            <rect width="30" height="30" rx="9" fill="currentColor" />
            <path d="M15 9v12M9 15h12" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-name">CareClaim</span>
            <span className="sidebar__brand-tagline">Care &amp; claims</span>
          </div>
        </div>
        <nav aria-label="Main">
          <ul className="sidebar__nav">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => (isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link')}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  )
}
