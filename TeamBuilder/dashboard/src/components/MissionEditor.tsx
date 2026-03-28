import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Check, Edit2, Wand2 } from 'lucide-react';

export default function MissionEditor() {
   const mission = useStore(state => state.mission);
  const setMission = useStore(state => state.setMission);
  const generateRecommendation = useStore(state => state.generateRecommendation);
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempMission, setTempMission] = useState(mission);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    setMission(tempMission);
    setIsEditing(false);
    // In the future, this should sync with docs/mission.md
    useStore.getState().addLog({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: 'User',
      message: 'Updated mission brief'
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTempMission(mission);
    }
  };

  return (
    <div className="mission-editor">
      <div className="mission-label">MISSION BRIEF</div>
      {isEditing ? (
        <div className="mission-input-group">
          <input
            ref={inputRef}
            className="mission-input"
            value={tempMission}
            onChange={(e) => setTempMission(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button className="confirm-btn-minimal" onClick={handleSave}><Check size={18} /></button>
        </div>
      ) : (
        <div className="mission-display">
          <h1 className="mission-text">{mission}</h1>
          <div className="mission-actions">
            <button className="minimal-action-btn" onClick={generateRecommendation} title="AI Recommend Workflow">
              <Wand2 size={14} />
              <span>OPTIMIZE</span>
            </button>
            <button className="minimal-action-btn" onClick={() => setIsEditing(true)}>
              <Edit2 size={14} />
              <span>REFINE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
