export default function ResearchBrief({ company, brief }) {
  const paragraphs = (brief || '').split('\n\n').filter(Boolean)

  const highlight = (text) =>
    text.replace(
      /(\$[\d,.]+[BMK]?|\d+%|\d+\+?\s*(engineers?|employees?|people|positions?))/gi,
      '<span class="highlight">$1</span>'
    )

  return (
    <div className="brief-card">
      <div className="brief-header">
        <span className="brief-badge">Account Brief //</span>
        <span className="brief-company">{(company || 'Company').toUpperCase()}</span>
      </div>
      <div className="brief-body">
        <div className="brief-text">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: highlight(p) }} />
            ))
          ) : (
            <p>No account brief generated.</p>
          )}
        </div>
      </div>
    </div>
  )
}
