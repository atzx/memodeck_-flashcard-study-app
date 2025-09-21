
import React, { useState, useMemo } from 'react';
import type { Deck } from './types';
import { useDecks } from './hooks/useDecks';
import { Dashboard } from './components/Dashboard';
import { EditDeckView } from './components/EditDeckView';
import { StudyView } from './components/StudyView';
import { StudySummary } from './components/StudySummary';

type View = 'dashboard' | 'edit' | 'study' | 'summary';

interface StudyResult {
    known: number;
    unknown: number;
    completed: boolean;
    knownCardIds: string[];
    unknownCardIds: string[];
}

const Header: React.FC = () => {
    return (
        <header className="bg-surface p-4 shadow-md flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">MemoDeck</h1>
        </header>
    );
};


const App: React.FC = () => {
    const { decks, addDeck, updateDeck, deleteDeck, addCard, updateCard, deleteCard, addStudySession, exportDeck, importDecks } = useDecks();
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
    const [lastStudyResult, setLastStudyResult] = useState<StudyResult | null>(null);

    const activeDeck = useMemo(() => decks.find(d => d.id === activeDeckId) || null, [decks, activeDeckId]);

    const handleStartStudy = (deckId: string) => {
        setActiveDeckId(deckId);
        setCurrentView('study');
    };

    const handleEditDeck = (deckId: string) => {
        setActiveDeckId(deckId);
        setCurrentView('edit');
    };

    const handleFinishStudy = (deckId: string, result: StudyResult) => {
        addStudySession(deckId, result);
        setActiveDeckId(deckId);
        setLastStudyResult(result);
        setCurrentView('summary');
    };
    
    const navigateToDashboard = () => {
        setActiveDeckId(null);
        setLastStudyResult(null);
        setCurrentView('dashboard');
    };

    const renderContent = () => {
        switch (currentView) {
            case 'edit':
                return activeDeck && (
                    <EditDeckView
                        deck={activeDeck}
                        onBack={navigateToDashboard}
                        onUpdateDeck={updateDeck}
                        onAddCard={addCard}
                        onUpdateCard={updateCard}
                        onDeleteCard={deleteCard}
                    />
                );
            case 'study':
                return activeDeck && (
                    <StudyView
                        deck={activeDeck}
                        onSessionEnd={handleFinishStudy}
                    />
                );
            case 'summary':
                return activeDeck && lastStudyResult && (
                    <StudySummary
                        deckTitle={activeDeck.title}
                        result={lastStudyResult}
                        onDone={navigateToDashboard}
                    />
                );
            case 'dashboard':
            default:
                return (
                    <Dashboard
                        decks={decks}
                        onAddDeck={addDeck}
                        onDeleteDeck={deleteDeck}
                        onEditDeck={handleEditDeck}
                        onExportDeck={exportDeck}
                        onStudyDeck={handleStartStudy}
                        onImportDecks={importDecks}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />
            <main className="p-4 sm:p-6 md:p-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
