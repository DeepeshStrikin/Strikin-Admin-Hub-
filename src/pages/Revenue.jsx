import { useEffect, useState } from 'react'
import { api } from '../api'

const rupees = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

export default function Revenue() {
  const [d, setD] = useState(null)
  useEffect(() => {
    api.revenue().then(setD).catch(() => setD({ by_activity: [], invoices: [], total: 0, paid: 0 }))
  }, [])

  if (!d) return <div><h1 className="page">Revenue</h1><div className="page-card"><div className="empty">Loading…</div></div></div>

  return (
    <div>
      <h1 className="page">Revenue</h1>

      <div className="page-card" style={{ marginBottom: 20 }}>
        <b>Attraction wise revenue</b>
        <div style={{ fontSize: 28, fontWeight: 800, margin: '10px 0 16px' }}>
          {rupees(d.total)}
          <span className="muted" style={{ fontSize: 14, fontWeight: 500 }}> · {rupees(d.paid)} collected</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Activity</th><th className="right">Revenue</th></tr></thead>
            <tbody>
              {d.by_activity.map((r) => (
                <tr key={r.activity}><td>{r.activity}</td><td className="right">{rupees(r.revenue)}</td></tr>
              ))}
              {d.by_activity.length === 0 && <tr><td colSpan="2" className="empty">No revenue yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="page-card">
        <b>Invoices</b>
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table>
            <thead><tr><th>Invoice ID</th><th>Customer</th><th>Booking ID</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {d.invoices.map((i) => (
                <tr key={i.invoice_id}>
                  <td><b>#{i.invoice_id}</b></td>
                  <td>{i.customer}</td>
                  <td className="muted">{i.booking_id}</td>
                  <td>{i.date}</td>
                  <td>{rupees(i.total)}</td>
                  <td style={{ color: i.status === 'paid' ? '#16a34a' : '#e5484d', fontWeight: 600 }}>{i.status}</td>
                </tr>
              ))}
              {d.invoices.length === 0 && <tr><td colSpan="6" className="empty">No invoices yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
