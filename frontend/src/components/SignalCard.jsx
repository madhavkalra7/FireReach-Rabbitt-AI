export default function SignalCard({ icon, title, content, items, confidence, isTopSignal }) {
  return (
    <div className={`signal-card ${isTopSignal ? 'signal-top' : ''}`}>
      <div className="signal-header">
        <span className="signal-icon">{icon}</span>
        <span className="signal-title">{title}</span>
        {isTopSignal && <span className="signal-badge">TOP</span>}
      </div>

      {content && <p className="signal-content">{content}</p>}

      {items && items.length > 0 && (
        <ul className="signal-list">
          {items.map((item, i) => (
            <li key={i} className="signal-item">{typeof item === 'string' ? item : JSON.stringify(item)}</li>
          ))}
        </ul>
      )}

      {confidence !== undefined && confidence !== null && (
        <div className="signal-confidence">
          <div className="conf-bar">
            <div className="conf-fill" style={{ width: `${(confidence * 100)}%` }} />
          </div>
          <span className="conf-value">{(confidence * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  )
}
