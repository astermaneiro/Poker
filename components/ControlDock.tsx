import React from 'react';
import { Settings, BookOpen, Eye } from 'lucide-react';
import { UI_TEXT } from '../utils/translations';
import { Language } from '../types';

interface ControlDockProps {
  handCount: number;
  onOpenSettings: () => void;
  onOpenCheatSheet: () => void;
  gameStatus: string;
  language: Language;
}

const ControlDock: React.FC<ControlDockProps> = ({ 
  handCount, 
  onOpenSettings, 
  onOpenCheatSheet,
  gameStatus,
  language
}) => {
  const t = UI_TEXT[language];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex items-center gap-6 px-6 py-3 rounded-full glass-panel shadow-2xl bg-black/40">
        
        {/* Settings */}
        <button 
          onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}
          className="group relative flex items-center justify-center w-10 h-10 rounded-full transition-all hover:bg-white/10"
        >
          <Settings className="text-white/70 group-hover:text-white transition-colors" size={20} />
          <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-white text-black text-xs px-2 py-1 rounded font-bold whitespace-nowrap">
            {t.config}
          </span>
        </button>

        {/* Info Display */}
        <div className="flex flex-col items-center min-w-[100px] border-l border-r border-white/10 px-4">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t.round}</span>
          <span className="text-lg font-mono font-bold text-white leading-none">#{handCount}</span>
        </div>

        {/* Cheat Sheet */}
        <button 
          onClick={(e) => { e.stopPropagation(); onOpenCheatSheet(); }}
          className="group relative flex items-center justify-center w-10 h-10 rounded-full transition-all hover:bg-white/10"
        >
          {gameStatus === 'revealed' ? (
             <Eye className="text-white/70 group-hover:text-white transition-colors" size={20} />
          ) : (
             <BookOpen className="text-white/70 group-hover:text-white transition-colors" size={20} />
          )}
          <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-white text-black text-xs px-2 py-1 rounded font-bold whitespace-nowrap">
            {t.cheatSheet}
          </span>
        </button>

      </div>
    </div>
  );
};

export default ControlDock;
