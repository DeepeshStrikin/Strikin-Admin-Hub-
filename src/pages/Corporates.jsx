import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Corporates() {
  const [d, setD] = useState(null)
  useEffect(() => { api.corporates().then(setD).catch(() => setD({ companies: [], inquiries: [] })) }, [])
  if (!d) return <div><h1 className="page">Corporates</h1><div className="page-card"><div className="empty">Loading…</div></div></div>

  return (
    <div>
      <h1 className="page">Corporates</h1>

      <div className="page-card" style={{ marginBottom: 20 }}>
        <b>Corporate accounts</b>
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table>
            <thead><tr><th>Company</th><th>PAN</th><th>GST</th><th>Size</th><th>Status</th></tr></thead>
            <tbody>
              {d.companies.map((c) => (
                <tr key={c.id}><td><b>{c.name}</b></td><td>{c.pan || '—'}</td><td>{c.gst || '—'}</td><td>{c.size}</td>
                  <td style={{ fontWeight: 600 }}>{c.status}</td></tr>
              ))}
              {d.companies.length === 0 && <tr><td colSpan="5" className="empty">No corporate accounts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="page-card">
        <b>Enquiries</b>
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table>
            <thead><tr><th>Company</th><th>Contact</th><th>Email</th><th>Phone</th><th>Status</th><th>Received</th></tr></thead>
            <tbody>
              {d.inquiries.map((i) => (
                <tr key={i.id}><td>{i.company}</td><td>{i.contact || '—'}</td><td>{i.email}</td><td>{i.phone || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{i.status}</td><td className="muted">{(i.created_at || '').slice(0, 10)}</td></tr>
              ))}
              {d.inquiries.length === 0 && <tr><td colSpan="6" className="empty">No enquiries yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
