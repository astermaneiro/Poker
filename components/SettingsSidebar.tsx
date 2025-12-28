import React from 'react';
import { GameSettings } from '../types';
import { X, Sliders, Languages } from 'lucide-react';
import { UI_TEXT } from '../utils/translations';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ isOpen, onClose, settings, updateSettings }) => {
  const t = UI_TEXT[settings.language];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-80 glass-panel border-r border-white/10 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Sliders size={20} className="text-white" />
              <h2 className="text-lg font-bold">{t.settingsTitle}</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 p-6 space-y-8 overflow-y-auto">
            
            {/* Language Selector */}
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                 <Languages size={16} />
                 <span>Language / Язык</span>
               </div>
               <div className="flex p-1 bg-white/10 rounded-lg">
                 <button 
                   onClick={() => updateSettings({ language: 'en' })}
                   className={`flex-1 py-1.5 text-sm rounded-md transition-all ${settings.language === 'en' ? 'bg-white text-black shadow-lg font-bold' : 'text-white/60 hover:text-white'}`}
                 >
                   English
                 </button>
                 <button 
                   onClick={() => updateSettings({ language: 'ru' })}
                   className={`flex-1 py-1.5 text-sm rounded-md transition-all ${settings.language === 'ru' ? 'bg-white text-black shadow-lg font-bold' : 'text-white/60 hover:text-white'}`}
                 >
                   Русский
                 </button>
               </div>
            </div>

            <hr className="border-white/10" />
            
            {/* Difficulty */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white/80">
                {t.difficulty}
              </label>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-mono text-white/50">1</span>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={settings.difficulty}
                  onChange={(e) => updateSettings({ difficulty: parseInt(e.target.value) })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <span className="text-sm font-mono text-white/50">5</span>
              </div>
              <p className="text-xs text-white/40">Current: {settings.difficulty} {t.currentOpponents}</p>
            </div>

            <hr className="border-white/10" />

            {/* Toggles */}
            <Toggle 
              label={t.showHandName} 
              desc={t.showHandNameDesc}
              checked={settings.showCombinationName} 
              onChange={(v) => updateSettings({ showCombinationName: v })} 
            />

            <Toggle 
              label={t.autoAdvance} 
              desc={t.autoAdvanceDesc}
              checked={settings.instantFeedback} 
              onChange={(v) => updateSettings({ instantFeedback: v })} 
            />

            <Toggle 
              label={t.hideBoard} 
              desc={t.hideBoardDesc}
              checked={settings.hideBoard} 
              onChange={(v) => updateSettings({ hideBoard: v })} 
            />
             <Toggle 
              label={t.stressTimer} 
              desc={t.stressTimerDesc}
              checked={settings.timer} 
              onChange={(v) => updateSettings({ timer: v })} 
            />

          </div>

          <div className="p-6 border-t border-white/10">
            <p className="text-xs text-center text-white/20">GlassHoldem v1.1</p>
          </div>
        </div>
      </div>
    </>
  );
};

const Toggle: React.FC<{ label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }> = ({ 
  label, desc, checked, onChange 
}) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex flex-col flex-1">
      <span className="text-sm font-medium text-white leading-tight">{label}</span>
      <span className="text-xs text-white/40 mt-0.5 leading-tight">{desc}</span>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none
        ${checked ? 'bg-white' : 'bg-white/20'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full transition bg-black
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  </div>
);

export default SettingsSidebar;
