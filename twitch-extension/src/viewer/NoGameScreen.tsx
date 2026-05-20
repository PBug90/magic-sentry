export function NoGameScreen() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '32px 24px',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '2px solid #444',
          borderTopColor: '#888',
          animation: 'no-game-spin 1.4s linear infinite',
        }}
      />
      <style>{`@keyframes no-game-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#efeff1', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
          No game in progress
        </div>
        <div style={{ color: '#808080', fontSize: 11 }}>
          Will update automatically when a game starts
        </div>
      </div>
    </div>
  )
}
