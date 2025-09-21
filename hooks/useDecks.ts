import { useState, useEffect, useCallback } from 'react';
import type { Deck, Card, StudySession } from '../types';

const API_URL = 'http://localhost:3001/api';

export const useDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await fetch(`${API_URL}/decks`);
        const data = await response.json();
        setDecks(data);
      } catch (error) {
        console.error('Error fetching decks:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    fetchDecks();
  }, []);

  const addDeck = useCallback(async (title: string, description: string) => {
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      title,
      description,
      cards: [],
      studyHistory: [],
      lastPlayed: null,
    };
    try {
      const response = await fetch(`${API_URL}/decks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeck),
      });
      const createdDeck = await response.json();
      setDecks(prev => [...prev, createdDeck]);
    } catch (error) {
      console.error('Error adding deck:', error);
    }
  }, []);

  const updateDeck = useCallback(async (deckId: string, title: string, description: string) => {
    const deckToUpdate = decks.find(deck => deck.id === deckId);
    if (!deckToUpdate) return;
    const updatedDeck = { ...deckToUpdate, title, description };
    try {
      await fetch(`${API_URL}/decks/${deckId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDeck),
      });
      setDecks(prev => prev.map(deck => (deck.id === deckId ? updatedDeck : deck)));
    } catch (error) {
      console.error('Error updating deck:', error);
    }
  }, [decks]);

  const deleteDeck = useCallback(async (deckId: string) => {
    try {
      await fetch(`${API_URL}/decks/${deckId}`, { method: 'DELETE' });
      setDecks(prev => prev.filter(deck => deck.id !== deckId));
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  }, []);

  const addCard = useCallback(async (deckId: string, front: string, back: string) => {
    const newCard: Card = { id: crypto.randomUUID(), front, back };
    const deckToUpdate = decks.find(deck => deck.id === deckId);
    if (!deckToUpdate) return;
    const updatedDeck = { ...deckToUpdate, cards: [...deckToUpdate.cards, newCard] };
    try {
      await fetch(`${API_URL}/decks/${deckId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDeck),
      });
      setDecks(prev => prev.map(deck => (deck.id === deckId ? updatedDeck : deck)));
    } catch (error) {
      console.error('Error adding card:', error);
    }
  }, [decks]);

  const updateCard = useCallback(async (deckId: string, cardId: string, front: string, back: string) => {
    const deckToUpdate = decks.find(deck => deck.id === deckId);
    if (!deckToUpdate) return;
    const updatedCards = deckToUpdate.cards.map(card => (card.id === cardId ? { ...card, front, back } : card));
    const updatedDeck = { ...deckToUpdate, cards: updatedCards };
    try {
      await fetch(`${API_URL}/decks/${deckId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDeck),
      });
      setDecks(prev => prev.map(deck => (deck.id === deckId ? updatedDeck : deck)));
    } catch (error) {
      console.error('Error updating card:', error);
    }
  }, [decks]);

  const deleteCard = useCallback(async (deckId: string, cardId: string) => {
    const deckToUpdate = decks.find(deck => deck.id === deckId);
    if (!deckToUpdate) return;
    const updatedCards = deckToUpdate.cards.filter(card => card.id !== cardId);
    const updatedDeck = { ...deckToUpdate, cards: updatedCards };
    try {
      await fetch(`${API_URL}/decks/${deckId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDeck),
      });
      setDecks(prev => prev.map(deck => (deck.id === deckId ? updatedDeck : deck)));
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  }, [decks]);

  const addStudySession = useCallback(async (deckId: string, session: Omit<StudySession, 'date'>) => {
    const newSession: StudySession = { ...session, date: new Date().toISOString() };
    const deckToUpdate = decks.find(deck => deck.id === deckId);
    if (!deckToUpdate) return;
    const updatedDeck = {
      ...deckToUpdate,
      studyHistory: [newSession, ...deckToUpdate.studyHistory],
      lastPlayed: newSession.date,
    };
    try {
      await fetch(`${API_URL}/decks/${deckId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDeck),
      });
      setDecks(prev => prev.map(deck => (deck.id === deckId ? updatedDeck : deck)));
    } catch (error) {
      console.error('Error adding study session:', error);
    }
  }, [decks]);

  return { decks, addDeck, updateDeck, deleteDeck, addCard, updateCard, deleteCard, addStudySession, isInitialized };
};
