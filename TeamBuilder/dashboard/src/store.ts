import { create } from 'zustand';

export interface Cluster {
  id: string;
  name: string;
  leadRoleId?: string;
}

export interface Scenario {
  id: string;
  title: string;
  path: string;
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
  // New Persona/Hybrid fields
  title?: string;
  basePersona?: string;
  style?: string;
  skillSlots?: string[];
  reportingLine?: string;
  source?: 'local' | 'global';
  body?: string;
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
  
  scenarios: Scenario[];
  importScenario: (scenarioId: string) => Promise<void>;
  
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
  
  isSyncing: boolean;
}

export const useStore = create<TeamBuilderState>((set) => ({
  isSyncing: false,
  currentView: 'mission',
  setView: (view) => set({ currentView: view }),
  
  mission: "TeamBuilder AI Orchestrator 개발",
  setMission: (mission) => set({ mission }),
  
  localStaff: [],
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
  globalStaff: [],
  addGlobalStaff: (staff) => set((state) => ({ globalStaff: [staff, ...state.globalStaff] })),
  
  scenarios: [],
  importScenario: async (scenarioId: string) => {
    const { addLog } = useStore.getState();
    addLog({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: 'System',
      message: `Importing scenario '${scenarioId}'...`
    });
    try {
      const res = await fetch('/api/scenarios/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId })
      });
      if (res.ok) {
        const data = await res.json();
        set({ mission: data.mission });
        addLog({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actor: 'System',
          message: 'Scenario mission imported successfully.'
        });
        // You might want to refresh jobs here if they were part of the import
      }
    } catch (e) {
      console.error("Failed to import scenario:", e);
    }
  },

  workflowName: "feature",
  setWorkflowName: (name) => set({ workflowName: name }),
  workflows: [],
  totalSteps: 5,
  currentStep: 1,
  jobs: [],
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
  
  logs: [],
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
    console.log("Store: Starting initialization...");
    try {
      // Parallel fetch with individual error handling
      const fetchSafely = async (url: string, defaultValue: any = {}) => {
        try {
          const res = await fetch(url);
          if (res.ok) return await res.json();
          console.warn(`Fetch failed for ${url}: ${res.status}`);
        } catch (e) {
          console.error(`Network error for ${url}:`, e);
        }
        return defaultValue;
      };

      const [state, project, mission, scenarios, roles, workflows] = await Promise.all([
        fetchSafely('/api/state'),
        fetchSafely('/api/project', { jobs: [], localStaff: [], clusters: [] }),
        fetchSafely('/api/mission', { content: "" }),
        fetchSafely('/api/scenarios', { scenarios: [] }),
        fetchSafely('/api/roles', { roles: [] }),
        fetchSafely('/api/workflows', { workflows: [] })
      ]);

      if (state.step) set({ currentStep: state.step });
      if (state.workflow) set({ workflowName: state.workflow });
      
      if (project.jobs) set({ jobs: project.jobs });
      if (project.localStaff) set({ localStaff: project.localStaff });
      if (project.clusters) set({ clusters: project.clusters });
      
      if (mission.content) set({ mission: mission.content });
      if (scenarios.scenarios) set({ scenarios: scenarios.scenarios });
      
      if (roles.roles) {
        const globalStaff = roles.roles.map((r: any) => {
          let icon = '👤';
          const name = r.id;
          if (name.includes('engineer') || r.role?.includes('Engineer')) icon = '🔧';
          else if (name.includes('researcher')) icon = '📊';
          else if (name.includes('reviewer') || name.includes('auditor')) icon = '🛡️';
          else if (name.includes('product')) icon = '📋';
          else if (name.includes('qa')) icon = '🐛';
          else if (name.includes('architect')) icon = '🏗️';
          
          return {
            id: `g-${r.id}`,
            name: r.id,
            title: r.title,
            specialty: r.category || 'Specialist',
            status: 'Idle',
            icon,
            allowedTools: [],
            ...r
          };
        });
        set({ globalStaff });
      }

      if (workflows.workflows) set({ workflows: workflows.workflows });
      
      console.log("Store: Initialization complete.");
    } catch (e) {
      console.error("Critical error during store initialization:", e);
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
      // ignore
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
      }
    } catch (e) {
      // ignore
    } finally {
      set({ isSyncing: false });
    }
  },
}));

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

useStore.subscribe((state, prevState) => {
  if (state.isSyncing) return;
  const missionChanged = state.mission !== prevState.mission;
  const staffChanged = !isEqual(state.localStaff, prevState.localStaff);
  const jobsChanged = !isEqual(state.jobs, prevState.jobs);
  if (missionChanged || staffChanged || jobsChanged) {
    persistState();
  }
});
