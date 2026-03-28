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
      <div className="sidebar-header" style={{ marginBottom: '32px' }}>
        <h2 className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: '800' }}>TEAMBUILDER</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
          <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>OPERATIONAL</span>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '700' }}>v0.3-MAS</span>
        </div>
      </div>
      
      <section className="section">
        <h3 style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: '20px' }}>INTERNAL ASSETS</h3>
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
