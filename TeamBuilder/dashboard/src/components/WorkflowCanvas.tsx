import { useStore } from '../store';
import { CheckCircle2, Circle, Loader2, Plus, Trash2, Save } from 'lucide-react';
import { useState } from 'react';

export default function WorkflowCanvas() {
  const jobs = useStore(state => state.jobs);
  const localStaff = useStore(state => state.localStaff);
  const assignRoleToJob = useStore(state => state.assignRoleToJob);
  const addJob = useStore(state => state.addJob);
  const deleteJob = useStore(state => state.deleteJob);
  const saveAsTemplate = useStore(state => state.saveAsTemplate);
  const workflowName = useStore(state => state.workflowName);
  const currentStep = useStore(state => state.currentStep);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addJob({
      title: newTitle,
      description: newDesc,
      status: 'Pending'
    });
    setNewTitle('');
    setNewDesc('');
    setIsAdding(false);
  };

  return (
    <div className="workflow-canvas mt-8">
      <div className="canvas-header">
        <h3>Workflow Canvas: {workflowName}</h3>
        <span className="job-count">{jobs.length} Steps Total</span>
      </div>

      <div className="jobs-list">
        {jobs.map((job, index) => {
          const stepNumber = index + 1;
          let computedStatus = 'Pending';
          if (stepNumber < currentStep) computedStatus = 'Completed';
          else if (stepNumber === currentStep) computedStatus = 'Running';

          return (
            <div key={job.id} className={`job-node ${computedStatus.toLowerCase()} ${computedStatus === 'Running' ? 'active-step' : ''}`}>
              <div className="node-number">{stepNumber}</div>
              
              <div className="node-content">
                <div className="node-header">
                  <h4>{job.title}</h4>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteJob(job.id)}
                    title="Delete step"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="node-desc">{job.description}</p>
                
                <div className="node-assignment">
                  <div className="assignment-label">Assignee</div>
                  <select 
                    className="assign-select"
                    value={job.targetRoleId || ''}
                    onChange={(e) => assignRoleToJob(job.id, e.target.value)}
                  >
                    <option value="">Select an expert...</option>
                    {localStaff.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.icon} {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="node-status">
                {computedStatus === 'Completed' ? (
                  <CheckCircle2 size={24} color="var(--success)" />
                ) : computedStatus === 'Running' ? (
                  <Loader2 size={24} className="animate-spin" color="var(--primary)" />
                ) : (
                  <Circle size={24} color="var(--border)" />
                )}
                <span className="status-text">{computedStatus}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="canvas-footer mt-8 flex gap-4">
        {!isAdding ? (
          <>
            <button className="secondary-btn flex-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => setIsAdding(true)}>
              <Plus size={20} />
              <span>Add New Step</span>
            </button>
            <button className="secondary-btn flex-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => {
              const name = prompt("Enter template name:", workflowName);
              if (name) saveAsTemplate(name);
            }}>
              <Save size={20} />
              <span>Save as Template</span>
            </button>
          </>
        ) : (
          <div className="add-step-form glass-panel mt-4 w-full">
            <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>Forge New Objective</h4>
            <input 
              type="text" 
              placeholder="Objective Title..." 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '12px', background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
              autoFocus
            />
            <textarea 
              placeholder="Detailed description of the mission step..." 
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="form-input mt-2"
              style={{ width: '100%', padding: '12px', background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', minHeight: '80px' }}
            />
            <div className="form-actions mt-4" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="secondary-btn" onClick={() => setIsAdding(false)}>Cancel</button>
              <button className="primary-btn" onClick={handleAdd}>Confirm Step</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
