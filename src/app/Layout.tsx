import { NavLink, Outlet } from 'react-router'
import './Layout.css'

const NAV_ITEMS = [
  { to: '/claims', label: 'Claims' },
  { to: '/members', label: 'Members' },
]

export function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__brand">CareClaim Ops</div>
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
