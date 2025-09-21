
import { useState, useEffect, useCallback } from 'react';
import type { Deck, Card, StudySession } from '../types';

const STORAGE_KEY = 'memoDeckData';

const getInitialDecks = (): Deck[] => {
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    if (item) {
      const data = JSON.parse(item);
      // Basic validation
      if (Array.isArray(data.decks)) {
        return data.decks;
      }
    }
  } catch (error) {
    console.error("Error reading from localStorage", error);
  }
  return [];
};

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>(getInitialDecks);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ decks }));
      } catch (error) {
        console.error("Error writing to localStorage", error);
      }
    } else {
        setIsInitialized(true);
    }
  }, [decks, isInitialized]);

  const addDeck = useCallback((title: string, description: string) => {
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      title,
      description,
      cards: [],
      studyHistory: [],
      lastPlayed: null,
    };
    setDecks(prev => [...prev, newDeck]);
  }, []);

  const updateDeck = useCallback((deckId: string, title: string, description: string) => {
    setDecks(prev => prev.map(deck => 
      deck.id === deckId ? { ...deck, title, description } : deck
    ));
  }, []);

  const deleteDeck = useCallback((deckId: string) => {
    setDecks(prev => prev.filter(deck => deck.id !== deckId));
  }, []);
  
  const addCard = useCallback((deckId: string, front: string, back: string) => {
    const newCard: Card = { id: crypto.randomUUID(), front, back };
    setDecks(prev => prev.map(deck => 
      deck.id === deckId ? { ...deck, cards: [...deck.cards, newCard] } : deck
    ));
  }, []);

  const updateCard = useCallback((deckId: string, cardId: string, front: string, back: string) => {
    setDecks(prev => prev.map(deck => 
      deck.id === deckId 
        ? { ...deck, cards: deck.cards.map(card => card.id === cardId ? { ...card, front, back } : card) }
        : deck
    ));
  }, []);

  const deleteCard = useCallback((deckId: string, cardId: string) => {
    setDecks(prev => prev.map(deck => 
      deck.id === deckId 
        ? { ...deck, cards: deck.cards.filter(card => card.id !== cardId) }
        : deck
    ));
  }, []);

  const addStudySession = useCallback((deckId: string, session: Omit<StudySession, 'date'>) => {
      const newSession: StudySession = { ...session, date: new Date().toISOString() };
      setDecks(prev => prev.map(deck => 
          deck.id === deckId 
              ? { ...deck, studyHistory: [newSession, ...deck.studyHistory], lastPlayed: newSession.date } 
              : deck
      ));
  }, []);

  const exportDeck = useCallback((deckId: string) => {
      const deckToExport = decks.find(deck => deck.id === deckId);
      if (!deckToExport) return;

      const blob = new Blob([JSON.stringify(deckToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deckToExport.title.replace(/\s/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }, [decks]);

  const importDecks = useCallback((files: FileList) => {
      Array.from(files).forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
              try {
                  const content = e.target?.result;
                  if (typeof content !== 'string') throw new Error("Invalid file content");
                  const importedDeck = JSON.parse(content) as Deck;

                  // Basic validation
                  if (importedDeck.id && importedDeck.title && Array.isArray(importedDeck.cards)) {
                      setDecks(prev => {
                          const existingIds = new Set(prev.map(d => d.id));
                          if (existingIds.has(importedDeck.id)) {
                            alert(`A deck with ID ${importedDeck.id} (${importedDeck.title}) already exists. Skipping import.`);
                            return prev;
                          }
                          return [...prev, importedDeck];
                      });
                  } else {
                      throw new Error("Invalid deck format");
                  }
              } catch (error) {
                  console.error("Failed to import deck:", error);
                  alert(`Failed to import file "${file.name}". Please ensure it's a valid MemoDeck JSON file.`);
              }
          };
          reader.readAsText(file);
      });
  }, []);


  return { decks, addDeck, updateDeck, deleteDeck, addCard, updateCard, deleteCard, addStudySession, exportDeck, importDecks };
};
