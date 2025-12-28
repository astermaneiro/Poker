import { Card, Suit, Rank, HandRank, HandEvaluation } from '../types';

const SUITS = [Suit.Spades, Suit.Hearts, Suit.Diamonds, Suit.Clubs];
const RANKS = [
  Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six,
  Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten,
  Rank.Jack, Rank.Queen, Rank.King, Rank.Ace
];

const RANK_VALUE: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

export const createDeck = (): Card[] => {
  let deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit, id: `${rank}${suit}` });
    }
  }
  return shuffle(deck);
};

export const shuffle = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

// --- Evaluation Logic ---

const getCardValue = (card: Card): number => RANK_VALUE[card.rank];

/**
 * Calculates a unique score based on hand rank and kickers.
 */
const getScore = (rank: HandRank, relevantCards: Card[]): number => {
  let score = rank * Math.pow(15, 5);
  relevantCards.forEach((card, index) => {
    const power = 4 - index; 
    if (power >= 0) {
      score += getCardValue(card) * Math.pow(15, power);
    }
  });
  return score;
};

// Helper to fill hand to 5 cards with best kickers using ID comparison
const fillHand = (mainCards: Card[], allCards: Card[]): Card[] => {
  if (mainCards.length >= 5) return mainCards.slice(0, 5);
  
  const kickers = allCards
    .filter(c => !mainCards.some(m => m.id === c.id))
    .slice(0, 5 - mainCards.length);
    
  return [...mainCards, ...kickers];
};

export const evaluateHand = (holeCards: Card[], communityCards: Card[]): HandEvaluation => {
  const allCards = [...holeCards, ...communityCards];
  
  // Pre-flop logic
  if (communityCards.length === 0) {
    const v1 = getCardValue(holeCards[0]);
    const v2 = getCardValue(holeCards[1]);
    const isPair = v1 === v2;
    
    // Sort hole cards
    const sortedHole = [...holeCards].sort((a, b) => getCardValue(b) - getCardValue(a));
    
    const rank = isPair ? HandRank.Pair : HandRank.HighCard;
    const score = getScore(rank, sortedHole);
    
    return {
      rank,
      name: isPair ? 'Pocket Pair' : 'High Card',
      score,
      winningCards: holeCards,
      coreCards: isPair ? holeCards : [sortedHole[0]]
    };
  }

  // Post-flop logic (7 cards)
  allCards.sort((a, b) => getCardValue(b) - getCardValue(a));

  const flushCheck = getFlush(allCards);
  const straightCheck = getStraight(allCards);
  
  // 1. Royal Flush & Straight Flush
  if (flushCheck && straightCheck) {
     const flushCards = allCards.filter(c => c.suit === flushCheck.suit);
     const straightFlush = getStraight(flushCards);
     if (straightFlush) {
       const isRoyal = getCardValue(straightFlush[0]) === 14; 
       return {
         rank: isRoyal ? HandRank.RoyalFlush : HandRank.StraightFlush,
         name: isRoyal ? 'Royal Flush' : 'Straight Flush',
         score: getScore(isRoyal ? HandRank.RoyalFlush : HandRank.StraightFlush, straightFlush),
         winningCards: straightFlush,
         coreCards: straightFlush 
       };
     }
  }

  // 2. Four of a Kind
  const quads = getNOfAKind(allCards, 4);
  if (quads) {
    const bestHand = fillHand(quads, allCards);
    return {
      rank: HandRank.FourOfAKind,
      name: 'Four of a Kind',
      score: getScore(HandRank.FourOfAKind, bestHand),
      winningCards: bestHand,
      coreCards: quads
    };
  }

  // 3. Full House
  const trips = getNOfAKind(allCards, 3);
  if (trips) {
    // Robust filtering by ID
    const remaining = allCards.filter(c => !trips.some(t => t.id === c.id));
    const pair = getNOfAKind(remaining, 2);
    if (pair) {
      const bestHand = [...trips, ...pair];
      return {
        rank: HandRank.FullHouse,
        name: 'Full House',
        score: getScore(HandRank.FullHouse, bestHand),
        winningCards: bestHand,
        coreCards: bestHand
      };
    }
  }

  // 4. Flush
  if (flushCheck) {
    return {
      rank: HandRank.Flush,
      name: 'Flush',
      score: getScore(HandRank.Flush, flushCheck.cards),
      winningCards: flushCheck.cards,
      coreCards: flushCheck.cards
    };
  }

  // 5. Straight
  if (straightCheck) {
    return {
      rank: HandRank.Straight,
      name: 'Straight',
      score: getScore(HandRank.Straight, straightCheck),
      winningCards: straightCheck,
      coreCards: straightCheck
    };
  }

  // 6. Three of a Kind
  if (trips) {
    const bestHand = fillHand(trips, allCards);
    return {
      rank: HandRank.ThreeOfAKind,
      name: 'Three of a Kind',
      score: getScore(HandRank.ThreeOfAKind, bestHand),
      winningCards: bestHand,
      coreCards: trips
    };
  }

  // 7. Two Pair
  const pair1 = getNOfAKind(allCards, 2);
  if (pair1) {
    const remaining = allCards.filter(c => !pair1.some(p => p.id === c.id));
    const pair2 = getNOfAKind(remaining, 2);
    if (pair2) {
      const bestHand = fillHand([...pair1, ...pair2], allCards);
      return {
        rank: HandRank.TwoPair,
        name: 'Two Pair',
        score: getScore(HandRank.TwoPair, bestHand),
        winningCards: bestHand,
        coreCards: [...pair1, ...pair2]
      };
    }
  }

  // 8. Pair
  if (pair1) {
    const bestHand = fillHand(pair1, allCards);
    return {
      rank: HandRank.Pair,
      name: 'Pair',
      score: getScore(HandRank.Pair, bestHand),
      winningCards: bestHand,
      coreCards: pair1
    };
  }

  // 9. High Card
  const bestFive = allCards.slice(0, 5);
  return {
    rank: HandRank.HighCard,
    name: 'High Card',
    score: getScore(HandRank.HighCard, bestFive),
    winningCards: bestFive,
    coreCards: [bestFive[0]]
  };
};

// --- Helpers ---

function getFlush(cards: Card[]): { suit: Suit, cards: Card[] } | null {
  const counts: Record<string, Card[]> = {};
  for (const c of cards) {
    if (!counts[c.suit]) counts[c.suit] = [];
    counts[c.suit].push(c);
  }
  for (const suit in counts) {
    if (counts[suit].length >= 5) {
      return { suit: suit as Suit, cards: counts[suit].slice(0, 5) };
    }
  }
  return null;
}

function getStraight(cards: Card[]): Card[] | null {
  const uniqueRanks = Array.from(new Set(cards.map(c => getCardValue(c)))).sort((a, b) => b - a);
  
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    const slice = uniqueRanks.slice(i, i + 5);
    if (slice[0] - slice[4] === 4) {
      return reconstructStraight(cards, slice);
    }
  }
  
  if (uniqueRanks.includes(14) && uniqueRanks.includes(2) && uniqueRanks.includes(3) && uniqueRanks.includes(4) && uniqueRanks.includes(5)) {
    return reconstructStraight(cards, [5, 4, 3, 2, 14]);
  }
  
  return null;
}

function reconstructStraight(cards: Card[], rankValues: number[]): Card[] {
  const straightCards: Card[] = [];
  for (const val of rankValues) {
    const targetVal = val === 1 ? 14 : val; 
    const found = cards.find(c => getCardValue(c) === targetVal);
    if (found) straightCards.push(found);
  }
  return straightCards;
}

function getNOfAKind(cards: Card[], n: number): Card[] | null {
  const counts: Record<number, Card[]> = {};
  for (const c of cards) {
    const v = getCardValue(c);
    if (!counts[v]) counts[v] = [];
    counts[v].push(c);
  }
  
  const matches = Object.values(counts).filter(arr => arr.length >= n);
  if (matches.length > 0) {
    matches.sort((a, b) => getCardValue(b[0]) - getCardValue(a[0]));
    return matches[0].slice(0, n);
  }
  return null;
}