
import React, { useState, useMemo } from 'react';
import type { Deck, Card, StudySession } from '../types';
import { Modal } from './Modal';
import { BackIcon, EditIcon, DeleteIcon, AddIcon, CheckIcon, CloseIcon } from './icons';

interface EditDeckViewProps {
  deck: Deck;
  onBack: () => void;
  onUpdateDeck: (deckId: string, title: string, description: string) => void;
  onAddCard: (deckId: string, front: string, back: string) => void;
  onUpdateCard: (deckId: string, cardId: string, front: string, back: string) => void;
  onDeleteCard: (deckId: string, cardId: string) => void;
}

const CardForm: React.FC<{
    deckId: string;
    onAddCard: (deckId: string, front: string, back: string) => void;
}> = ({ deckId, onAddCard }) => {
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (front.trim() && back.trim()) {
            onAddCard(deckId, front, back);
            setFront('');
            setBack('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-surface p-4 rounded-lg shadow-md space-y-4">
            <h3 className="text-lg font-semibold">Add New Card</h3>
            <div>
                <textarea
                    placeholder="Front side..."
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    rows={2}
                    className="w-full bg-gray-700 border-gray-600 rounded-md text-white p-2 focus:ring-primary focus:border-primary"
                    required
                />
            </div>
            <div>
                <textarea
                    placeholder="Back side..."
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    rows={2}
                    className="w-full bg-gray-700 border-gray-600 rounded-md text-white p-2 focus:ring-primary focus:border-primary"
                    required
                />
            </div>
            <button type="submit" className="w-full flex items-center justify-center bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-colors">
                <AddIcon className="h-5 w-5 mr-2" /> Add Card
            </button>
        </form>
    );
};

const SessionDetail: React.FC<{ session: StudySession, cardMap: Map<string, Card> }> = ({ session, cardMap }) => {
    const knownCards = (session.knownCardIds || []).map(id => cardMap.get(id)).filter(Boolean) as Card[];
    const unknownCards = (session.unknownCardIds || []).map(id => cardMap.get(id)).filter(Boolean) as Card[];

    const CardListItem: React.FC<{ card: Card }> = ({ card }) => (
        <div className="bg-gray-800 p-2 rounded-md">
            <p className="font-semibold text-text-primary text-sm">{card.front}</p>
            <p className="text-text-secondary text-xs mt-1">{card.back}</p>
        </div>
    );

    return (
        <div className="bg-gray-900 p-3 mt-2 rounded-md space-y-4">
            <div>
                <h4 className="font-semibold text-green-400 mb-2">✅ Cards you knew ({knownCards.length})</h4>
                {knownCards.length > 0 ? (
                    <div className="space-y-2">
                        {knownCards.map(card => <CardListItem key={card.id} card={card} />)}
                    </div>
                ) : <p className="text-text-secondary text-sm">No cards were marked as known.</p>}
            </div>
            <div>
                <h4 className="font-semibold text-red-400 mb-2">❌ Cards you missed ({unknownCards.length})</h4>
                {unknownCards.length > 0 ? (
                    <div className="space-y-2">
                        {unknownCards.map(card => <CardListItem key={card.id} card={card} />)}
                    </div>
                ) : <p className="text-text-secondary text-sm">No cards were marked as missed.</p>}
            </div>
        </div>
    );
};

export const EditDeckView: React.FC<EditDeckViewProps> = ({ deck, onBack, onUpdateDeck, onAddCard, onUpdateCard, onDeleteCard }) => {
    const [title, setTitle] = useState(deck.title);
    const [description, setDescription] = useState(deck.description);
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const [expandedSessionDate, setExpandedSessionDate] = useState<string | null>(null);
    
    const cardMap = useMemo(() => new Map(deck.cards.map(c => [c.id, c])), [deck.cards]);

    const handleDeckInfoSave = () => {
        onUpdateDeck(deck.id, title, description);
    };

    const handleUpdateCardSubmit = (updatedCard: Card) => {
        onUpdateCard(deck.id, updatedCard.id, updatedCard.front, updatedCard.back);
        setEditingCard(null);
    };
    
    const toggleSession = (date: string) => {
        setExpandedSessionDate(prev => (prev === date ? null : date));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={onBack} className="flex items-center text-primary mb-6 hover:underline">
                <BackIcon className="h-5 w-5 mr-2" /> Back to Dashboard
            </button>

            <div className="bg-surface p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-bold mb-4">Edit Deck Info</h2>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="deckTitle" className="block text-sm font-medium text-text-secondary">Title</label>
                        <input
                            type="text"
                            id="deckTitle"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleDeckInfoSave}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-primary focus:border-primary"
                        />
                    </div>
                     <div>
                        <label htmlFor="deckDescription" className="block text-sm font-medium text-text-secondary">Description</label>
                        <textarea
                            id="deckDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={handleDeckInfoSave}
                            rows={3}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <CardForm deckId={deck.id} onAddCard={onAddCard} />
                    <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4">Study History</h3>
                        {deck.studyHistory.length > 0 ? (
                            <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {deck.studyHistory.map(session => (
                                    <li key={session.date} className="bg-surface p-3 rounded-md text-sm transition-shadow hover:shadow-lg">
                                        <button onClick={() => toggleSession(session.date)} className="w-full text-left">
                                            <div className="flex justify-between items-center">
                                                <span>{new Date(session.date).toLocaleString()}</span>
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-green-400">✅ {session.known}</span>
                                                    <span className="text-red-400">❌ {session.unknown}</span>
                                                    <span title={session.completed ? "Session Completed" : "Session Interrupted"}>
                                                        {session.completed ? '🏆' : '⏳'}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                        {expandedSessionDate === session.date && <SessionDetail session={session} cardMap={cardMap} />}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-text-secondary">No study sessions recorded yet.</p>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold mb-4">Cards ({deck.cards.length})</h3>
                     <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {deck.cards.length > 0 ? deck.cards.map(card => (
                            <div key={card.id} className="bg-surface p-4 rounded-lg flex justify-between items-start">
                                <div className="flex-1 pr-4">
                                    <p className="font-semibold text-text-primary break-words">{card.front}</p>
                                    <p className="text-text-secondary break-words mt-1">{card.back}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => setEditingCard(card)} className="text-gray-400 hover:text-white p-1"><EditIcon className="h-5 w-5"/></button>
                                    <button onClick={() => onDeleteCard(deck.id, card.id)} className="text-gray-400 hover:text-red-500 p-1"><DeleteIcon className="h-5 w-5"/></button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-text-secondary text-center py-8">This deck has no cards. Add one to get started!</p>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={!!editingCard} onClose={() => setEditingCard(null)} title="Edit Card">
                {editingCard && (
                    <EditCardForm card={editingCard} onSave={handleUpdateCardSubmit} onCancel={() => setEditingCard(null)} />
                )}
            </Modal>
        </div>
    );
};

const EditCardForm: React.FC<{
    card: Card;
    onSave: (card: Card) => void;
    onCancel: () => void;
}> = ({ card, onSave, onCancel }) => {
    const [front, setFront] = useState(card.front);
    const [back, setBack] = useState(card.back);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...card, front, back });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary">Front</label>
                <textarea value={front} onChange={e => setFront(e.target.value)} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-primary focus:border-primary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary">Back</label>
                <textarea value={back} onChange={e => setBack(e.target.value)} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-primary focus:border-primary" />
            </div>
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded">Save Changes</button>
            </div>
        </form>
    );
};