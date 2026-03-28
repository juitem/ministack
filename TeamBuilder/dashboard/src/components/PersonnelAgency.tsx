import { useStore } from '../store';
import { UserPlus, Settings, Activity, ShieldCheck, GraduationCap } from 'lucide-react';

export default function PersonnelAgency() {
  const localStaff = useStore(state => state.localStaff);
  const setSelectedStaffId = useStore(state => state.setSelectedStaffId);
  const setMarketOpen = useStore(state => state.setMarketOpen);

  return (
    <div className="personnel-agency">
      <header className="agency-header">
        <div className="header-text">
          <h2 className="gradient-text">Personnel Agency</h2>
          <p className="subtitle">Recruit, train, and manage your elite AI experts.</p>
        </div>
        <button className="primary-btn recruit-btn-top" onClick={() => setMarketOpen(true)}>
          <UserPlus size={18} />
          <span>Recruit New Expert</span>
        </button>
      </header>

      <div className="agency-stats-grid">
        <div className="stat-card glass-panel">
          <Activity size={24} className="icon-primary" />
          <div className="stat-info">
            <span className="stat-label">Total Staff</span>
            <span className="stat-value">{localStaff.length}</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <ShieldCheck size={24} className="icon-success" />
          <div className="stat-info">
            <span className="stat-label">Active Missions</span>
            <span className="stat-value">{localStaff.filter(s => s.status === 'Working').length}</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <GraduationCap size={24} className="icon-accent" />
          <div className="stat-info">
            <span className="stat-label">Expert Levels</span>
            <span className="stat-value">Orchestrator ({localStaff.filter(s => s.roleLevel === 'Orchestrator').length})</span>
          </div>
        </div>
      </div>

      <div className="talent-roster">
        <h3 className="section-label">TALENT ROSTER</h3>
        <div className="roster-grid">
          {localStaff.map(staff => (
            <div key={staff.id} className="talent-card glass-panel" onClick={() => setSelectedStaffId(staff.id)}>
              <div className="card-header">
                <span className="staff-icon-large">{staff.icon}</span>
                <span className={`level-badge-agency ${staff.roleLevel?.toLowerCase() || 'staff'}`}>
                  {staff.roleLevel || 'Staff'}
                </span>
              </div>
              <div className="card-body">
                <h4>{staff.name}</h4>
                <p className="specialty-tag">{staff.specialty}</p>
                <div className="staff-status">
                  <span className={`status-dot ${staff.status.toLowerCase()}`}></span>
                  <span className="status-text">{staff.status}</span>
                </div>
              </div>
              <div className="card-footer">
                <button className="icon-btn-small" title="Training (TBD)"><GraduationCap size={16} /></button>
                <button className="icon-btn-small" title="Settings"><Settings size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
