import { useEffect, useState } from 'react'
import { api } from '../api'

const rupees = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
const colors = { paid: '#16a34a', pending: '#e5484d', pending_payment: '#b45309' }
const Pill = ({ s }) => <span style={{ color: colors[s] || '#6b7280', fontWeight: 600 }}>{s}</span>

export default function Bookings() {
  const [rows, setRows] = useState(null)
  useEffect(() => { api.bookings().then(setRows).catch(() => setRows([])) }, [])

  return (
    <div>
      <h1 className="page">Bookings</h1>
      <div className="page-card">
        {!rows ? <div className="empty">Loading…</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Booking</th><th>Customer</th><th>Activity</th><th>Bay</th><th>When</th><th>Players</th><th>Amount</th><th>Payment</th>
              </tr></thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td><b>{b.id}</b></td>
                    <td>{b.guest_name || '—'}<div className="muted" style={{ fontSize: 12 }}>{b.guest_phone}</div></td>
                    <td>{b.activity}</td>
                    <td>{b.bay}</td>
                    <td>{b.date}<div className="muted" style={{ fontSize: 12 }}>{b.time}</div></td>
                    <td>{b.players}</td>
                    <td>{rupees(b.amount)}</td>
                    <td><Pill s={b.payment_status} /></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan="8" className="empty">No bookings yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
