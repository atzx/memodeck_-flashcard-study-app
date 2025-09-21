
import React from 'react';

interface StudySummaryProps {
  deckTitle: string;
  result: {
    known: number;
    unknown: number;
    completed: boolean;
  };
  onDone: () => void;
}

export const StudySummary: React.FC<StudySummaryProps> = ({ deckTitle, result, onDone }) => {
  const totalAttempted = result.known + result.unknown;
  const accuracy = totalAttempted > 0 ? Math.round((result.known / totalAttempted) * 100) : 0;

  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="bg-surface rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">
          {result.completed ? "Deck Completed! 🎉" : "Session Finished"}
        </h2>
        <p className="text-text-secondary mb-6">Results for "{deckTitle}"</p>

        <div className="space-y-4 text-lg mb-8">
            <div className="flex justify-between bg-gray-700 p-3 rounded-md">
                <span className="font-semibold">Correct Answers:</span>
                <span className="font-bold text-green-400">✅ {result.known}</span>
            </div>
            <div className="flex justify-between bg-gray-700 p-3 rounded-md">
                <span className="font-semibold">Incorrect Answers:</span>
                <span className="font-bold text-red-400">❌ {result.unknown}</span>
            </div>
            <div className="flex justify-between bg-gray-700 p-3 rounded-md">
                <span className="font-semibold">Accuracy:</span>
                <span className="font-bold text-secondary">{accuracy}%</span>
            </div>
        </div>

        <button
          onClick={onDone}
          className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};
