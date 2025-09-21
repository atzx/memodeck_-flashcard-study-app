
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

const Header: React.FC<{ onImport: (files: FileList) => void }> = ({ onImport }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onImport(e.target.files);
        }
    };

    return (
        <header className="bg-surface p-4 shadow-md flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">MemoDeck</h1>
            <div>
                <label htmlFor="import-decks" className="bg-secondary hover:bg-green-600 text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors duration-200">
                    Import Deck(s)
                </label>
                <input
                    id="import-decks"
                    type="file"
                    multiple
                    accept=".json"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
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
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header onImport={importDecks} />
            <main className="p-4 sm:p-6 md:p-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;