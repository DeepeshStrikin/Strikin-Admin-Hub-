export default function Placeholder({ title }) {
  return (
    <div>
      <h1 className="page">{title}</h1>
      <div className="page-card">
        <div className="empty">
          <p><b>{title}</b> is part of the control centre and will be built in the next stage.</p>
          <p className="muted">Stage 1 (live now): Attractions — manage activities, bays, prices & photos.</p>
        </div>
      </div>
    </div>
  )
}
