import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../auth'

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
       strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

const NAV = [
  ['Dashboard', '/dashboard', 'M3 10.5 12 3l9 7.5M5 9.5V20h14V9.5'],
  ['Bookings', '/bookings', 'M7 3v4M17 3v4M4 8h16M5 6h14v14H5z'],
  ['Attractions', '/attractions', 'M4 4h7v7H4zM13 4h7v7h-7zM13 13h7v7h-7zM4 13h7v7H4z'],
  ['Food', '/food', 'M4 3v8a2 2 0 0 0 2 2h0V3M6 3v18M16 3c-1.5 0-3 2-3 5s1.5 5 3 5v8'],
  ['Corporates', '/corporates', 'M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  ['Revenue', '/revenue', 'M7 5h10M7 9h10M9 5a4 4 0 0 1 0 8H7l7 6'],
  ['Discounts', '/discounts', 'M5 19 19 5M8 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM16 19a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z'],
  ['Communications', '/communications', 'M4 11 20 6v12L4 13zM4 11v3M11 17a3 3 0 0 1-5 0'],
  ['Events', '/events', 'M7 3v4M17 3v4M4 8h16M5 6h14v14H5zM9 14h6'],
  ['Settings', '/settings', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12h2M18 12h2M12 4v2M12 18v2'],
]

export default function Layout() {
  const nav = useNavigate()
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <img src="/strikin-mark.png" alt="" style={{ width: 30, height: 30 }} />
          <div><b>STRIKIN</b><small>Control centre</small></div>
        </div>
        <nav className="nav">
          {NAV.map(([label, to, d]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon d={d} />{label}
            </NavLink>
          ))}
          <div className="spacer" />
          <NavLink to="/help" className="">
            <Icon d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.5 9a2.5 2.5 0 0 1 4.8 1c0 1.7-2.3 2-2.3 3.5M12 17h.01" />
            Help and Docs
          </NavLink>
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input placeholder="Search" />
          </div>
          <div className="me">
            <div className="avatar">A</div>
            <div className="who"><b>Arun</b><small>Super admin</small></div>
            <button className="btn sm" onClick={() => { logout(); nav('/login') }}>Logout</button>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  )
}
