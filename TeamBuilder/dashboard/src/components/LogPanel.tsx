import { useStore } from '../store';

export default function LogPanel() {
  const logs = useStore(state => state.logs);

  return (
    <section className="artifact-panel glass-panel">
      <h3>Artifact & Logs</h3>
      <div className="log-list">
        {logs.map(log => (
          <div key={log.id} className="log-item">
            <span className="time">{log.time}</span>
            <p><span className="actor">{log.actor}</span>: {log.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
