import React from 'react';
import { Card as CardType, Suit } from '../types';
import { Diamond, Heart, Club, Spade } from 'lucide-react';

interface CardProps {
  card?: CardType; // If undefined, it's a placeholder slot
  isWinner?: boolean;
  isKicker?: boolean; // If true, this is a winning card but secondary (kicker)
  isWrong?: boolean; 
  isDimmed?: boolean;
  hidden?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  delay?: number; // Animation delay in ms
}

const Card: React.FC<CardProps> = ({ 
  card, 
  isWinner = false, 
  isKicker = false,
  isWrong = false,
  isDimmed = false, 
  hidden = false, 
  size = 'lg',
  className = '',
  delay = 0
}) => {
  if (!card && !hidden) {
    // Empty slot
    return (
      <div 
        className={`
          relative border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center
          ${size === 'lg' ? 'w-20 h-28 md:w-24 md:h-36' : size === 'md' ? 'w-12 h-16' : 'w-8 h-10'}
          ${className}
        `}
      >
        <div className="w-4 h-4 rounded-full bg-white/5" />
      </div>
    );
  }

  if (hidden) {
     return (
       <div 
        className={`
          relative bg-[#1a1a1a] rounded-lg border border-white/10 shadow-xl
          bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]
          ${size === 'lg' ? 'w-20 h-28 md:w-24 md:h-36' : size === 'md' ? 'w-12 h-16' : 'w-8 h-10'}
          ${className}
        `}
      />
     );
  }

  // Safe check
  if (!card) return null;

  const isRed = card.suit === Suit.Hearts || card.suit === Suit.Diamonds;
  const colorClass = isRed ? 'text-rose-400' : 'text-slate-300';
  
  const SuitIcon = {
    [Suit.Spades]: Spade,
    [Suit.Hearts]: Heart,
    [Suit.Diamonds]: Diamond,
    [Suit.Clubs]: Club
  }[card.suit];

  const sizeClasses = {
    sm: { w: 'w-8', h: 'h-10', text: 'text-[10px]', icon: 10 },
    md: { w: 'w-14', h: 'h-20', text: 'text-sm', icon: 16 },
    lg: { w: 'w-20 md:w-24', h: 'h-28 md:h-36', text: 'text-xl md:text-2xl', icon: 20 },
  }[size];

  const style = {
    animationDelay: `${delay}ms`,
  };

  // Border and Shadow logic
  let borderClass = 'glass-card'; // default
  
  if (isWinner) {
    if (isKicker) {
      // Secondary Winner (Dimmer)
      borderClass = 'bg-[#1F1F1F] ring-1 ring-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)] transform -translate-y-1';
    } else {
      // Primary Winner (Bright)
      borderClass = 'bg-[#1F1F1F] ring-2 ring-green-500 shadow-[0_0_25px_rgba(34,197,94,0.6)] transform -translate-y-2';
    }
  } else if (isWrong) {
    borderClass = 'bg-[#1F1F1F] ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]';
  }

  // FORCE winner to be full opacity regardless of isDimmed
  const opacityClass = isWinner 
    ? 'opacity-100' 
    : (isDimmed ? 'opacity-30 grayscale' : 'opacity-100');

  return (
    <div
      style={style}
      className={`
        relative flex flex-col justify-between p-2 rounded-xl select-none transition-all duration-300
        ${borderClass}
        ${sizeClasses.w} ${sizeClasses.h}
        ${opacityClass}
        ${className} animate-pop-in
      `}
    >
      {/* Top Left */}
      <div className={`flex flex-col items-center leading-none ${colorClass}`}>
        <span className={`font-bold ${sizeClasses.text}`}>{card.rank}</span>
        <SuitIcon size={size === 'lg' ? 16 : 10} className="mt-0.5" fill={isRed ? 'currentColor' : 'currentColor'} strokeWidth={0} />
      </div>

      {/* Center Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-10">
        <SuitIcon size={size === 'lg' ? 64 : 32} fill="currentColor" className={colorClass} strokeWidth={0} />
      </div>

      {/* Bottom Right (Rotated) */}
      <div className={`flex flex-col items-center leading-none transform rotate-180 ${colorClass}`}>
        <span className={`font-bold ${sizeClasses.text}`}>{card.rank}</span>
        <SuitIcon size={size === 'lg' ? 16 : 10} className="mt-0.5" fill={isRed ? 'currentColor' : 'currentColor'} strokeWidth={0} />
      </div>
    </div>
  );
};

export default Card;