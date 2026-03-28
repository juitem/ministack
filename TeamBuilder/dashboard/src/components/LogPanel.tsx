import { useStore } from '../store';

export default function LogPanel() {
  const logs = useStore(state => state.logs);

  return (
    <section className="log-panel">
      <h3 className="section-label">SYSTEM ARCHIVE</h3>
      <div className="log-list">
        {logs.slice().reverse().map(log => (
          <div key={log.id} className="log-item">
            <span className="log-time">[{log.time}]</span>
            <div className="log-content">
              <span className="log-actor">{log.actor}</span>
              <span className="log-message">{log.message}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
