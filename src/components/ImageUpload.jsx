import { useState } from 'react'
import { api, imgUrl } from '../api'

// Upload an image file (stored on the backend) and return its URL via onChange.
export default function ImageUpload({ value, onChange }) {
  const [busy, setBusy] = useState(false)

  async function pick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const url = await api.uploadImage(file)
      onChange(url)
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      {value && (
        <img src={imgUrl(value)} alt="" onError={(e) => { e.target.style.display = 'none' }}
             style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, marginBottom: 8 }} />
      )}
      <label className="btn" style={{ display: 'inline-block' }}>
        {busy ? 'Uploading…' : value ? 'Change image' : 'Upload image'}
        <input type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />
      </label>
      {value && (
        <button type="button" className="btn sm danger" style={{ marginLeft: 8 }} onClick={() => onChange('')}>
          Remove
        </button>
      )}
    </div>
  )
}
