import { useEffect, useState } from 'react'
import { api } from '../api'

const blank = { code: '', kind: 'percent', value: '', description: '', active: true }

export default function Discounts() {
  const [items, setItems] = useState([])
  const [drawer, setDrawer] = useState(null)
  const [toast, setToast] = useState('')
  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2000) }
  const load = async () => setItems(await api.discounts())
  useEffect(() => { load() }, [])

  async function save(d) {
    const p = { ...d, value: Number(d.value) }
    try {
      if (drawer.mode === 'add') await api.createDiscount(p)
      else await api.updateDiscount(drawer.data.id, p)
      setDrawer(null); flash('Saved'); load()
    } catch (e) { alert(e.message) }
  }
  async function del(it) {
    if (!confirm(`Delete "${it.code}"?`)) return
    try { await api.deleteDiscount(it.id); flash('Deleted'); load() } catch (e) { alert(e.message) }
  }

  return (
    <div>
      <div className="row-between">
        <h1 className="page" style={{ margin: 0 }}>Discounts</h1>
        <button className="btn primary" onClick={() => setDrawer({ mode: 'add', data: blank })}>+ Create discount</button>
      </div>
      <div className="table-wrap" style={{ marginTop: 18 }}>
        <table>
          <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Description</th><th>Status</th><th className="right">Actions</th></tr></thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id}>
                <td><b>{d.code}</b></td>
                <td>{d.kind === 'percent' ? 'Percent' : 'Flat'}</td>
                <td>{d.kind === 'percent' ? `${d.value}%` : `₹${d.value}`}</td>
                <td className="muted">{d.description}</td>
                <td style={{ color: d.active ? 'var(--green)' : 'var(--faint)', fontWeight: 600 }}>{d.active ? 'Active' : 'Off'}</td>
                <td className="right">
                  <button className="btn sm" onClick={() => setDrawer({ mode: 'edit', data: d })}>Edit</button>{' '}
                  <button className="btn sm danger" onClick={() => del(d)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="empty">No discounts yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {drawer && <DiscountDrawer drawer={drawer} onClose={() => setDrawer(null)} onSave={save} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function DiscountDrawer({ drawer, onClose, onSave }) {
  const [f, setF] = useState(drawer.data)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <form className="drawer" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(f) }}>
        <h2>{drawer.mode === 'add' ? 'Create discount' : 'Edit discount'}<button type="button" className="x" onClick={onClose}>×</button></h2>
        <div style={{ flex: 1 }}>
          <div className="field"><label>Code</label><input value={f.code} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="WELCOME10" required /></div>
          <div className="field row">
            <div style={{ flex: 1 }}><label>Type</label>
              <select value={f.kind} onChange={(e) => set('kind', e.target.value)}><option value="percent">Percent %</option><option value="flat">Flat ₹</option></select>
            </div>
            <div style={{ flex: 1 }}><label>Value</label><input type="number" min="0" value={f.value} onChange={(e) => set('value', e.target.value)} required /></div>
          </div>
          <div className="field"><label>Description</label><input value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
          <div className="field"><label><input type="checkbox" checked={f.active} onChange={(e) => set('active', e.target.checked)} /> &nbsp;Active</label></div>
        </div>
        <button className="btn primary" style={{ width: '100%', marginTop: 12 }}>Save</button>
      </form>
    </div>
  )
}
