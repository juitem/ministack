import { create } from 'zustand';

export interface Cluster {
  id: string;
  name: string;
  leadRoleId?: string;
}

export interface Staff {
  id: string;
  name: string;
  specialty: string;
  status: 'Ready' | 'Idle' | 'Working';
  icon: string;
  roleLevel?: 'Orchestrator' | 'Manager' | 'Contributor';
  clusterId?: string;
  backstory?: string;
  instructions?: string;
  allowedTools: string[];
}

export interface LogEntry {
  id: string;
  time: string;
  actor: 'System' | 'User' | string;
  message: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  sourceRoleId?: string;
  targetClusterId?: string;
  targetRoleId?: string;
  status: 'Pending' | 'Running' | 'Completed';
  stepOrder?: number;
}

interface TeamBuilderState {
  currentView: 'mission' | 'personnel';
  setView: (view: 'mission' | 'personnel') => void;
  
  mission: string;
  setMission: (mission: string) => void;
  
  localStaff: Staff[];
  clusters: Cluster[];
  addStaff: (staff: Staff) => void;
  updateStaff: (staffId: string, updates: Partial<Staff>) => void;
  selectedStaffId: string | null;
  setSelectedStaffId: (id: string | null) => void;
  
  isMarketOpen: boolean;
  setMarketOpen: (isOpen: boolean) => void;
  isCreatorOpen: boolean;
  setCreatorOpen: (isOpen: boolean) => void;
  globalStaff: Staff[];
  addGlobalStaff: (staff: Staff) => void;
  
  workflowName: string;
  setWorkflowName: (name: string) => void;
  workflows: string[];
  totalSteps: number;
  currentStep: number;
  jobs: Job[];
  addJob: (job: Omit<Job, 'id'>) => void;
  deleteJob: (jobId: string) => void;
  assignRoleToJob: (jobId: string, roleId: string) => void;
  deployWorkflow: () => void;
  
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id'>) => void;
  
  saveAsTemplate: (name: string) => Promise<void>;
  generateRecommendation: () => Promise<void>;
  
  initialize: () => Promise<void>;
  syncExecutionState: () => Promise<void>;
  syncProjectState: () => Promise<void>;
  
  // Tracking for sync stability
  isSyncing: boolean;
}

export const useStore = create<TeamBuilderState>((set) => ({
  isSyncing: false,
  currentView: 'mission',
  setView: (view) => set({ currentView: view }),
  
  mission: "TeamBuilder AI Orchestrator 개발", // Initial placeholder
  setMission: (mission) => set({ mission }),
  
  localStaff: [
    { id: '1', name: 'engineer/kernel_v2', specialty: 'kernel', status: 'Ready', icon: '🔧', roleLevel: 'Orchestrator', backstory: 'A veteran kernel engineer with a focus on stability and performance.', instructions: 'Always prioritize low-level safety and efficient memory management.', allowedTools: ['shell', 'write'] },
    { id: '2', name: 'researcher/market', specialty: 'market', status: 'Idle', icon: '📊', roleLevel: 'Manager', backstory: 'Expert in identifying emerging AI patterns and human needs.', instructions: 'Look for unmet needs in the developer experience space.', allowedTools: ['search', 'read'] }
  ],
  clusters: [],
  addStaff: (staff) => set((state) => ({ localStaff: [...state.localStaff, staff] })),
  updateStaff: (id, updates) => set((state) => ({
    localStaff: state.localStaff.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  selectedStaffId: null,
  setSelectedStaffId: (id) => set({ selectedStaffId: id }),
  
  isMarketOpen: false,
  setMarketOpen: (isOpen) => set({ isMarketOpen: isOpen }),
  isCreatorOpen: false,
  setCreatorOpen: (isOpen) => set({ isCreatorOpen: isOpen }),
  globalStaff: [
    { id: 'g1', name: 'reviewer/security', specialty: 'security', status: 'Idle', icon: '🛡️', roleLevel: 'Contributor', allowedTools: ['read'] },
    { id: 'g2', name: 'developer/frontend', specialty: 'frontend', status: 'Idle', icon: '💻', roleLevel: 'Contributor', allowedTools: ['shell', 'write'] },
    { id: 'g3', name: 'manager/product', specialty: 'product', status: 'Idle', icon: '📋', roleLevel: 'Manager', allowedTools: ['search'] },
    { id: 'g4', name: 'qa/tester', specialty: 'qa', status: 'Idle', icon: '🐛', roleLevel: 'Contributor', allowedTools: ['read', 'write'] },
  ],
  addGlobalStaff: (staff) => set((state) => ({ globalStaff: [staff, ...state.globalStaff] })),
  
  workflowName: "feature",
  setWorkflowName: (name) => set({ workflowName: name }),
  workflows: [],
  totalSteps: 5,
  currentStep: 1,
  jobs: [
    { id: 'j1', title: 'Requirement Analysis', description: 'Analyze product requirements and define core features.', status: 'Pending' },
    { id: 'j2', title: 'Architecture Design', description: 'Design system architecture and data flow.', status: 'Pending' },
    { id: 'j3', title: 'Core Implementation', description: 'Implement the core logic and kernel features.', status: 'Pending' },
    { id: 'j4', title: 'Security Audit', description: 'Review code for security vulnerabilities.', status: 'Pending' },
    { id: 'j5', title: 'Final Testing', description: 'Perform end-to-end testing and QA.', status: 'Pending' },
  ],
  addJob: (job) => set((state) => ({
    jobs: [...state.jobs, { ...job, id: `j${Date.now()}` }]
  })),
  deleteJob: (jobId) => set((state) => ({
    jobs: state.jobs.filter(j => j.id !== jobId)
  })),
  assignRoleToJob: (jobId, roleId) => set((state) => ({
    jobs: state.jobs.map(j => j.id === jobId ? { ...j, targetRoleId: roleId } : j)
  })),
  deployWorkflow: async () => {
    const { jobs, addLog, workflowName } = useStore.getState();
    const unassigned = jobs.some(j => !j.targetRoleId);
    
    if (unassigned) {
      addLog({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'System',
        message: 'Deployment failed: Some jobs have no assigned expert'
      });
      return;
    }

    addLog({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: 'System',
      message: `Deploying workflow '${workflowName}' to Engine...`
    });

    try {
      // Map current jobs to assignments { "1": "role_id", ... }
      const assignments: Record<string, string> = {};
      jobs.forEach((job, i) => {
        if (job.targetRoleId) assignments[String(i + 1)] = job.targetRoleId;
      });

      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: workflowName, assignments })
      });

      if (res.ok) {
        addLog({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actor: 'System',
          message: 'Engine deployment successful. Project synchronized.'
        });
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Unknown error');
      }
    } catch (e) {
      addLog({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'System',
        message: `Deployment Error: ${String(e)}`
      });
    }
  },
  
  logs: [
    { id: '1', time: '09:15', actor: 'System', message: "Loaded workflow 'feature'" },
    { id: '2', time: '09:16', actor: 'User', message: "Assigned 'kernel_v2' to Step 7" }
  ],
  addLog: (log) => set((state) => ({ 
    logs: [...state.logs, { ...log, id: Date.now().toString() }] 
  })),

  saveAsTemplate: async (name: string) => {
    const { jobs, addLog } = useStore.getState();
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, jobs })
      });
      if (res.ok) {
        const { fileName } = await res.json();
        addLog({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actor: 'System',
          message: `Saved workflow template as '${fileName}'`
        });
        // Refresh workflows list
        const workflowsRes = await fetch('/api/workflows');
        if (workflowsRes.ok) {
          const { workflows } = await workflowsRes.json();
          set({ workflows });
        }
      }
    } catch (e) {
      console.error("Failed to save template:", e);
    }
  },

  generateRecommendation: async () => {
    const { mission, addLog } = useStore.getState();
    addLog({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: 'System',
      message: 'Analyzing mission and generating AI recommendation...'
    });
    try {
      const res = await fetch('/api/recommend-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mission })
      });
      if (res.ok) {
        const { steps } = await res.json();
        const recommendedJobs = steps.map((s: any, i: number) => ({
          id: `rec-${Date.now()}-${i}`,
          title: s.title,
          description: s.description,
          status: 'Pending'
        }));
        set({ jobs: recommendedJobs });
        addLog({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actor: 'System',
          message: 'AI Recommendation applied to Workflow Canvas.'
        });
      }
    } catch (e) {
      console.error("Failed to generate recommendation:", e);
    }
  },

  initialize: async () => {
    set({ isSyncing: true });
    try {
      // 1. Load Execution State (e.g. current step, running workflow)
      const stateRes = await fetch('/api/state');
      if (stateRes.ok) {
        const data = await stateRes.json();
        if (data.step) set({ currentStep: data.step });
        if (data.workflow) set({ workflowName: data.workflow });
      }

      // 2. Load Project Planning State (e.g. jobs, assignments, localStaff)
      const projectRes = await fetch('/api/project');
      if (projectRes.ok) {
        const data = await projectRes.json();
        if (data.jobs) set({ jobs: data.jobs });
        if (data.localStaff) set({ localStaff: data.localStaff });
        if (data.clusters) set({ clusters: data.clusters });
        
        // If there are assignments in project.json, apply them to jobs (legacy support)
        if (data.assignments && data.jobs) {
          const updatedJobs = data.jobs.map((job: any, i: number) => ({
             ...job,
             targetRoleId: job.targetRoleId || data.assignments[String(i + 1)]
          }));
          set({ jobs: updatedJobs });
        }
      }

      const missionRes = await fetch('/api/mission');
      if (missionRes.ok) {
        const { content } = await missionRes.json();
        if (content) set({ mission: content });
      }

      const rolesRes = await fetch('/api/roles');
      if (rolesRes.ok) {
        const { roles } = await rolesRes.json();
        const globalStaff = roles.map((r: string, i: number) => {
          const name = r.replace('.md', '');
          let icon = '👤';
          if (name.includes('engineer')) icon = '🔧';
          else if (name.includes('researcher')) icon = '📊';
          else if (name.includes('reviewer')) icon = '🛡️';
          else if (name.includes('product')) icon = '📋';
          else if (name.includes('qa')) icon = '🐛';
          else if (name.includes('architect')) icon = '🏗️';
          
          return {
            id: `g${i}`,
            name,
            specialty: name.split('/')[0],
            status: 'Idle',
            icon,
            allowedTools: []
          };
        });
        set({ globalStaff });
      }

      const workflowsRes = await fetch('/api/workflows');
      if (workflowsRes.ok) {
        const { workflows } = await workflowsRes.json();
        set({ workflows });
      }
    } catch (e) {
      console.error("Failed to initialize store:", e);
    } finally {
      set({ isSyncing: false });
    }
  },

  syncExecutionState: async () => {
    set({ isSyncing: true });
    try {
      const stateRes = await fetch('/api/state');
      if (stateRes.ok) {
        const data = await stateRes.json();
        if (data.step) set({ currentStep: data.step });
        if (data.workflow) set({ workflowName: data.workflow });
      }
    } catch (e) {
      // ignore network errors silently for polling
    } finally {
      set({ isSyncing: false });
    }
  },

  syncProjectState: async () => {
    const currentIsSyncing = useStore.getState().isSyncing;
    if (currentIsSyncing) return;

    set({ isSyncing: true });
    try {
      const projectRes = await fetch('/api/project');
      if (projectRes.ok) {
        const data = await projectRes.json();
        const currentJobs = useStore.getState().jobs;
        const currentStaff = useStore.getState().localStaff;
        
        if (data.jobs && !isEqual(currentJobs, data.jobs)) {
          set({ jobs: data.jobs });
        }
        if (data.localStaff && !isEqual(currentStaff, data.localStaff)) {
          set({ localStaff: data.localStaff });
        }
        if (data.clusters) {
          set({ clusters: data.clusters });
        }
      }
    } catch (e) {
      // ignore
    } finally {
      set({ isSyncing: false });
    }
  },
}));

// Helper to persist state (Throttled or simple)
const persistState = async () => {
  const state = useStore.getState();
  try {
    await fetch('/api/project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobs: state.jobs,
        localStaff: state.localStaff,
        clusters: state.clusters
      })
    });
    
    await fetch('/api/mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: state.mission })
    });
  } catch (e) {
    console.error("Failed to persist state:", e);
  }
};

// Simple deep equal for objects/arrays
const isEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => isEqual(v, b[i]));
  }
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(k => isEqual(a[k], b[k]));
  }
  return false;
};

// Subscribe to REAL changes (excluding those from server sync) to persist
useStore.subscribe((state, prevState) => {
  // If we are currently fetching/syncing from server, don't trigger a save back
  if (state.isSyncing) return;

  const missionChanged = state.mission !== prevState.mission;
  const staffChanged = !isEqual(state.localStaff, prevState.localStaff);
  const jobsChanged = !isEqual(state.jobs, prevState.jobs);

  if (missionChanged || staffChanged || jobsChanged) {
    persistState();
  }
});
