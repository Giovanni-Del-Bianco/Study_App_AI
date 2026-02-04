import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';

type Difficulty = 'easy' | 'medium' | 'hard';

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (options: { count: number; difficulty: Difficulty; topic: string }) => void;
  title: string;
  language: 'en' | 'it';
}

const QuantityModal: React.FC<QuantityModalProps> = ({ isOpen, onClose, onSubmit, title, language }) => {
  const [count, setCount] = useState<number | string>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [topic, setTopic] = useState('');
  
  useEffect(() => {
    if (isOpen) {
        setCount(10); // Reset to default when opening
        setDifficulty('medium');
        setTopic('');
    }
  }, [isOpen]);
  
  const content = {
      en: {
          subtitle: "How many items should we generate?",
          custom: "Custom",
          generate: "Generate",
          difficulty: "Difficulty",
          easy: "Easy",
          medium: "Medium",
          hard: "Hard",
          topic: "What should be the topic? (Optional)",
          topicPlaceholder: "e.g., 'The role of mitochondria' or 'Key events of World War II'",
      },
      it: {
          subtitle: "Quanti elementi dobbiamo generare?",
          custom: "Personalizzato",
          generate: "Genera",
          difficulty: "Difficoltà",
          easy: "Facile",
          medium: "Media",
          hard: "Difficile",
          topic: "Quale dovrebbe essere l'argomento? (Opzionale)",
          topicPlaceholder: "es. 'Il ruolo dei mitocondri' o 'Eventi chiave della Seconda Guerra Mondiale'",
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericCount = Number(count);
    if (numericCount > 0 && numericCount <= 100) { // Limit to 100
      onSubmit({ count: numericCount, difficulty, topic });
    }
  };

  if (!isOpen) return null;

  const isCustom = typeof count === 'string' || (typeof count === 'number' && ![10, 20, 30].includes(count));

  const DifficultyButton: React.FC<{ level: Difficulty, label: string }> = ({ level, label }) => (
    <button
        type="button"
        onClick={() => setDifficulty(level)}
        className={`flex-1 p-2 text-sm rounded-md font-semibold transition-colors ${difficulty === level ? 'bg-sky-600 text-white' : 'bg-slate-700/70 hover:bg-slate-700'}`}
    >
        {label}
    </button>
  );

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-sm"
        onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md p-8 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl m-4"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors">
            <CloseIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-slate-100 mb-2">{title}</h2>
        <p className="text-slate-400 mb-6">{content[language].subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quantity Selection */}
            <div>
                 <div className="flex flex-col space-y-3">
                    {[10, 20, 30].map(val => (
                         <button
                            type="button"
                            key={val}
                            onClick={() => setCount(val)}
                            className={`p-3 rounded-md font-semibold transition-colors w-full ${count === val ? 'bg-slate-600 text-white' : 'bg-slate-700/70 hover:bg-slate-700'}`}
                         >
                            {val}
                         </button>
                    ))}
                    <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder={content[language].custom}
                        value={isCustom && count ? count.toString() : ''}
                        onFocus={() => { if (!isCustom) setCount(''); }}
                        onChange={(e) => setCount(e.target.value)}
                        className={`w-full p-3 rounded-md font-semibold transition-colors text-center bg-slate-700/70 hover:bg-slate-700 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-400 ${isCustom ? 'ring-2 ring-sky-500' : ''}`}
                    />
                </div>
            </div>

            {/* Difficulty Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{content[language].difficulty}</label>
                <div className="flex items-center gap-2 p-1 bg-slate-900/50 rounded-lg">
                    <DifficultyButton level="easy" label={content[language].easy} />
                    <DifficultyButton level="medium" label={content[language].medium} />
                    <DifficultyButton level="hard" label={content[language].hard} />
                </div>
            </div>
            
            {/* Topic Input */}
            <div>
                <label htmlFor="topic-input" className="block text-sm font-medium text-slate-300 mb-2">{content[language].topic}</label>
                <textarea
                    id="topic-input"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={content[language].topicPlaceholder}
                    rows={3}
                    className="w-full p-3 bg-slate-700/70 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                />
            </div>

             <button
                type="submit"
                disabled={!count || Number(count) <= 0}
                className="w-full py-3 font-semibold text-white bg-sky-600 rounded-md shadow-lg transition-all duration-300 ease-in-out hover:bg-sky-500 disabled:bg-slate-700 disabled:cursor-not-allowed"
            >
                {content[language].generate}
            </button>
        </form>
      </div>
    </div>
  );
};

export default QuantityModal;
