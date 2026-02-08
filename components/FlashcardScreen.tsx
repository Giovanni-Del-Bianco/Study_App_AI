
import React, { useState, useEffect, useMemo } from 'react';
import { Flashcard } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, ReloadIcon, CheckIcon, CloseIcon, HintIcon } from './icons';

interface FlashcardScreenProps {
  flashcards: Flashcard[];
  onRegenerate: () => void;
  onBack: () => void;
  language: 'en' | 'it';
  onSessionComplete: (results: { card: Flashcard; status: 'correct' | 'incorrect' }[]) => void;
  isCorrectionSession?: boolean;
}

const FlashcardScreen: React.FC<FlashcardScreenProps> = ({ flashcards, onRegenerate, onBack, language, onSessionComplete, isCorrectionSession = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [results, setResults] = useState<('correct' | 'incorrect' | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const content = {
      en: {
          noFlashcards: "No Flashcards Generated",
          noFlashcardsDesc: "Something went wrong. Please try again.",
          tryAgain: "Try Again",
          flipHint: "Click card to flip",
          cardCounter: "Card",
          of: "of",
          newCards: "Generate New Cards",
          backToDashboard: "Back to Dashboard",
          sessionComplete: "Session Complete!",
          yourScore: "You knew:",
          reviewAgain: "Review Again",
          iKnewIt: "I Knew It",
          iMissedIt: "I Missed It",
          hint: "Hint",
          showHint: "Show Hint",
      },
      it: {
          noFlashcards: "Nessuna Flashcard Generata",
          noFlashcardsDesc: "Qualcosa è andato storto. Per favore riprova.",
          tryAgain: "Riprova",
          flipHint: "Clicca sulla scheda per girarla",
          cardCounter: "Scheda",
          of: "di",
          newCards: "Genera Nuove Schede",
          backToDashboard: "Torna alla Dashboard",
          sessionComplete: "Sessione Completata!",
          yourScore: "Risposte corrette:",
          reviewAgain: "Ricomincia",
          iKnewIt: "La Sapevo",
          iMissedIt: "Sbagliato",
          hint: "Suggerimento",
          showHint: "Mostra Suggerimento",
      }
  };

  useEffect(() => {
    setResults(new Array(flashcards.length).fill(null));
    setShowResults(false);
    setShowHint(false);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards]);
  
  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        setShowHint(false);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setIsFlipped(false);
        setShowHint(false);
        setIsAnimating(false);
      }, 150);
    }
  };
  
  const handleAnswer = (result: 'correct' | 'incorrect') => {
      const newResults = [...results];
      newResults[currentIndex] = result;
      setResults(newResults);

      if (currentIndex < flashcards.length - 1) {
          setIsAnimating(true);
          setTimeout(() => {
              setCurrentIndex(prev => prev + 1);
              setIsFlipped(false);
              setShowHint(false);
              setIsAnimating(false);
          }, 300);
      } else {
          const finalResults = flashcards.map((card, index) => ({
              card,
              status: (newResults[index] || 'incorrect') as 'correct' | 'incorrect',
          }));
          onSessionComplete(finalResults);
          setShowResults(true);
      }
  };

  const handleRestart = () => {
    setResults(new Array(flashcards.length).fill(null));
    setShowResults(false);
    setShowHint(false);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{content[language].noFlashcards}</h2>
        <p className="text-slate-400 mb-6">{content[language].noFlashcardsDesc}</p>
        <button onClick={onRegenerate} className="px-6 py-2 bg-sky-600 rounded-md hover:bg-sky-500">
          {content[language].tryAgain}
        </button>
      </div>
    );
  }

  // Moved useMemo hook here to be called before conditional returns, fixing the hook error.
  const currentCard = useMemo(() => flashcards[currentIndex], [flashcards, currentIndex]);

  if (showResults) {
    const correctCount = results.filter(r => r === 'correct').length;
    return (
      <div className="text-center p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg animate-fade-in">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 mb-4">{content[language].sessionComplete}</h2>
        <p className="text-xl text-slate-300 mb-8">
          {content[language].yourScore} <span className="font-bold text-2xl">{correctCount}</span> / {flashcards.length}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={handleRestart} className="flex items-center gap-2 w-full sm:w-auto justify-center px-5 py-2 font-semibold text-white bg-sky-600 rounded-md shadow-lg transition-all duration-300 ease-in-out hover:bg-sky-500">
            <ReloadIcon className="h-4 w-4" />
            {content[language].reviewAgain}
          </button>
          {!isCorrectionSession && (
             <button onClick={onRegenerate} className="flex items-center gap-2 w-full sm:w-auto justify-center px-5 py-2 text-sm font-semibold bg-emerald-600 rounded-md hover:bg-emerald-500 transition-colors">
                <ReloadIcon className="h-4 w-4" />
                {content[language].newCards}
            </button>
          )}
        </div>
        <div className="flex justify-center mt-8">
            <button 
                onClick={onBack} 
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-slate-700/60 text-slate-300 rounded-md hover:bg-slate-700 hover:text-slate-100 transition-colors"
            >
                <ArrowLeftIcon className="h-5 w-5" />
                {content[language].backToDashboard}
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
        <div className="w-full max-w-2xl mb-4">
            <div 
                className="w-full h-80 [perspective:1000px]"
                onClick={() => !isAnimating && setIsFlipped(!isFlipped)}
            >
                <div
                    className={`relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'}`}
                >
                    {/* Front of card */}
                    <div className="absolute w-full h-full [backface-visibility:hidden] bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center p-8 text-center">
                        <p className={`text-2xl sm:text-3xl font-bold text-slate-100 transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                            {currentCard.term}
                        </p>
                    </div>
                    {/* Back of card */}
                    <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-sky-900/50 border border-sky-700 rounded-xl flex items-center justify-center p-8 text-center">
                         <p className={`text-lg text-slate-200 transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                            {currentCard.definition}
                        </p>
                    </div>
                </div>
            </div>
             {!isFlipped && <p className="text-center text-sm text-slate-500 mt-2">{content[language].flipHint}</p>}

            {currentCard.hint && !isFlipped && (
                <div className="w-full mt-4 flex flex-col items-center">
                     <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-700/60 text-slate-300 rounded-md hover:bg-slate-700 hover:text-slate-100 transition-colors">
                        <HintIcon className="h-5 w-5" />
                        <span>{showHint ? content[language].hint : content[language].showHint}</span>
                    </button>
                    {showHint && (
                        <div className="mt-3 p-4 bg-slate-800/70 border border-slate-700 rounded-lg text-center text-slate-300 animate-fade-in-sm w-full">
                            <p>{currentCard.hint}</p>
                        </div>
                    )}
                </div>
            )}
        </div>

      <div className="text-center text-slate-300 font-medium mb-6">
        {content[language].cardCounter} {currentIndex + 1} {content[language].of} {flashcards.length}
      </div>

      <div className="flex items-center justify-center space-x-4 min-h-[56px]">
        {isFlipped && !showResults ? (
            <div className="flex items-center justify-center space-x-4 animate-fade-in">
                <button onClick={() => handleAnswer('incorrect')} className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-red-600/90 rounded-lg shadow-md hover:bg-red-600 transition-all transform hover:scale-105">
                    <CloseIcon className="h-5 w-5" />
                    {content[language].iMissedIt}
                </button>
                <button onClick={() => handleAnswer('correct')} className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-emerald-600/90 rounded-lg shadow-md hover:bg-emerald-600 transition-all transform hover:scale-105">
                    <CheckIcon className="h-5 w-5" />
                    {content[language].iKnewIt}
                </button>
            </div>
        ) : !showResults && (
            <>
                <button onClick={handlePrev} disabled={currentIndex === 0} className="p-3 bg-slate-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors">
                  <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <button onClick={handleNext} disabled={currentIndex === flashcards.length - 1} className="p-3 bg-slate-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors">
                  <ArrowRightIcon className="h-6 w-6" />
                </button>
            </>
        )}
      </div>

       <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
             <button
                onClick={onBack}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-slate-700/60 text-slate-300 rounded-md hover:bg-slate-700 hover:text-slate-100 transition-colors"
            >
                <ArrowLeftIcon className="h-5 w-5" />
                {content[language].backToDashboard}
            </button>
        </div>
    </div>
  );
};

export default FlashcardScreen;
