import { useEffect } from 'react';
import { useStore } from './store';
import './App.css';

import Sidebar from './components/Sidebar';
import MainBoard from './components/MainBoard';
import LogPanel from './components/LogPanel';
import TalentMarketModal from './components/TalentMarketModal';
import RoleCreatorModal from './components/RoleCreatorModal';
import RoleDetailModal from './components/RoleDetailModal';

function App() {
  console.log("App Component Rendering...");
  
  useEffect(() => {
    console.log("App UseEffect running...");
    const store = useStore.getState();
    store.initialize().then(() => {
      console.log("Store initialized successfully");
    }).catch(err => {
      console.error("Store initialization failed:", err);
    });

    const interval = setInterval(() => {
      useStore.getState().syncExecutionState();
      useStore.getState().syncProjectState();
    }, 5000); // Relaxed interval

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar />
      <MainBoard />
      <div className="log-panel-container">
        <LogPanel />
      </div>
      <TalentMarketModal />
      <RoleCreatorModal />
      <RoleDetailModal />
      {/* Simple debug indicator */}
      <div style={{ position: 'fixed', bottom: 10, right: 10, fontSize: '10px', color: 'rgba(255,255,255,0.1)' }}>
        v0.4-mono-ready
      </div>
    </div>
  );
}

export default App;
