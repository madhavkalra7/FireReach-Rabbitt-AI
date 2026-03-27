const SENIORITY_ORDER = {
  'cto': 1,
  'chief technology officer': 1,
  'ceo': 2,
  'chief executive officer': 2,
  'vp engineering': 3,
  'vp of engineering': 3,
  'head of engineering': 4,
  'head of people': 5,
  'director of engineering': 6,
  'cfo': 7,
  'chief financial officer': 7,
}

function getSeniorityRank(title) {
  if (!title) return 999
  const lower = title.toLowerCase()
  for (const [key, rank] of Object.entries(SENIORITY_ORDER)) {
    if (lower.includes(key)) return rank
  }
  return 999
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return '***@***.com'
  const [local, domain] = email.split('@')
  if (local.length === 0) return `***@${domain}`
  return `${local[0]}***@${domain}`
}

export default function ContactCard({ contacts }) {
  if (!contacts || contacts.length === 0) return null

  // Sort by seniority
  const sorted = [...contacts].sort((a, b) => 
    getSeniorityRank(a.title) - getSeniorityRank(b.title)
  )

  const primaryIndex = 0 // Highest seniority after sort

  return (
    <div style={{
      background: '#0F172A',
      border: '1px solid rgba(0, 255, 136, 0.2)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
    }}>
      {/* Header */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        color: '#00FF88',
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '16px' }}>🎯</span>
        CONTACT INTELLIGENCE // HUNTER.IO
      </div>

      {/* Contacts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sorted.map((contact, i) => {
          const isPrimary = i === primaryIndex
          return (
            <div key={i} style={{
              background: isPrimary ? 'rgba(0, 255, 136, 0.06)' : 'rgba(30, 41, 59, 0.6)',
              border: isPrimary 
                ? '1px solid rgba(0, 255, 136, 0.3)' 
                : '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '8px',
              padding: '14px 16px',
              position: 'relative',
            }}>
              {isPrimary && (
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '10px',
                  background: 'linear-gradient(135deg, #00FF88, #00CC6A)',
                  color: '#000',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}>
                  PRIMARY TARGET
                </span>
              )}
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '14px',
                color: '#E2E8F0',
                fontWeight: 600,
                marginBottom: '4px',
              }}>
                {contact.name || 'Unknown'}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                color: '#94A3B8',
                marginBottom: '4px',
              }}>
                {contact.title || 'No title'}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                color: '#64748B',
              }}>
                📧 {maskEmail(contact.email)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
