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
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <h2 className="gradient-text">TEAM BUILDER</h2>
        <span className="badge">v0.3-MAS</span>
      </div>
      
      <section className="section">
        <h3>Local Staff</h3>
        <div className="staff-list">
          {localStaff.map(staff => {
            const workload = getWorkload(staff.id);
            return (
              <div 
                key={staff.id} 
                className={`role-card ${staff.status === 'Working' ? 'active' : ''} ${staff.roleLevel?.toLowerCase() || ''}`}
                onClick={() => setSelectedId(staff.id)}
                style={{cursor: 'pointer'}}
              >
                <div className="role-main">
                  <span className="icon">{staff.icon}</span>
                  <div className="info">
                    <p className="name">{staff.name}</p>
                    <div className="meta-info">
                      <span className="level-tag">{staff.roleLevel || 'Staff'}</span>
                      <span className="status">{staff.status}</span>
                    </div>
                  </div>
                </div>
                {workload > 0 && (
                  <div className="workload-badge" title="Jobs in queue">
                    {workload}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <button className="recruit-btn glow-shadow" onClick={() => setMarketOpen(true)}>
        <Plus size={16} style={{marginRight: 8}}/> Recruit Expert
      </button>
    </aside>
  );
}
