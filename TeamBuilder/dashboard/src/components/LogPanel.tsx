import { useStore } from '../store';

export default function LogPanel() {
  const logs = useStore(state => state.logs);

  return (
    <section className="artifact-panel">
      <h3 className="gradient-text" style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '0.05em' }}>SYSTEM ARCHIVE</h3>
      <div className="log-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {logs.slice().reverse().map(log => (
          <div key={log.id} className="log-item" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
            <span className="time" style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>[{log.time}]</span>
            <div style={{ marginTop: '4px' }}>
              <span className="actor" style={{ color: 'var(--primary)', fontWeight: '700', marginRight: '6px' }}>{log.actor}</span>
              <span className="message" style={{ color: 'var(--text-muted)' }}>{log.message}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
