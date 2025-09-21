
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Deck, Card } from '../types';
import { Modal } from './Modal';
import { CloseIcon, CheckIcon } from './icons';


// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface StudyViewProps {
  deck: Deck;
  onSessionEnd: (deckId: string, result: { known: number; unknown: number; completed: boolean, knownCardIds: string[], unknownCardIds: string[] }) => void;
}

export const StudyView: React.FC<StudyViewProps> = ({ deck, onSessionEnd }) => {
  const [pendingCards, setPendingCards] = useState<Card[]>(() => shuffleArray(deck.cards));
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [knownCardIds, setKnownCardIds] = useState<string[]>([]);
  const [unknownCardIds, setUnknownCardIds] = useState<string[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  
  const initialCardCount = useMemo(() => deck.cards.length, [deck.cards.length]);

  const finishSession = useCallback((completed: boolean) => {
    onSessionEnd(deck.id, { known: knownCount, unknown: unknownCount, completed, knownCardIds, unknownCardIds });
  }, [deck.id, knownCount, unknownCount, onSessionEnd, knownCardIds, unknownCardIds]);

  // HOOKS MOVED TO TOP LEVEL TO FIX ERROR #310
  useEffect(() => {
    // This effect handles finishing a session when all cards have been successfully answered.
    if (initialCardCount > 0 && pendingCards.length === 0 && (knownCount > 0 || unknownCount > 0)) {
      finishSession(true);
    }
  }, [pendingCards.length, initialCardCount, knownCount, unknownCount, finishSession]);
  
  useEffect(() => {
    // This effect handles the case where the user starts a session with a deck that has no cards.
    if (initialCardCount === 0) {
        finishSession(true);
    }
  }, [initialCardCount, finishSession]);

  const currentCard = pendingCards.length > 0 ? pendingCards[0] : null;

  const handleNextCard = (knewIt: boolean) => {
    if (!currentCard) return;

    setIsFlipped(false);
    
    // Use a timeout to allow the card flip animation to start before content changes
    setTimeout(() => {
        if (knewIt) {
            setKnownCount(prev => prev + 1);
            setKnownCardIds(prev => [...prev, currentCard.id]);
            setPendingCards(prev => prev.slice(1));
        } else {
            setUnknownCount(prev => prev + 1);
            setUnknownCardIds(prev => Array.from(new Set([...prev, currentCard.id])));
            setPendingCards(prev => {
                // Move the current card to the end of the array
                const newQueue = [...prev.slice(1), prev[0]];
                return newQueue;
            });
        }
    }, 150);
  };
  
  const handleExitConfirm = () => {
    finishSession(false);
    setIsExitModalOpen(false);
  };

  if (!currentCard) {
    // This view is now only for rendering.
    // It's shown for an empty deck, or briefly when the last card is answered.
    return (
        <div className="text-center p-8 flex items-center justify-center h-full">
            <h2 className="text-2xl font-bold">
                {initialCardCount === 0 ? "This deck has no cards." : "Calculating results..."}
            </h2>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4 text-lg px-2">
                <span className="font-semibold text-green-400">✅ Know: {knownCount}</span>
                <span className="font-semibold text-red-400">❌ Don't Know: {unknownCount}</span>
                <span className="font-semibold text-gray-400">⏳ Pending: {pendingCards.length}</span>
            </div>

            <div 
                className="w-full h-80 perspective-1000"
            >
                <div 
                    className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                >
                    <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 bg-surface rounded-lg shadow-2xl">
                        <p className="text-3xl text-center text-text-primary">{currentCard.front}</p>
                    </div>
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-6 bg-primary rounded-lg shadow-2xl">
                        <p className="text-3xl text-center text-white">{currentCard.back}</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 flex justify-center space-x-4">
                {!isFlipped ? (
                    <button 
                        onClick={() => setIsFlipped(true)}
                        className="w-full bg-secondary hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
                    >
                        Show Answer
                    </button>
                ) : (
                    <>
                        <button 
                            onClick={() => handleNextCard(false)}
                            className="w-1/2 bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors flex items-center justify-center"
                        >
                           <CloseIcon className="h-7 w-7 mr-2"/> I Didn't Know
                        </button>
                        <button 
                            onClick={() => handleNextCard(true)}
                            className="w-1/2 bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors flex items-center justify-center"
                        >
                            <CheckIcon className="h-7 w-7 mr-2"/> I Knew It
                        </button>
                    </>
                )}
            </div>
        </div>

        <button onClick={() => setIsExitModalOpen(true)} className="absolute top-20 right-8 text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="h-8 w-8"/>
        </button>

        <Modal isOpen={isExitModalOpen} onClose={() => setIsExitModalOpen(false)} title="End Session">
            <p className="text-text-secondary mb-4">Are you sure you want to end this study session? Your progress will be saved.</p>
            <div className="flex justify-end space-x-3">
                <button onClick={() => setIsExitModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Continue Studying</button>
                <button onClick={handleExitConfirm} className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded">End Session</button>
            </div>
        </Modal>

        <style>{`
            .perspective-1000 { perspective: 1000px; }
            .transform-style-preserve-3d { transform-style: preserve-3d; }
            .rotate-y-180 { transform: rotateY(180deg); }
            .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        `}</style>
    </div>
  );
};