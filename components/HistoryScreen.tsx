import React, { useState } from 'react';
import { HistoryFlashcard, HistoryQuizQuestion } from '../types';
import { ArrowLeftIcon, CheckIcon, CloseIcon } from './icons';

interface HistoryScreenProps {
  flashcardHistory: HistoryFlashcard[];
  quizHistory: HistoryQuizQuestion[];
  onBack: () => void;
  language: 'en' | 'it';
}

type ActiveTab = 'flashcards' | 'quiz';
type Filter = 'all' | 'correct' | 'incorrect';

const HistoryScreen: React.FC<HistoryScreenProps> = ({ flashcardHistory, quizHistory, onBack, language }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('flashcards');
    const [filter, setFilter] = useState<Filter>('all');

    const content = {
        en: {
            title: "Study History",
            flashcards: "Flashcards",
            quiz: "Quiz",
            all: "All",
            correct: "Correct",
            incorrect: "Incorrect",
            noHistoryFlashcards: "You have no flashcard history yet.",
            noHistoryQuiz: "You have no quiz history yet.",
            backToDashboard: "Back to Dashboard",
            yourAnswer: "Your answer:",
            correctAnswer: "Correct answer:",
            explanation: "Explanation:",
        },
        it: {
            title: "Cronologia Studio",
            flashcards: "Flashcard",
            quiz: "Quiz",
            all: "Tutto",
            correct: "Corrette",
            incorrect: "Sbagliate",
            noHistoryFlashcards: "Non hai ancora una cronologia di flashcard.",
            noHistoryQuiz: "Non hai ancora una cronologia di quiz.",
            backToDashboard: "Torna alla Dashboard",
            yourAnswer: "La tua risposta:",
            correctAnswer: "Risposta corretta:",
            explanation: "Spiegazione:",
        }
    };

    const filteredFlashcards = flashcardHistory.filter(f => {
        if (filter === 'all') return true;
        return f.status === filter;
    }).reverse();

    const filteredQuiz = quizHistory.filter(q => {
        if (filter === 'all') return true;
        return q.status === filter;
    }).reverse();
    
    const TabButton: React.FC<{tab: ActiveTab, label: string}> = ({ tab, label }) => (
        <button 
            onClick={() => { setActiveTab(tab); setFilter('all'); }}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-sky-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
        >
            {label}
        </button>
    );

    const FilterButton: React.FC<{currentFilter: Filter, label: string}> = ({ currentFilter, label }) => (
        <button 
            onClick={() => setFilter(currentFilter)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${filter === currentFilter ? 'bg-slate-600 text-white font-medium' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-4 sm:p-0 max-w-4xl w-full mx-auto animate-fade-in">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6 text-sm font-medium">
                <ArrowLeftIcon className="h-4 w-4" />
                {content[language].backToDashboard}
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-6 text-center">{content[language].title}</h1>
            
            <div className="flex justify-center gap-4 mb-6">
                <TabButton tab="flashcards" label={content[language].flashcards} />
                <TabButton tab="quiz" label={content[language].quiz} />
            </div>

            <div className="flex justify-center gap-3 mb-6 p-2 bg-slate-900/50 rounded-full">
                <FilterButton currentFilter="all" label={content[language].all} />
                <FilterButton currentFilter="correct" label={content[language].correct} />
                <FilterButton currentFilter="incorrect" label={content[language].incorrect} />
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
                {activeTab === 'flashcards' && (
                    <div className="space-y-4">
                        {filteredFlashcards.length > 0 ? filteredFlashcards.map((item, index) => (
                            <div key={index} className="p-4 bg-slate-900/60 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-slate-100">{item.term}</h3>
                                    {item.status === 'correct' 
                                        ? <CheckIcon className="h-6 w-6 text-emerald-500 flex-shrink-0" /> 
                                        : <CloseIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                                    }
                                </div>
                                <p className="text-slate-300 mt-2">{item.definition}</p>
                            </div>
                        )) : <p className="text-center text-slate-400 py-8">{content[language].noHistoryFlashcards}</p>}
                    </div>
                )}
                {activeTab === 'quiz' && (
                    <div className="space-y-4">
                        {filteredQuiz.length > 0 ? filteredQuiz.map((item, index) => (
                            <div key={index} className="p-4 bg-slate-900/60 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="font-semibold text-md text-slate-100">{index + 1}. {item.question}</h3>
                                    {item.status === 'correct' 
                                        ? <CheckIcon className="h-6 w-6 text-emerald-500 flex-shrink-0" /> 
                                        : <CloseIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                                    }
                                </div>
                                <div className="mt-3 text-sm space-y-2 text-slate-300 border-t border-slate-700 pt-3">
                                    <p><span className={`font-semibold ${item.status === 'incorrect' ? 'text-red-400' : 'text-slate-100'}`}>{content[language].yourAnswer}</span> {item.userAnswer}</p>
                                    {item.status === 'incorrect' && <p><span className="font-semibold text-emerald-400">{content[language].correctAnswer}</span> {item.correctAnswer}</p>}
                                    <p className="pt-1"><span className="font-semibold text-sky-400">{content[language].explanation}</span> {item.explanation}</p>
                                </div>
                            </div>
                        )) : <p className="text-center text-slate-400 py-8">{content[language].noHistoryQuiz}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryScreen;
