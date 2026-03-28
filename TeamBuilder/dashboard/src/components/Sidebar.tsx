import { useStore } from '../store';
import { Plus } from 'lucide-react';

export default function Sidebar() {
  const localStaff = useStore(state => state.localStaff);
  const jobs = useStore(state => state.jobs);
  const setSelectedId = useStore(state => state.setSelectedStaffId);
  const setMarketOpen = useStore(state => state.setMarketOpen);

  const getWorkload = (staffId: string) => 
    jobs.filter(j => j.targetRoleId === staffId && j.status !== 'Completed').length;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="minimal-logo">TEAMBUILDER</h2>
        <div className="system-status-minimal">
          <span className="system-tag">OPERATIONAL</span>
          <span className="version-status">v0.4-MONO</span>
        </div>
      </div>
      
      <section className="internal-assets">
        <h3 className="section-label">INTERNAL ASSETS</h3>
        <div className="staff-list">
          {localStaff.map(staff => {
            const workload = getWorkload(staff.id);
            return (
              <div 
                key={staff.id} 
                className={`role-card-minimal ${staff.status === 'Working' ? 'active' : ''}`}
                onClick={() => setSelectedId(staff.id)}
              >
                <div className="role-main">
                  <span className="icon">{staff.icon}</span>
                  <div className="info">
                    <p className="name">{staff.name}</p>
                    <div className="meta-info">
                      <span className="level-tag-minimal">{staff.roleLevel || 'Staff'}</span>
                      <span className={`status-dot ${staff.status.toLowerCase()}`}></span>
                      <span className="status-text">{staff.status}</span>
                    </div>
                  </div>
                </div>
                {workload > 0 && (
                  <div className="workload-count">
                    {workload}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <button className="primary-btn-minimal" onClick={() => setMarketOpen(true)}>
        <Plus size={16} /> Recruit Expert
      </button>
    </aside>
  );
}
