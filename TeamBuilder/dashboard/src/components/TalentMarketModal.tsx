import { useStore, type Staff } from '../store';
import { X, UserPlus, Search } from 'lucide-react';

export default function TalentMarketModal() {
  const isOpen = useStore(state => state.isMarketOpen);
  const setOpen = useStore(state => state.setMarketOpen);
  const setCreatorOpen = useStore(state => state.setCreatorOpen);
  const globalStaff = useStore(state => state.globalStaff);
  const localStaff = useStore(state => state.localStaff);
  const addStaff = useStore(state => state.addStaff);
  const addLog = useStore(state => state.addLog);

  if (!isOpen) return null;

  const handleRecruit = (staff: Staff) => {
    // Check if already recruited
    if (localStaff.some(s => s.name === staff.name)) {
      alert(`${staff.name} is already in the local team.`);
      return;
    }
    
    addStaff({
      ...staff,
      id: Date.now().toString(),
      status: 'Ready'
    });
    
    addLog({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: 'System',
      message: `Recruited ${staff.name} from global market`
    });
    
    setOpen(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel glow-shadow-lg">
        <header className="modal-header">
          <div className="header-text">
            <h2>Talent Market</h2>
            <p className="subtitle">Recruit global experts to your local team</p>
          </div>
          <div className="header-actions">
            <button className="secondary-btn small" onClick={() => setCreatorOpen(true)}>
              + Forge New Role
            </button>
            <button className="icon-btn-close" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </header>
        
        <div className="market-search">
          <Search size={18} className="icon-dim" />
          <input type="text" placeholder="Search by role or specialty..." className="form-input-minimal" />
        </div>

        <div className="market-grid">
          {globalStaff.map(staff => (
            <div key={staff.id} className="market-card glass-panel-compact">
              <div className="card-top">
                <span className="staff-icon-large">{staff.icon}</span>
                <span className="badge-px">{staff.specialty}</span>
              </div>
              <h3 className="staff-name">{staff.name}</h3>
              <p className="staff-desc">Standard persona for {staff.specialty} orchestration.</p>
              <button 
                className="primary-btn full-width"
                onClick={() => handleRecruit(staff)}
              >
                <UserPlus size={16} />
                <span>Recruit Expert</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
