import { useEffect, useState } from 'react'
import { api, imgUrl } from '../api'
import ImageUpload from '../components/ImageUpload.jsx'

const rupees = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
const CATS = ['Burgers', 'Beverages', 'Desserts', 'Salads', 'Mains', 'Sides']
const blank = { name: '', category: 'Burgers', price: '', description: '', image: '' }

export default function Food() {
  const [items, setItems] = useState([])
  const [drawer, setDrawer] = useState(null)
  const [toast, setToast] = useState('')
  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2200) }
  const load = async () => setItems(await api.food())
  useEffect(() => { load() }, [])

  async function save(d) {
    const payload = { ...d, price: Number(d.price) }
    try {
      if (drawer.mode === 'add') await api.createFood(payload)
      else await api.updateFood(drawer.data.id, payload)
      setDrawer(null); flash('Saved'); load()
    } catch (e) { alert(e.message) }
  }
  async function del(it) {
    if (!confirm(`Delete "${it.name}"?`)) return
    try { await api.deleteFood(it.id); flash('Deleted'); load() } catch (e) { alert(e.message) }
  }

  return (
    <div>
      <div className="row-between">
        <h1 className="page" style={{ margin: 0 }}>Food &amp; Beverages</h1>
        <button className="btn primary" onClick={() => setDrawer({ mode: 'add', data: blank })}>+ Add item</button>
      </div>
      <p className="muted" style={{ marginTop: 6 }}>Menu shown in the app's “Grab a Bite”. Changes appear instantly.</p>

      <div className="table-wrap" style={{ marginTop: 18 }}>
        <table>
          <thead><tr><th>Photo</th><th>Name</th><th>Category</th><th>Price</th><th className="right">Actions</th></tr></thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td><img src={imgUrl(it.image)} alt="" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6, background: '#eef0f3' }}
                         onError={(e) => { e.target.style.visibility = 'hidden' }} /></td>
                <td><b>{it.name}</b><div className="muted" style={{ fontSize: 12 }}>{it.description}</div></td>
                <td>{it.category}</td>
                <td>{rupees(it.price)}</td>
                <td className="right">
                  <button className="btn sm" onClick={() => setDrawer({ mode: 'edit', data: it })}>Edit</button>{' '}
                  <button className="btn sm danger" onClick={() => del(it)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="5" className="empty">No food items yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {drawer && <FoodDrawer drawer={drawer} onClose={() => setDrawer(null)} onSave={save} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function FoodDrawer({ drawer, onClose, onSave }) {
  const [f, setF] = useState(drawer.data)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <form className="drawer" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(f) }}>
        <h2>{drawer.mode === 'add' ? 'Add item' : 'Edit item'}<button type="button" className="x" onClick={onClose}>×</button></h2>
        <div style={{ flex: 1 }}>
          <div className="field"><label>Name</label><input value={f.name} onChange={(e) => set('name', e.target.value)} required /></div>
          <div className="field row">
            <div style={{ flex: 1 }}><label>Category</label>
              <select value={f.category} onChange={(e) => set('category', e.target.value)}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
            </div>
            <div style={{ flex: 1 }}><label>Price (₹)</label>
              <input type="number" min="0" value={f.price} onChange={(e) => set('price', e.target.value)} required />
            </div>
          </div>
          <div className="field"><label>Description</label><textarea rows="2" value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
          <div className="field"><label>Photo</label><ImageUpload value={f.image} onChange={(v) => set('image', v)} /></div>
        </div>
        <button className="btn primary" style={{ width: '100%', marginTop: 12 }}>Save</button>
      </form>
    </div>
  )
}
