import { useStore } from '../store';
import MissionEditor from './MissionEditor';
import WorkflowCanvas from './WorkflowCanvas';
import PersonnelAgency from './PersonnelAgency';
import TopNav from './TopNav';
import { Rocket } from 'lucide-react';

export default function MainBoard() {
  const currentView = useStore(state => state.currentView);
  const workflowName = useStore(state => state.workflowName);
  const workflows = useStore(state => state.workflows);
  const setWorkflowName = useStore(state => state.setWorkflowName);
  const currentStep = useStore(state => state.currentStep);
  const totalSteps = useStore(state => state.totalSteps);
  const deployWorkflow = useStore(state => state.deployWorkflow);

  return (
    <main className="main-content">
      <TopNav />
      
      {currentView === 'mission' ? (
        <div className="content-container fade-in">
          <MissionEditor />
          
          <header className="main-header">
            <div className="header-left">
              <div className="workflow-title-group">
                <span className="label">Current Workflow</span>
                <div className="title-select-wrapper">
                  <select 
                    className="workflow-select" 
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                  >
                    {workflows.map(wf => (
                      <option key={wf} value={wf}>{wf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="header-right">
              <div className="status-badge">
                <span className="dot animate-pulse"></span>
                Step {currentStep} of {totalSteps}
              </div>
              <div className="header-actions">
                <button className="secondary-btn">View All Steps</button>
                <button className="primary-btn deploy-btn glow-shadow" onClick={deployWorkflow}>
                  <Rocket size={18} /> Deploy Team
                </button>
              </div>
            </div>
          </header>

          <WorkflowCanvas />
        </div>
      ) : (
        <div className="content-container">
          <PersonnelAgency />
        </div>
      )}
    </main>
  );
}
