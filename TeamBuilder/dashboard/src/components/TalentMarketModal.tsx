import React, { useState } from 'react';
import { useStore, type Staff } from '../store';
import { X, Search, Plus, Zap, Sparkles } from 'lucide-react';

const TalentMarketModal: React.FC = () => {
  const { globalStaff, addStaff, isMarketOpen, setMarketOpen, addLog } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isMarketOpen) return null;

  const filteredStaff = globalStaff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.style?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRecruit = (staff: Staff) => {
    const newStaff = {
      ...staff,
      id: `${staff.name}-${Date.now()}`,
      status: 'Ready' as const
    };
    addStaff(newStaff);
    addLog({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: 'User',
      message: `Recruited ${staff.title || staff.name} to the team.`
    });
    setMarketOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setMarketOpen(false)} />
      
      <div className="relative w-full max-w-6xl h-full max-h-[85vh] bg-[#0c0c0c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <Sparkles size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">Talent Market</h2>
              <p className="text-xs text-white/30 tracking-wider uppercase">Global Expert Agency</p>
            </div>
          </div>
          
          <button 
            onClick={() => setMarketOpen(false)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40"
          >
            <X size={24} />
          </button>
        </header>

        {/* Search */}
        <div className="px-8 py-6 bg-white/[0.01] border-b border-white/5">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/50 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by role, style, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all"
            />
          </div>
        </div>

        {/* Talent Grid */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStaff.map((staff) => (
              <div 
                key={staff.id}
                className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                      {staff.icon}
                    </div>
                    {staff.style && (
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest text-white/60 font-medium">
                        {staff.style}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white group-hover:text-white transition-colors">
                      {staff.title || staff.name}
                    </h3>
                    <p className="text-xs text-white/30 uppercase tracking-widest mt-1">
                      {staff.specialty}
                    </p>
                  </div>

                  {staff.basePersona && (
                    <div className="bg-white/[0.03] rounded-xl p-4 space-y-2">
                      <div className="flex items-center space-x-2 text-[9px] uppercase tracking-tighter text-white/20">
                        <Zap size={10} />
                        <span>Core Philosophy</span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed italic font-serif">
                        "{staff.basePersona}"
                      </p>
                    </div>
                  )}

                  {staff.skillSlots && (
                    <div className="flex flex-wrap gap-2">
                      {staff.skillSlots.map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/5 text-[9px] text-white/40">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handleRecruit(staff)}
                  className="mt-8 w-full py-3 bg-white text-black rounded-xl font-medium text-sm flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Plus size={16} />
                  <span>Recruit to Team</span>
                </button>
              </div>
            ))}
          </div>
          
          {filteredStaff.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4 py-12">
              <Search size={48} strokeWidth={1} />
              <p className="text-lg font-light italic font-serif">No specialists found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalentMarketModal;

