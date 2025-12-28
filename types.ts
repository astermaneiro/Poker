export enum Suit {
  Spades = 's',
  Hearts = 'h',
  Diamonds = 'd',
  Clubs = 'c'
}

export enum Rank {
  Two = '2', Three = '3', Four = '4', Five = '5', Six = '6',
  Seven = '7', Eight = '8', Nine = '9', Ten = 'T',
  Jack = 'J', Queen = 'Q', King = 'K', Ace = 'A'
}

export interface Card {
  rank: Rank;
  suit: Suit;
  id: string; // unique identifier for React keys
}

export enum HandRank {
  HighCard = 1,
  Pair,
  TwoPair,
  ThreeOfAKind,
  Straight,
  Flush,
  FullHouse,
  FourOfAKind,
  StraightFlush,
  RoyalFlush
}

export interface HandEvaluation {
  rank: HandRank;
  name: string; // Internal English name
  score: number; // Numeric score for tie-breaking
  winningCards: Card[]; // All 5 cards making the hand (Main + Kickers)
  coreCards: Card[]; // JUST the main combination cards (e.g., the Pair, the Trips)
}

export interface PlayerHand {
  id: number;
  cards: Card[];
  evaluation?: HandEvaluation;
}

export type Language = 'en' | 'ru';

export interface GameSettings {
  language: Language;
  showCombinationName: boolean;
  instantFeedback: boolean;
  difficulty: number; // Number of opponents (1 to 5, total 2-6 hands)
  timer: boolean;
  hideBoard: boolean;
}