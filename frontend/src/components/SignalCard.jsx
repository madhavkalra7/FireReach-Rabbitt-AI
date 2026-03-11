export default function SignalCard({ icon, title, content, items }) {
  return (
    <div className="signal-card">
      <div className="signal-header">
        <span className="signal-icon">{icon}</span>
        <span className="signal-title">{title}</span>
      </div>
      <div className="signal-content">
        {items ? (
          <ul className="signal-list">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>{content || 'No data available'}</p>
        )}
      </div>
    </div>
  )
}
