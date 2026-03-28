import { useStore } from '../store';
import { LayoutDashboard, Users, Zap } from 'lucide-react';

export default function TopNav() {
  const currentView = useStore(state => state.currentView);
  const setView = useStore(state => state.setView);
  const missionText = useStore(state => state.mission);

  return (
    <nav className="top-nav-minimal">
      <div className="nav-left">
        <div className="nav-item-indicator">
          <Zap size={14} className="icon-main" />
          <span className="current-mission-label">MISSION: {missionText}</span>
        </div>
      </div>

      <div className="nav-center-minimal">
        <button 
          className={`nav-tab-minimal ${currentView === 'mission' ? 'active' : ''}`}
          onClick={() => setView('mission')}
        >
          <LayoutDashboard size={16} />
          <span>MISSION CONTROL</span>
        </button>
        <button 
          className={`nav-tab-minimal ${currentView === 'personnel' ? 'active' : ''}`}
          onClick={() => setView('personnel')}
        >
          <Users size={16} />
          <span>PERSONNEL AGENCY</span>
        </button>
      </div>

      <div className="nav-right">
        <div className="system-status-minimal">
          <span className="status-dot ready"></span>
          <span>SYSTEM ONLINE</span>
        </div>
      </div>
    </nav>
  );
}
