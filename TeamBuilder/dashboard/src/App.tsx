import { useEffect } from 'react';
import { useStore } from './store';

import Sidebar from './components/Sidebar';
import MainBoard from './components/MainBoard';
import LogPanel from './components/LogPanel';
import TalentMarketModal from './components/TalentMarketModal';
import RoleCreatorModal from './components/RoleCreatorModal';
import RoleDetailModal from './components/RoleDetailModal';

function App() {
  useEffect(() => {
    const store = useStore.getState();
    store.initialize();

    const interval = setInterval(() => {
      useStore.getState().syncExecutionState();
      useStore.getState().syncProjectState();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <MainBoard />
      <div className="log-panel-container">
        <LogPanel />
      </div>
      <TalentMarketModal />
      <RoleCreatorModal />
      <RoleDetailModal />
    </div>
  );
}

export default App;
