import React, { useState, useEffect, useMemo } from 'react';
import { QuizQuestion } from '../types';
import { ReloadIcon, HintIcon } from './icons';

interface QuizScreenProps {
  quizQuestions: QuizQuestion[];
  onRegenerate: () => void;
  onBack: () => void;
  language: 'en' | 'it';
  onQuizComplete: (results: { question: QuizQuestion; userAnswer: string; status: 'correct' | 'incorrect' }[]) => void;
  isCorrectionSession?: boolean;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ quizQuestions, onRegenerate, onBack, language, onQuizComplete, isCorrectionSession = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  const currentQuestion = useMemo(() => quizQuestions[currentIndex], [quizQuestions, currentIndex]);

  useEffect(() => {
    setAnswers(new Array(quizQuestions.length).fill(null));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowHint(false);
    setScore(0);
    setShowResults(false);
  }, [quizQuestions]);

  useEffect(() => {
    if (quizQuestions.length > 0 && currentQuestion) {
        const array = [...currentQuestion.options];
        // Fisher-Yates (aka Knuth) Shuffle
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        setShuffledOptions(array);
        setShowHint(false);
    }
  }, [currentIndex, quizQuestions, currentQuestion]);

  const content = {
      en: {
          loading: "Loading quiz...",
          quizComplete: "Quiz Complete!",
          yourScore: "Your score:",
          tryNewQuiz: "Try a New Quiz",
          backToDashboard: "Back to Dashboard",
          question: "Question",
          of: "of",
          finishQuiz: "Finish Quiz",
          nextQuestion: "Next Question",
          correct: "Correct!",
          incorrect: "Incorrect",
          explanation: "Explanation",
          hint: "Hint",
          showHint: "Show Hint",
      },
      it: {
          loading: "Caricamento quiz...",
          quizComplete: "Quiz Completato!",
          yourScore: "Il tuo punteggio:",
          tryNewQuiz: "Prova un Nuovo Quiz",
          backToDashboard: "Torna alla Dashboard",
          question: "Domanda",
          of: "di",
          finishQuiz: "Termina il Quiz",
          nextQuestion: "Prossima Domanda",
          correct: "Corretto!",
          incorrect: "Sbagliato",
          explanation: "Spiegazione",
          hint: "Suggerimento",
          showHint: "Mostra Suggerimento",
      }
  };
  const optionLabels = ['A', 'B', 'C', 'D'];

  const handleAnswerSelect = (option: string) => {
    if (selectedAnswer) return; // Prevent changing answer
    
    const newAnswers = [...answers];
    newAnswers[currentIndex] = option;
    setAnswers(newAnswers);
    
    setSelectedAnswer(option);
    if (option === quizQuestions[currentIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    } else {
      const finalResults = quizQuestions.map((q, index) => {
        const userAnswer = answers[index] ?? '';
        return {
          question: q,
          userAnswer: userAnswer,
          status: (userAnswer === q.correctAnswer ? 'correct' : 'incorrect') as 'correct' | 'incorrect',
        };
      });
      onQuizComplete(finalResults);
      setShowResults(true);
    }
  };

  const handleRestart = () => {
      onRegenerate();
  }

  if (quizQuestions.length === 0) {
    return <div className="text-center text-slate-300">{content[language].loading}</div>;
  }
  
  const getButtonClass = (option: string) => {
    if (!selectedAnswer) {
      return 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-sky-500';
    }
    const isCorrect = option === currentQuestion.correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) return 'bg-emerald-500/80 border-emerald-400';
    if (isSelected && !isCorrect) return 'bg-red-500/80 border-red-400';
    return 'bg-slate-800 border-slate-700 opacity-60';
  };


  if (showResults) {
    return (
      <div className="text-center p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg animate-fade-in">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 mb-4">{content[language].quizComplete}</h2>
        <p className="text-xl text-slate-300 mb-6">
          {content[language].yourScore} <span className="font-bold text-2xl">{score}</span> / {quizQuestions.length}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isCorrectionSession && (
                <button
                    onClick={handleRestart}
                    className="flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-3 font-semibold text-white bg-sky-600 rounded-md shadow-lg transition-all duration-300 ease-in-out hover:bg-sky-500"
                >
                     <ReloadIcon className="h-5 w-5" />
                    {content[language].tryNewQuiz}
                </button>
            )}
             <button
                onClick={onBack}
                className="text-slate-400 hover:text-slate-200 transition-colors duration-200 text-sm font-medium"
            >
                {content[language].backToDashboard}
            </button>
        </div>
      </div>
    );
  }
  

  return (
    <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-6">
            <p className="text-sm font-medium text-sky-400">{content[language].question} {currentIndex + 1} {content[language].of} {quizQuestions.length}</p>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-slate-100">
                {currentQuestion.question}
            </h2>
        </div>

        {/* Hint Section */}
        {currentQuestion.hint && !selectedAnswer && (
            <div className="w-full flex flex-col items-center mb-8">
                 <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-700/60 text-slate-300 rounded-full hover:bg-slate-700 hover:text-slate-100 transition-colors">
                    <HintIcon className="h-5 w-5" />
                    <span>{showHint ? content[language].hint : content[language].showHint}</span>
                </button>
                {showHint && (
                    <div className="mt-4 p-4 bg-slate-800/70 border border-slate-700 rounded-lg text-center text-slate-300 animate-fade-in-sm w-full max-w-2xl mx-auto">
                        <p>{currentQuestion.hint}</p>
                    </div>
                )}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            {shuffledOptions.map((option, index) => (
                <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={!!selectedAnswer}
                    className={`p-4 w-full text-left font-medium rounded-lg border transition-all duration-300 disabled:cursor-not-allowed flex items-center ${getButtonClass(option)}`}
                >
                    <span className="font-bold mr-3 text-sky-300">{optionLabels[index]})</span>
                    <span>{option}</span>
                </button>
            ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center min-h-[180px]">
            {selectedAnswer && (
                <div className="flex flex-col items-center justify-center p-4 rounded-lg animate-fade-in bg-slate-800/50 border border-slate-700 w-full">
                    {selectedAnswer === currentQuestion.correctAnswer ? (
                        <p className="text-xl font-semibold text-emerald-400">{content[language].correct}</p>
                    ) : (
                        <p className="text-xl font-semibold text-red-400">{content[language].incorrect}</p>
                    )}
                    
                    <p className="mt-2 text-slate-300 text-sm sm:text-base text-center">
                        <span className="font-semibold text-sky-400">{content[language].explanation}:</span> {currentQuestion.explanation}
                    </p>

                    <button
                        onClick={handleNextQuestion}
                        className="mt-4 px-8 py-2 font-semibold text-white bg-sky-600 rounded-md shadow-lg transition-all duration-300 ease-in-out hover:bg-sky-500 transform hover:scale-105"
                    >
                        {currentIndex === quizQuestions.length - 1 ? content[language].finishQuiz : content[language].nextQuestion}
                    </button>
                </div>
            )}
            <button
                onClick={onBack}
                className="text-slate-400 hover:text-slate-200 transition-colors duration-200 text-sm font-medium"
            >
                {content[language].backToDashboard}
            </button>
        </div>
    </div>
  );
};

export default QuizScreen;