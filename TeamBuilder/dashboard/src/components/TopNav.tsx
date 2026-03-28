import { useStore } from '../store';
import { LayoutDashboard, Users, Zap } from 'lucide-react';

export default function TopNav() {
  const currentView = useStore(state => state.currentView);
  const setView = useStore(state => state.setView);
  const missionText = useStore(state => state.mission);

  return (
    <nav className="top-nav glass-panel">
      <div className="nav-left">
        <div className="nav-item-indicator">
          <Zap size={16} className="icon-primary pulse" />
          <span className="current-mission-label">MISSION: {missionText}</span>
        </div>
      </div>

      <div className="nav-center">
        <button 
          className={`nav-tab ${currentView === 'mission' ? 'active' : ''}`}
          onClick={() => setView('mission')}
        >
          <LayoutDashboard size={18} />
          <span>Mission Control</span>
        </button>
        <button 
          className={`nav-tab ${currentView === 'personnel' ? 'active' : ''}`}
          onClick={() => setView('personnel')}
        >
          <Users size={18} />
          <span>Personnel Agency</span>
        </button>
      </div>

      <div className="nav-right">
        <div className="system-status-badge">
          <span className="status-dot ready"></span>
          <span>SYSTEM ONLINE</span>
        </div>
      </div>
    </nav>
  );
}
