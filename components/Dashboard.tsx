
import React, { useState } from 'react';
import type { Deck } from '../types';
import { Modal } from './Modal';
import { PlayIcon, EditIcon, DeleteIcon, ExportIcon, AddIcon } from './icons';

interface DeckItemProps {
  deck: Deck;
  onStudy: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}

const DeckItem: React.FC<DeckItemProps> = ({ deck, onStudy, onEdit, onDelete, onExport }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = () => {
    onDelete(deck.id);
    setShowConfirmDelete(false);
  };

  return (
    <>
      <div className="bg-surface rounded-lg shadow-lg p-6 flex flex-col justify-between transition-transform transform hover:-translate-y-1">
        <div>
          <h3 className="text-xl font-bold text-text-primary truncate">{deck.title}</h3>
          <p className="text-text-secondary mt-1 h-12 overflow-hidden text-ellipsis">{deck.description || 'No description'}</p>
          <div className="text-sm text-gray-400 mt-4 space-y-1">
            <p>{deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}</p>
            <p>Last played: {deck.lastPlayed ? new Date(deck.lastPlayed).toLocaleDateString() : 'Never'}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col space-y-3">
          <button
            onClick={() => onStudy(deck.id)}
            disabled={deck.cards.length === 0}
            className="w-full flex items-center justify-center bg-primary hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            Play
          </button>
          <div className="flex justify-around items-center">
            <button onClick={() => onEdit(deck.id)} className="text-gray-400 hover:text-white transition-colors p-2"><EditIcon className="h-6 w-6" /></button>
            <button onClick={() => setShowConfirmDelete(true)} className="text-gray-400 hover:text-red-500 transition-colors p-2"><DeleteIcon className="h-6 w-6" /></button>
            <button onClick={() => onExport(deck.id)} className="text-gray-400 hover:text-white transition-colors p-2"><ExportIcon className="h-6 w-6" /></button>
          </div>
        </div>
      </div>
      <Modal isOpen={showConfirmDelete} onClose={() => setShowConfirmDelete(false)} title="Delete Deck">
        <p className="text-text-secondary mb-4">Are you sure you want to delete the deck "{deck.title}"? This action cannot be undone.</p>
        <div className="flex justify-end space-x-3">
          <button onClick={() => setShowConfirmDelete(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
          <button onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded">Delete</button>
        </div>
      </Modal>
    </>
  );
};


interface DeckFormProps {
    onSave: (title: string, description: string) => void;
    onCancel: () => void;
}

const DeckForm: React.FC<DeckFormProps> = ({ onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onSave(title, description);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-text-secondary">Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-primary focus:border-primary"
                    required
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-primary focus:border-primary"
                />
            </div>
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded">Create Deck</button>
            </div>
        </form>
    );
};

interface DashboardProps {
  decks: Deck[];
  onAddDeck: (title: string, description: string) => void;
  onDeleteDeck: (id: string) => void;
  onEditDeck: (id: string) => void;
  onExportDeck: (id: string) => void;
  onStudyDeck: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ decks, onAddDeck, onDeleteDeck, onEditDeck, onExportDeck, onStudyDeck }) => {
    const [isCreatingDeck, setIsCreatingDeck] = useState(false);

    const handleSaveDeck = (title: string, description: string) => {
        onAddDeck(title, description);
        setIsCreatingDeck(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">My Decks</h2>
                <button
                    onClick={() => setIsCreatingDeck(true)}
                    className="flex items-center bg-secondary hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                    <AddIcon className="h-5 w-5 mr-2" />
                    Create New Deck
                </button>
            </div>

            {decks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {decks.map(deck => (
                        <DeckItem
                            key={deck.id}
                            deck={deck}
                            onStudy={onStudyDeck}
                            onEdit={onEditDeck}
                            onDelete={onDeleteDeck}
                            onExport={onExportDeck}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-surface rounded-lg">
                    <h3 className="text-xl font-semibold text-text-primary">No decks yet!</h3>
                    <p className="text-text-secondary mt-2">Click "Create New Deck" to get started.</p>
                </div>
            )}
            
            <Modal isOpen={isCreatingDeck} onClose={() => setIsCreatingDeck(false)} title="Create New Deck">
                <DeckForm onSave={handleSaveDeck} onCancel={() => setIsCreatingDeck(false)} />
            </Modal>
        </div>
    );
};
