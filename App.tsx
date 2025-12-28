import React, { useState, useEffect, useCallback } from 'react';
import { createDeck, evaluateHand } from './services/pokerLogic';
import { Card as CardType, PlayerHand, GameSettings } from './types';
import Card from './components/Card';
import CheatSheet from './components/CheatSheet';
import SettingsSidebar from './components/SettingsSidebar';
import ControlDock from './components/ControlDock';
import { CheckCircle2, XCircle } from 'lucide-react';
import { HAND_NAMES, UI_TEXT } from './utils/translations';

const App: React.FC = () => {
  // Game State
  const [board, setBoard] = useState<CardType[]>([]);
  const [players, setPlayers] = useState<PlayerHand[]>([]);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [status, setStatus] = useState<'dealing' | 'playing' | 'revealed'>('dealing');
  const [userResult, setUserResult] = useState<'win' | 'loss' | null>(null);
  const [selectedHandId, setSelectedHandId] = useState<number | null>(null);
  
  const [handCount, setHandCount] = useState(0);
  const [shakingHandId, setShakingHandId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // UI State
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    language: 'en',
    showCombinationName: true,
    instantFeedback: false,
    difficulty: 1, 
    timer: false,
    hideBoard: false
  });

  const t = UI_TEXT[settings.language];

  // --- Game Logic ---

  const dealNewHand = useCallback(() => {
    // Reset states
    setIsTransitioning(false);
    setStatus('dealing');
    setWinnerId(null);
    setUserResult(null);
    setSelectedHandId(null);
    setShakingHandId(null);
    setTimeLeft(10);
    
    // Minimal delay to allow DOM to clear before repopulating
    setTimeout(() => {
      const deck = createDeck();
      
      // Deal Board (0 or 5 cards)
      const newBoard = settings.hideBoard ? [] : deck.splice(0, 5);
      setBoard(newBoard);

      // Deal Players
      const numPlayers = settings.difficulty + 1;
      const newPlayers: PlayerHand[] = [];
      
      for (let i = 0; i < numPlayers; i++) {
        const holeCards = deck.splice(0, 2);
        // We evaluate against the newBoard reference immediately
        const evalResult = evaluateHand(holeCards, newBoard);
        newPlayers.push({
          id: i,
          cards: holeCards,
          evaluation: evalResult
        });
      }

      setPlayers(newPlayers);
      setHandCount(prev => prev + 1);
      setStatus('playing');

    }, 50); 
  }, [settings.difficulty, settings.hideBoard]);

  // Initial Deal
  useEffect(() => {
    dealNewHand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Timer Logic
  useEffect(() => {
    if (!settings.timer || status !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, settings.timer]);

  const handleTimeOut = () => {
    // Timeout acts as a wrong guess
    resolveRound(null); 
  };

  // Called when round ends (either by click or timeout)
  const resolveRound = (userSelectedId: number | null) => {
    // Find actual winner
    const sortedPlayers = [...players].sort((a, b) => (b.evaluation?.score || 0) - (a.evaluation?.score || 0));
    const realWinnerId = sortedPlayers[0].id;
    
    setWinnerId(realWinnerId);
    setSelectedHandId(userSelectedId);
    setStatus('revealed');

    // Check result
    if (userSelectedId === realWinnerId) {
      setUserResult('win');
      if (settings.instantFeedback) {
        triggerNextHandTransition(1500);
      }
    } else {
      setUserResult('loss');
      
      // If user selected something (not timeout), shake it
      if (userSelectedId !== null) {
        setShakingHandId(userSelectedId);
        setTimeout(() => setShakingHandId(null), 500);
      }

      if (settings.instantFeedback) {
        triggerNextHandTransition(3000); // Longer delay to study failure
      }
    }
  };

  const triggerNextHandTransition = (delayMs: number = 0) => {
    if (isTransitioning) return;
    
    setTimeout(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        dealNewHand();
      }, 500); // Wait for fadeOut animation
    }, delayMs);
  };

  const handleHandClick = (e: React.MouseEvent, playerId: number) => {
    e.stopPropagation(); 
    
    if (status === 'revealed') {
      if (!settings.instantFeedback && !isTransitioning) {
        triggerNextHandTransition(0);
      }
      return;
    }

    if (status !== 'playing') return;

    resolveRound(playerId);
  };

  const handleBackgroundClick = () => {
    if (status === 'revealed' && !settings.instantFeedback && !isTransitioning) {
      triggerNextHandTransition(0);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); 
        if (status === 'revealed' && !showCheatSheet && !isTransitioning) {
          if (!settings.instantFeedback) {
             triggerNextHandTransition(0);
          }
        } else if (!showCheatSheet && !showSettings) {
          setShowCheatSheet(prev => !prev);
        } else if (showCheatSheet) {
          setShowCheatSheet(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, showCheatSheet, showSettings, settings.instantFeedback, isTransitioning]);

  // Derived State helpers
  const getWinnerHand = () => players.find(p => p.id === winnerId);
  
  // Helper to determine highlight status
  // CHANGED: Use strict ID matching to ensure table cards are recognized even if refs change
  const getWinningStatus = (card: CardType) => {
    if (!winnerId || status !== 'revealed') return { isWinner: false, isKicker: false };
    const winner = getWinnerHand();
    if (!winner?.evaluation) return { isWinner: false, isKicker: false };

    // Check if this card is part of the 5-card winning hand using ID
    const isTotalWinner = winner.evaluation.winningCards.some(
      c => c.id === card.id
    );
    
    if (!isTotalWinner) return { isWinner: false, isKicker: false };

    // Check if it's a Core card (Pair, Trips) or Kicker using ID
    const isCore = winner.evaluation.coreCards.some(
      c => c.id === card.id
    );
    
    return { 
      isWinner: true, 
      isKicker: !isCore // If it's a winner but NOT core, it's a kicker
    };
  };
  
  const activeRank = (status === 'revealed' && winnerId !== null) 
    ? getWinnerHand()?.evaluation?.rank 
    : undefined;

  return (
    <div 
      className="relative w-full h-screen overflow-hidden flex flex-col items-center bg-[#050505] cursor-default"
      onClick={handleBackgroundClick}
    >
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent opacity-50 pointer-events-none" />

      {/* Timer Bar */}
      {settings.timer && status === 'playing' && (
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 10) * 100}%` }} />
      )}

      {/* Main Game Container - Transition Wrapper */}
      <div className={`w-full h-full flex flex-col items-center ${isTransitioning ? 'animate-out' : ''}`}>
        
        {/* --- Zone A: The Board --- */}
        <div className="w-full flex flex-col items-center justify-center relative min-h-[35vh] pt-32 md:pt-36">
           {/* Instruction / Result Text */}
          <div className="absolute top-6 md:top-12 z-20 text-center px-4 w-full">
            <div className={`inline-block p-4 rounded-3xl bg-black/40 backdrop-blur-md border shadow-2xl transition-colors duration-300 ${status === 'revealed' ? (userResult === 'win' ? 'border-green-500/30' : 'border-red-500/30') : 'border-white/5'}`}>
             {status === 'revealed' && winnerId !== null ? (
               <div className="animate-pop-in">
                 {userResult === 'win' ? (
                    <>
                      <h2 className="text-2xl md:text-4xl font-bold text-white mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                        {getWinnerHand()?.evaluation?.rank && HAND_NAMES[settings.language][getWinnerHand()!.evaluation!.rank]}
                      </h2>
                      <p className="text-green-400 font-mono text-xs uppercase tracking-[0.2em] font-bold">
                        {t.roundWon}
                      </p>
                    </>
                 ) : (
                    <>
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                        {t.roundLost}
                      </h2>
                      <p className="text-red-400 font-mono text-xs uppercase tracking-[0.2em] mb-2 font-bold">
                        {t.betterHand} <span className="text-white">{getWinnerHand()?.evaluation?.rank && HAND_NAMES[settings.language][getWinnerHand()!.evaluation!.rank]}</span>
                      </p>
                    </>
                 )}
                 
                 {!settings.instantFeedback && (
                   <p className="mt-2 text-[10px] text-white/40 animate-pulse">{t.continue}</p>
                 )}
               </div>
             ) : (
               <h2 className="text-white/50 font-light tracking-wide uppercase text-xs md:text-sm">
                 {settings.timer ? `${t.selectWinnerTimer} (${timeLeft}s)` : t.selectWinner}
               </h2>
             )}
            </div>
          </div>

          {/* Board Cards */}
          <div className="flex items-center justify-center gap-2 md:gap-4 px-6 md:px-4 z-10 mt-4 w-full max-w-[95vw] md:max-w-none">
            {!settings.hideBoard && Array.from({ length: 5 }).map((_, i) => {
              const cardStatus = board[i] ? getWinningStatus(board[i]) : { isWinner: false, isKicker: false };
              const isWinner = status === 'revealed' && cardStatus.isWinner;
              // Dim only if it's revealed AND NOT a winner
              const isDimmed = status === 'revealed' && !isWinner;
              
              return (
                <Card 
                  key={`board-${i}`}
                  card={board[i]}
                  delay={i * 50} 
                  isWinner={isWinner}
                  isKicker={status === 'revealed' && cardStatus.isKicker}
                  isDimmed={isDimmed}
                />
              );
            })}
            {settings.hideBoard && (
              <div className="text-white/20 font-mono border border-white/10 px-8 py-4 rounded-xl">
                {t.boardHidden}
              </div>
            )}
          </div>
        </div>

        {/* --- Zone B: The Hands --- */}
        <div className="flex-1 w-full flex flex-col items-center justify-start overflow-y-auto md:overflow-visible custom-scrollbar pt-8 pb-32">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-8 md:gap-16 px-6 w-full max-w-7xl">
            {players.map((player) => {
              const isWinner = status === 'revealed' && winnerId === player.id;
              // Player selected this hand, but it wasn't the winner
              const isSelectedWrong = status === 'revealed' && selectedHandId === player.id && !isWinner;
              const isLoser = status === 'revealed' && !isWinner && !isSelectedWrong;
              const isShaking = shakingHandId === player.id;

              return (
                <button
                  key={player.id}
                  onClick={(e) => handleHandClick(e, player.id)}
                  disabled={status === 'dealing' || isTransitioning} 
                  className={`
                    group relative flex flex-col items-center transition-all duration-300 outline-none
                    ${isLoser ? 'opacity-30 grayscale blur-[1px]' : ''}
                    ${isShaking ? 'animate-shake' : ''}
                  `}
                >
                  
                  {/* Cards Container */}
                  <div 
                    className={`
                      flex gap-2 relative transition-all duration-300
                      ${!status || status === 'playing' ? 'group-hover:scale-110 group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]' : ''}
                      ${isWinner ? 'scale-110 drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]' : ''}
                      ${isSelectedWrong ? 'scale-100 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''}
                    `}
                  >
                     {player.cards.map((card, i) => {
                       const cardStatus = isWinner ? getWinningStatus(card) : { isWinner: false, isKicker: false };
                       return (
                         <Card 
                           key={card.id} 
                           card={card} 
                           size="lg" 
                           delay={0}
                           isWinner={isWinner && cardStatus.isWinner}
                           isKicker={isWinner && cardStatus.isKicker}
                           isWrong={isSelectedWrong}
                           className={`${i === 1 ? '-ml-8 md:-ml-12 mt-1 md:mt-2 shadow-[-5px_0_10px_rgba(0,0,0,0.5)]' : 'z-0'} transition-transform group-hover:translate-x-1`}
                         />
                       );
                     })}
                  </div>

                  {/* Result/Name Indicator */}
                  <div className="h-8 mt-6 flex items-center justify-center">
                    {status === 'revealed' && isWinner && (
                        <div className="bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pop-in">
                          <CheckCircle2 size={12} /> {t.win}
                        </div>
                    )}
                    {status === 'revealed' && isSelectedWrong && (
                        <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pop-in">
                           <XCircle size={12} />
                        </div>
                    )}

                    {status === 'revealed' && isWinner && settings.showCombinationName && (
                      <div className="absolute top-full mt-2 text-center whitespace-nowrap z-20">
                         <span className="text-green-400 font-medium text-sm drop-shadow-md">
                           {player.evaluation?.rank && HAND_NAMES[settings.language][player.evaluation!.rank]}
                         </span>
                      </div>
                    )}
                  </div>

                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- Zone C: Control Dock --- */}
      <ControlDock 
        handCount={handCount}
        onOpenSettings={() => setShowSettings(true)}
        onOpenCheatSheet={() => setShowCheatSheet(true)}
        gameStatus={status}
        language={settings.language}
      />

      {/* --- Modals --- */}
      <SettingsSidebar 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        settings={settings}
        updateSettings={(newSet) => setSettings({...settings, ...newSet})}
      />

      <CheatSheet 
        isOpen={showCheatSheet} 
        onClose={() => setShowCheatSheet(false)}
        activeRank={activeRank}
        language={settings.language}
      />
      
    </div>
  );
};

export default App;