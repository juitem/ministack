import React from 'react';
import { useStore } from '../store';
import { Sparkles, FileText, Send, BookOpen } from 'lucide-react';

const MissionEditor: React.FC = () => {
  const { 
    mission, 
    setMission, 
    generateRecommendation, 
    scenarios, 
    importScenario 
  } = useStore();

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scenarioId = e.target.value;
    if (scenarioId) {
      importScenario(scenarioId);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="space-y-4">
        <div className="flex items-center space-x-3 text-white/40 mb-2">
          <BookOpen size={16} />
          <span className="text-xs uppercase tracking-[0.2em] font-medium">Mission Blueprint</span>
        </div>
        <h1 className="text-5xl font-light tracking-tight text-white leading-tight">
          What are we <span className="italic font-serif text-white/70">building</span> today?
        </h1>
        <p className="text-lg text-white/40 font-light max-w-2xl leading-relaxed">
          Define your mission or select a pre-defined scenario to bootstrap your AI team.
        </p>
      </header>

      <div className="space-y-8">
        {/* Scenario Selector */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium block">
            Select a Starting Scenario
          </label>
          <div className="relative group">
            <select 
              onChange={handleScenarioChange}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white/80 focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer group-hover:bg-white/[0.05]"
              defaultValue=""
            >
              <option value="" disabled>Choose a scenario blueprint...</option>
              {scenarios.map(s => (
                <option key={s.id} value={s.id} className="bg-[#0a0a0a] text-white">
                  {s.title}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-white/40 transition-colors">
              <FileText size={18} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">
              Mission Statement
            </label>
            <div className="flex items-center space-x-2 text-[10px] text-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse"></span>
              <span>AI Ready</span>
            </div>
          </div>
          
          <div className="relative group">
            <textarea
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              className="w-full h-48 bg-white/[0.02] border border-white/10 rounded-2xl px-8 py-8 text-xl text-white font-light leading-relaxed focus:outline-none focus:border-white/20 transition-all placeholder:text-white/10 group-hover:bg-white/[0.04] resize-none"
              placeholder="e.g. Build an autonomous agent team to manage cloud infrastructure..."
            />
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-2">
                <Send size={14} className="text-white/40" />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={generateRecommendation}
          className="w-full group relative overflow-hidden bg-white text-black h-16 rounded-2xl font-medium tracking-wide hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-3"
        >
          <Sparkles size={18} className="group-hover:animate-spin-slow" />
          <span>Generate Project Blueprint</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </button>
      </div>

      <footer className="pt-12 border-t border-white/5 grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium">Current Focus</h4>
          <p className="text-sm text-white/50 leading-relaxed italic font-serif">
            "Artisanal software engineering through agentic orchestration."
          </p>
        </div>
        <div className="space-y-2 text-right">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium">Project Status</h4>
          <div className="flex items-center justify-end space-x-2">
            <span className="text-xs text-white/40">Planning Phase</span>
            <div className="w-1 h-1 rounded-full bg-white/20"></div>
            <span className="text-xs text-white/40">Ready to Recruit</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MissionEditor;

