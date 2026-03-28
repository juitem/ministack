import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { X, Save, Shield, BrainCircuit, History } from 'lucide-react';

export default function RoleDetailModal() {
  const selectedId = useStore(state => state.selectedStaffId);
  const setSelectedId = useStore(state => state.setSelectedStaffId);
  const staff = useStore(state => state.localStaff.find(s => s.id === selectedId));
  const updateStaff = useStore(state => state.updateStaff);
  const addLog = useStore(state => state.addLog);

  const [formData, setFormData] = useState({
    name: '',
    backstory: '',
    instructions: '',
    allowedTools: [] as string[]
  });
  
  const [activeTab, setActiveTab] = useState<'evolution' | 'capabilities' | 'audit' | 'inbox'>('evolution');
  const [inboxJobs, setInboxJobs] = useState<any[]>([]);
  const [isInboxLoading, setIsInboxLoading] = useState(false);
  const [inboxView, setInboxView] = useState<'json' | 'md'>('json');

  const availableTools = [
    { id: 'shell', name: 'Terminal (Shell)', icon: '🐚' },
    { id: 'write', name: 'Write File', icon: '📝' },
    { id: 'read', name: 'Read File', icon: '📖' },
    { id: 'search', name: 'Web Search', icon: '🔍' },
    { id: 'vision', name: 'Visual Analysis', icon: '👁️' },
  ];

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name,
        backstory: staff.backstory || '',
        instructions: staff.instructions || '',
        allowedTools: staff.allowedTools || []
      });
      
      // Fetch inbox jobs when modal opens or staff changes
      fetchInbox();
    }
  }, [staff]);

  const fetchInbox = async () => {
    if (!selectedId) return;
    setIsInboxLoading(true);
    try {
      const res = await fetch(`/api/staff/${selectedId}/inbox`);
      if (res.ok) {
        const data = await res.json();
        setInboxJobs(data.jobs || []);
      }
    } catch (e) {
      console.error("Failed to fetch inbox:", e);
    } finally {
      setIsInboxLoading(false);
    }
  };

  if (!selectedId || !staff) return null;

  const toggleTool = (toolId: string) => {
    setFormData(prev => ({
      ...prev,
      allowedTools: prev.allowedTools.includes(toolId)
        ? prev.allowedTools.filter(t => t !== toolId)
        : [...prev.allowedTools, toolId]
    }));
  };

  const handleSave = () => {
    updateStaff(selectedId, {
      backstory: formData.backstory,
      instructions: formData.instructions,
      allowedTools: formData.allowedTools
    });
    
    addLog({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: 'User',
      message: `Updated persona narrative for ${staff.name}`
    });
    
    setSelectedId(null);
  };

  return (
    <div className="modal-overlay" style={{zIndex: 120}}>
      <div className="modal-content glass-panel glow-shadow detail-modal">
        <div className="modal-header">
          <div className="detail-title-group">
            <span className="icon-large">{staff.icon}</span>
            <div>
              <h2>{staff.name}</h2>
              <p className="subtitle">Persona Studio - Expert Evolution</p>
            </div>
          </div>
          <button className="icon-btn" onClick={() => setSelectedId(null)}>
            <X size={24} />
          </button>
        </div>

        <div className="detail-tabs">
          <div className={`tab ${activeTab === 'evolution' ? 'active' : ''}`} onClick={() => setActiveTab('evolution')}>Evolution</div>
          <div className={`tab ${activeTab === 'capabilities' ? 'active' : ''}`} onClick={() => setActiveTab('capabilities')}>Capabilities</div>
          <div className={`tab ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>Job Inbox</div>
          <div className={`tab ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>Audit Log</div>
        </div>

        <div className="detail-body">
          {activeTab === 'evolution' && (
            <>
              <section className="detail-section">
                <div className="section-header">
                  <BrainCircuit size={18} />
                  <h3>Narrative & Backstory (서사)</h3>
                </div>
                <p className="section-desc">에이전트의 정체성과 행동 양식을 결정짓는 핵심 서사를 부여합니다.</p>
                <textarea 
                  rows={4}
                  value={formData.backstory}
                  onChange={e => setFormData({...formData, backstory: e.target.value})}
                  placeholder="Tell a story about who this expert is..."
                />
              </section>

              <section className="detail-section">
                <div className="section-header">
                  <Shield size={18} />
                  <h3>Operational Directives (지시 사항)</h3>
                </div>
                <p className="section-desc">에이전트가 완수해야 할 구속력 있는 동작 지침입니다.</p>
                <textarea 
                  rows={3}
                  value={formData.instructions}
                  onChange={e => setFormData({...formData, instructions: e.target.value})}
                  placeholder="Strict instructions follow..."
                />
              </section>
            </>
          )}

          {activeTab === 'capabilities' && (
            <section className="detail-section">
              <div className="section-header">
                <Shield size={18} />
                <h3>Tool Permissions (권한 관리)</h3>
              </div>
              <p className="section-desc">에이전트에게 허용할 도구들을 선택합니다.</p>
              <div className="tools-grid">
                {availableTools.map(tool => (
                  <label key={tool.id} className={`tool-checkbox ${formData.allowedTools.includes(tool.id) ? 'checked' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={formData.allowedTools.includes(tool.id)}
                      onChange={() => toggleTool(tool.id)}
                    />
                    <span className="tool-icon">{tool.icon}</span>
                    <span className="tool-name">{tool.name}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'inbox' && (
            <section className="detail-section">
              <div className="section-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={18} />
                  <h3>Job Queueing Registry (대기열)</h3>
                </div>
                <div className="view-toggle">
                  <button className={`toggle-btn ${inboxView === 'json' ? 'active' : ''}`} onClick={() => setInboxView('json')}>JSON</button>
                  <button className={`toggle-btn ${inboxView === 'md' ? 'active' : ''}`} onClick={() => setInboxView('md')}>MD</button>
                </div>
              </div>
              <p className="section-desc">에이전트의 로컬 작업 큐에 쌓인 데이터 전문입니다.</p>
              <div className="code-view-container">
                {isInboxLoading ? (
                  <div className="loading-spinner">Loading queue data...</div>
                ) : inboxJobs.length === 0 ? (
                  <div className="empty-state">No jobs currently in queue.</div>
                ) : (
                  <pre className="code-block">
                    {inboxView === 'json' ? (
                      JSON.stringify(inboxJobs, null, 2)
                    ) : (
                      inboxJobs.map(job => (
                        `### JOB: ${job.title}\n- **ID**: ${job.id}\n- **STATUS**: ${job.status}\n- **DESC**: ${job.description}\n`
                      )).join('\n')
                    )}
                  </pre>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="modal-footer">
          <div className="evolution-badge">
            <History size={14} />
            <span>Growth: Level 2 Professional</span>
          </div>
          <div className="actions">
            <button className="secondary-btn" onClick={() => setSelectedId(null)}>Cancel</button>
            <button className="primary-btn" onClick={handleSave}>
              <Save size={18} style={{marginRight: 8}} />
              Save Persona
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
