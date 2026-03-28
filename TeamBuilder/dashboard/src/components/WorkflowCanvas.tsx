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
            <div key={job.id} className={`job-node glass-panel ${computedStatus.toLowerCase()} ${computedStatus === 'Running' ? 'active-step glow-shadow' : ''}`}>
              <div className="node-number">{stepNumber}</div>
              
              <div className="node-content">
                <div className="node-header">
                  <h4>{job.title}</h4>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteJob(job.id)}
                    title="Delete step"
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
                  <CheckCircle2 color="var(--success)" />
                ) : computedStatus === 'Running' ? (
                  <Loader2 className="animate-spin" color="var(--primary)" />
                ) : (
                  <Circle color="#8b949e" />
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
            <button className="add-step-btn glass-panel flex-1" onClick={() => setIsAdding(true)}>
              <Plus size={20} />
              <span>Add New Step</span>
            </button>
            <button className="save-template-btn glass-panel flex-1" onClick={() => {
              const name = prompt("Enter template name:", workflowName);
              if (name) saveAsTemplate(name);
            }}>
              <Save size={20} />
              <span>Save as Template</span>
            </button>
          </>
        ) : (
          <div className="add-step-form glass-panel mt-4 w-full">
            <input 
              type="text" 
              placeholder="Step Title..." 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="form-input"
              autoFocus
            />
            <textarea 
              placeholder="Description..." 
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="form-input mt-2"
            />
            <div className="form-actions mt-3">
              <button className="cancel-btn" onClick={() => setIsAdding(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleAdd}>Add Step</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
