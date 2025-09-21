
export interface Card {
  id: string;
  front: string;
  back: string;
}

export interface StudySession {
  date: string;
  known: number;
  unknown: number;
  completed: boolean;
  knownCardIds: string[];
  unknownCardIds: string[];
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Card[];
  studyHistory: StudySession[];
  lastPlayed: string | null;
}