import { useEffect, useState } from 'react'
import { api } from '../api'

const rupees = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

export default function Dashboard() {
  const [s, setS] = useState(null)
  useEffect(() => { api.stats().then(setS).catch(() => setS(null)) }, [])

  const cards = s ? [
    ['Collected revenue', rupees(s.total_revenue)],
    ['Total bookings (successful)', s.total_bookings],
    ['Failed bookings', s.failed_bookings ?? 0],
    ['Paid bookings', s.paid_bookings],
    ['Pending payment', s.pending_bookings],
    ['Activities', s.activities],
    ['Bays', s.bays],
    ['Food items', s.food_items],
  ] : []

  return (
    <div>
      <h1 className="page">Dashboard</h1>
      {!s ? (
        <div className="page-card"><div className="empty">Loading…</div></div>
      ) : (
        <div className="grid">
          {cards.map(([label, val]) => (
            <div key={label} className="page-card">
              <div className="muted" style={{ fontSize: 13 }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
