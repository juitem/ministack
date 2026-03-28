import { useState } from 'react';
import { useStore, type Staff } from '../store';
import { X, Save, AlertCircle } from 'lucide-react';

export default function RoleCreatorModal() {
  const isOpen = useStore(state => state.isCreatorOpen);
  const setOpen = useStore(state => state.setCreatorOpen);
  const addGlobalStaff = useStore(state => state.addGlobalStaff);
  const addLog = useStore(state => state.addLog);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    icon: '👤',
    backstory: ''
  });

  const icons = ['👤', '🔧', '📊', '🛡️', '💻', '📋', '🐛', '🎨', '🚀', '🧠'];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.specialty) return;

    const newRole: Staff = {
      id: `g-${Date.now()}`,
      name: formData.name,
      specialty: formData.specialty,
      status: 'Idle',
      icon: formData.icon,
      allowedTools: []
    };

    addGlobalStaff(newRole);
    addLog({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: 'System',
      message: `Registered new role '${formData.name}' to global market`
    });

    setOpen(false);
    // Reset form
    setFormData({ name: '', specialty: '', icon: '👤', backstory: '' });
  };

  return (
    <div className="modal-overlay" style={{zIndex: 110}}>
      <div className="modal-content glass-panel glow-shadow creator-modal">
        <div className="modal-header">
          <div>
            <h2>Create New Expert</h2>
            <p className="subtitle">Onboard a specialized persona to the Global Market</p>
          </div>
          <button className="icon-btn" onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="creator-form">
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Role Name</label>
              <input 
                type="text" 
                placeholder="e.g. engineer/kernel_v3" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Icon</label>
              <div className="icon-selector">
                {icons.map(icon => (
                  <button 
                    key={icon} 
                    type="button"
                    className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, icon})}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Specialty Category</label>
            <input 
              type="text" 
              placeholder="e.g. kernel, frontend, security..." 
              value={formData.specialty}
              onChange={e => setFormData({...formData, specialty: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Backstory / Instructions (Visionary Goal)</label>
            <textarea 
              rows={4}
              placeholder="Define who this expert is and what drives their excellence..." 
              value={formData.backstory}
              onChange={e => setFormData({...formData, backstory: e.target.value})}
            />
          </div>

          <div className="form-footer">
            <div className="tip">
              <AlertCircle size={14} />
              <span>Created roles are stored globally in `roles/`</span>
            </div>
            <button type="submit" className="primary-btn">
              <Save size={18} style={{marginRight: 8}} />
              Register to Market
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
