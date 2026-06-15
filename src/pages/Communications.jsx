import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Communications() {
  const [rows, setRows] = useState(null)
  useEffect(() => { api.communications().then(setRows).catch(() => setRows([])) }, [])

  return (
    <div>
      <h1 className="page">Communications</h1>
      <p className="muted" style={{ marginTop: -10, marginBottom: 18 }}>
        Messages sent to customers (booking & payment confirmations via WhatsApp / email / in-app).
      </p>
      <div className="page-card">
        {!rows ? <div className="empty">Loading…</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Recipient</th><th>Channel</th><th>Type</th><th>Message</th><th>Sent</th></tr></thead>
              <tbody>
                {rows.map((n) => (
                  <tr key={n.id}>
                    <td>{n.recipient}</td>
                    <td><span className="tag std">{n.channel}</span></td>
                    <td>{n.type}</td>
                    <td className="muted" style={{ maxWidth: 360 }}>{n.body}</td>
                    <td className="muted">{(n.created_at || '').slice(0, 16).replace('T', ' ')}</td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan="5" className="empty">No messages yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
