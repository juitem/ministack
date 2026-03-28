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
    <div className="workflow-canvas">
      <div className="canvas-header">
        <h3 className="section-label">OBJECTIVE PIPELINE</h3>
        <span className="job-count-badge">{jobs.length} STAGES</span>
      </div>

      <div className="jobs-list">
        {jobs.map((job, index) => {
          const stepNumber = index + 1;
          let computedStatus = 'Pending';
          if (stepNumber < currentStep) computedStatus = 'Completed';
          else if (stepNumber === currentStep) computedStatus = 'Running';

          return (
            <div key={job.id} className={`job-node ${computedStatus.toLowerCase()} ${computedStatus === 'Running' ? 'active-step' : ''}`}>
              <div className="node-number">{String(stepNumber).padStart(2, '0')}</div>
              
              <div className="node-content">
                <div className="node-header">
                  <h4>{job.title}</h4>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteJob(job.id)}
                    title="Remove objective"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="node-desc">{job.description}</p>
                
                <div className="node-assignment">
                  <span className="label">ASSIGNEE</span>
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

              <div className="node-status-icon">
                {computedStatus === 'Completed' ? (
                  <CheckCircle2 size={24} className="icon-success" />
                ) : computedStatus === 'Running' ? (
                  <Loader2 size={24} className="animate-spin icon-primary" />
                ) : (
                  <Circle size={24} className="icon-dim" />
                )}
                <span className="status-text">{computedStatus}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="canvas-footer">
        {!isAdding ? (
          <div className="footer-actions">
            <button className="secondary-btn" onClick={() => setIsAdding(true)}>
              <Plus size={20} />
              <span>Extend Pipeline</span>
            </button>
            <button className="secondary-btn" onClick={() => {
              const name = prompt("Enter template name:", workflowName);
              if (name) saveAsTemplate(name);
            }}>
              <Save size={20} />
              <span>Export Template</span>
            </button>
          </div>
        ) : (
          <div className="add-step-form glass-panel">
            <h4 className="form-title">FORGE NEW OBJECTIVE</h4>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Objective Title..." 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="form-input"
                autoFocus
              />
              <textarea 
                placeholder="Define the mission success criteria..." 
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="form-input textarea"
              />
            </div>
            <div className="form-actions">
              <button className="secondary-btn small" onClick={() => setIsAdding(false)}>Cancel</button>
              <button className="primary-btn small" onClick={handleAdd}>Commence Step</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
