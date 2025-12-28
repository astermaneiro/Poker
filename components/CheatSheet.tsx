import React from 'react';
import { HandRank } from '../types';
import { X, Trophy } from 'lucide-react';
import { HAND_NAMES, UI_TEXT } from '../utils/translations';

interface CheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeRank?: HandRank;
  language: 'en' | 'ru';
}

const CheatSheet: React.FC<CheatSheetProps> = ({ isOpen, onClose, activeRank, language }) => {
  if (!isOpen) return null;

  const t = UI_TEXT[language];
  const names = HAND_NAMES[language];

  // We define descriptions dynamically based on language
  const DESCRIPTIONS: Record<string, Record<HandRank, string>> = {
    en: {
        [HandRank.RoyalFlush]: 'A, K, Q, J, 10, all the same suit.',
        [HandRank.StraightFlush]: 'Five cards in a sequence, all in the same suit.',
        [HandRank.FourOfAKind]: 'All four cards of the same rank.',
        [HandRank.FullHouse]: 'Three of a kind with a pair.',
        [HandRank.Flush]: 'Any five cards of the same suit, but not in a sequence.',
        [HandRank.Straight]: 'Five cards in a sequence, but not of the same suit.',
        [HandRank.ThreeOfAKind]: 'Three cards of the same rank.',
        [HandRank.TwoPair]: 'Two different pairs.',
        [HandRank.Pair]: 'Two cards of the same rank.',
        [HandRank.HighCard]: 'When you haven\'t made any of the hands above.',
    },
    ru: {
        [HandRank.RoyalFlush]: 'Туз, Король, Дама, Валет, 10 одной масти.',
        [HandRank.StraightFlush]: 'Пять карт по порядку одной масти.',
        [HandRank.FourOfAKind]: 'Четыре карты одного достоинства.',
        [HandRank.FullHouse]: 'Три карты одного достоинства и одна пара.',
        [HandRank.Flush]: 'Любые пять карт одной масти.',
        [HandRank.Straight]: 'Пять карт по порядку любых мастей.',
        [HandRank.ThreeOfAKind]: 'Три карты одного достоинства.',
        [HandRank.TwoPair]: 'Две разные пары.',
        [HandRank.Pair]: 'Две карты одного достоинства.',
        [HandRank.HighCard]: 'Старшая карта, если нет других комбинаций.',
    }
  };

  // Probabilities are universal
  const PROBS: Record<HandRank, string> = {
    [HandRank.RoyalFlush]: '0.0032%',
    [HandRank.StraightFlush]: '0.0279%',
    [HandRank.FourOfAKind]: '0.168%',
    [HandRank.FullHouse]: '2.60%',
    [HandRank.Flush]: '3.03%',
    [HandRank.Straight]: '4.62%',
    [HandRank.ThreeOfAKind]: '4.83%',
    [HandRank.TwoPair]: '23.5%',
    [HandRank.Pair]: '43.8%',
    [HandRank.HighCard]: '50.1%',
  };

  // Order of ranks to display
  const RANK_ORDER = [
    HandRank.RoyalFlush, HandRank.StraightFlush, HandRank.FourOfAKind,
    HandRank.FullHouse, HandRank.Flush, HandRank.Straight,
    HandRank.ThreeOfAKind, HandRank.TwoPair, HandRank.Pair, HandRank.HighCard
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-panel rounded-t-3xl md:rounded-2xl shadow-2xl border-b-0 md:border border-white/10 flex flex-col animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-400" size={24} />
            <h2 className="text-xl font-bold tracking-wide text-white">{t.handRankings}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 transition-colors rounded-full hover:bg-white/10 text-white/60 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* List */}
        <div className="p-4 space-y-2 pb-10 md:pb-4">
          {RANK_ORDER.map((rankId) => {
            const isActive = activeRank === rankId;
            return (
              <div 
                key={rankId}
                className={`
                  p-4 rounded-xl border transition-all duration-500
                  ${isActive 
                    ? 'bg-white/10 border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.15)] scale-[1.02]' 
                    : 'bg-white/5 border-transparent hover:bg-white/8'}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-bold ${isActive ? 'text-teal-300' : 'text-white'}`}>
                    {names[rankId]}
                  </h3>
                  <span className="text-xs font-mono text-white/40">{PROBS[rankId]}</span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  {DESCRIPTIONS[language][rankId]}
                </p>
              </div>
            );
          })}
        </div>
        
        {/* Footer Hint */}
        <div className="p-4 text-center border-t bg-white/5 border-white/5">
          <p className="text-xs text-white/30">{t.close}</p>
        </div>
      </div>
    </div>
  );
};

export default CheatSheet;
