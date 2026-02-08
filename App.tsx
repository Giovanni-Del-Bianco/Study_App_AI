
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Flashcard, QuizQuestion, ViewState, HistoryFlashcard, HistoryQuizQuestion, StudySet } from './types';
import { extractTextFromPdf } from './services/pdfService';
import { generateFlashcards, generateQuiz } from './services/geminiService';
import FileUploadScreen from './components/FileUploadScreen';
import StudyDashboardScreen from './components/StudyDashboardScreen';
import FlashcardScreen from './components/FlashcardScreen';
import QuizScreen from './components/QuizScreen';
import LoadingIndicator from './components/LoadingIndicator';
import LanguageSwitcher from './components/LanguageSwitcher';
import HistoryScreen from './components/HistoryScreen';
import HomeScreen from './components/HomeScreen';

const App: React.FC = () => {
    const [view, setView] = useState<ViewState>(ViewState.Home);
    
    // Initialize state from LocalStorage
    const [studySets, setStudySets] = useState<StudySet[]>(() => {
        const saved = localStorage.getItem('studySets');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Migration logic: Add icon if missing
                const defaultIcons = ['📚', '🎓', '📝', '💡', '🚀', '🧠', '🔬', '⚖️'];
                return parsed.map((set: any) => ({
                    ...set,
                    icon: set.icon || defaultIcons[Math.floor(Math.random() * defaultIcons.length)]
                }));
            } catch (e) {
                console.error("Failed to parse saved data", e);
                return [];
            }
        }
        return [];
    });

    const [activeStudySetId, setActiveStudySetId] = useState<string | null>(null);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [language, setLanguage] = useState<'en' | 'it'>('it');
    const [isCorrectionSession, setIsCorrectionSession] = useState(false);

    // Persist state to LocalStorage
    useEffect(() => {
        // File objects are not serializable by JSON.stringify (they become {}).
        // We map them to simple objects with the 'name' property to ensure the UI 
        // can still list the files after a reload. The actual text content is safely 
        // stored in 'extractedTexts'.
        const setsToSave = studySets.map(set => ({
            ...set,
            pdfFiles: set.pdfFiles.map(f => ({ name: f.name, type: 'application/pdf', size: 0, lastModified: 0 }))
        }));
        localStorage.setItem('studySets', JSON.stringify(setsToSave));
    }, [studySets]);

    const activeStudySet = useMemo(() => {
        return studySets.find(s => s.id === activeStudySetId) || null;
    }, [studySets, activeStudySetId]);

    const loadingMessages = {
        en: {
            extracting: 'Extracting text from your documents...',
            generatingFlashcards: 'Your personal AI is creating flashcards...',
            generatingQuiz: 'Your personal AI is crafting a quiz...',
        },
        it: {
            extracting: 'Estrazione del testo dai tuoi documenti...',
            generatingFlashcards: 'La tua IA personale sta creando le flashcard...',
            generatingQuiz: 'La tua IA personale sta preparando un quiz...',
        }
    };

    const errorMessages = {
        en: {
            extractFailed: 'Failed to extract text from one or more PDFs. Please try again.',
            noTextFlashcards: 'Please select at least one document to generate flashcards.',
            flashcardsFailed: 'Could not generate flashcards. The AI might be busy. Please try again.',
            noTextQuiz: 'Please select at least one document to generate a quiz.',
            quizFailed: 'Could not generate a quiz. The AI might be busy. Please try again.',
        },
        it: {
            extractFailed: 'Impossibile estrarre il testo da uno o più PDF. Riprova.',
            noTextFlashcards: 'Seleziona almeno un documento per generare flashcard.',
            flashcardsFailed: "Impossibile generare le flashcard. L'IA potrebbe essere occupata. Riprova.",
            noTextQuiz: 'Seleziona almeno un documento per generare un quiz.',
            quizFailed: "Impossibile generare il quiz. L'IA potrebbe essere occupata. Riprova.",
        }
    };

    const handleCreateStudySet = async (files: File[], name: string) => {
        setLoadingMessage(loadingMessages[language].extracting);
        setView(ViewState.Loading);
        setError(null);
        
        try {
            const texts: Record<string, string> = {};
            await Promise.all(
                files.map(async (file) => {
                    const text = await extractTextFromPdf(file);
                    texts[file.name] = text;
                })
            );

            const defaultIcons = ['📚', '🎓', '📝', '💡', '🚀', '🧠', '🔬', '⚖️'];
            const randomIcon = defaultIcons[Math.floor(Math.random() * defaultIcons.length)];

            const newSet: StudySet = {
                id: Date.now().toString(),
                name,
                pdfFiles: files,
                extractedTexts: texts,
                flashcardHistory: [],
                quizHistory: [],
                imageUrl: `https://picsum.photos/seed/${Date.now()}/400/300`, // Legacy
                icon: randomIcon,
                createdAt: Date.now(),
            };
            
            setStudySets(prev => [...prev, newSet]);
            setActiveStudySetId(newSet.id);
            setView(ViewState.Dashboard);
        } catch (err) {
            setError(errorMessages[language].extractFailed);
            console.error(err);
            setView(ViewState.FileUpload);
        } finally {
            setLoadingMessage('');
        }
    };

    const handleAddFilesToSet = async (files: File[]) => {
        if (!activeStudySet) return;

        setLoadingMessage(loadingMessages[language].extracting);
        setView(ViewState.Loading);
        setError(null);

        try {
            const newTexts: Record<string, string> = {};
            await Promise.all(
                files.map(async (file) => {
                    const text = await extractTextFromPdf(file);
                    newTexts[file.name] = text;
                })
            );
            
            setStudySets(prevSets => prevSets.map(set => {
                if (set.id === activeStudySetId) {
                    const existingFileNames = new Set(set.pdfFiles.map(f => f.name));
                    const uniqueNewFiles = files.filter(f => !existingFileNames.has(f.name));
                    
                    return {
                        ...set,
                        pdfFiles: [...set.pdfFiles, ...uniqueNewFiles],
                        extractedTexts: { ...set.extractedTexts, ...newTexts },
                    };
                }
                return set;
            }));
            setView(ViewState.Dashboard);
        } catch (err) {
            setError(errorMessages[language].extractFailed);
            console.error(err);
            setView(ViewState.Dashboard);
        } finally {
            setLoadingMessage('');
        }
    };

    const handleRemoveFileFromSet = (fileName: string) => {
        if (!activeStudySetId) return;
        setStudySets(prevSets => prevSets.map(set => {
            if (set.id === activeStudySetId) {
                const updatedFiles = set.pdfFiles.filter(f => f.name !== fileName);
                const updatedTexts = { ...set.extractedTexts };
                delete updatedTexts[fileName];
                return {
                    ...set,
                    pdfFiles: updatedFiles,
                    extractedTexts: updatedTexts
                };
            }
            return set;
        }));
    };

    const handleUpdateStudySetName = (setId: string, newName: string) => {
        setStudySets(prevSets => prevSets.map(set => {
            if (set.id === setId) {
                return { ...set, name: newName };
            }
            return set;
        }));
    };

    const handleUpdateStudySetIcon = (setId: string, newIcon: string) => {
        setStudySets(prevSets => prevSets.map(set => {
            if (set.id === setId) {
                return { ...set, icon: newIcon };
            }
            return set;
        }));
    };

    const handleDeleteStudySet = (setId: string) => {
        setStudySets(prevSets => prevSets.filter(set => set.id !== setId));
        if (activeStudySetId === setId) {
            setActiveStudySetId(null);
            setView(ViewState.Home);
        }
    };

    const handleSelectStudySet = (setId: string) => {
        setActiveStudySetId(setId);
        setView(ViewState.Dashboard);
    };

    const handleSelectionChange = (fileName: string, isSelected: boolean) => {
        // This logic will now need to live inside the dashboard, as it's temporary selection state
        // For now, let's assume the dashboard manages its own selection state for generation
    };
    
    const getCombinedText = useCallback((selectedFileNames: string[]) => {
        if (!activeStudySet) return '';
        return selectedFileNames
            .map(fileName => activeStudySet.extractedTexts[fileName])
            .filter(Boolean)
            .join('\n\n');
    }, [activeStudySet]);

    const handleGenerateFlashcards = useCallback(async (count: number, selectedFileNames: string[], difficulty: string, topic: string) => {
        if (!activeStudySet) return;
        const combinedText = getCombinedText(selectedFileNames);
        if (!combinedText) {
            setError(errorMessages[language].noTextFlashcards);
            return;
        }
        setLoadingMessage(loadingMessages[language].generatingFlashcards);
        setView(ViewState.Loading);
        setError(null);
        try {
            const existingTerms = activeStudySet.flashcardHistory.map(f => f.term);
            const cards = await generateFlashcards(combinedText, language, existingTerms, count, difficulty, topic);
            setFlashcards(cards);
            setView(ViewState.Flashcards);
        } catch (err) {
            setError(errorMessages[language].flashcardsFailed);
            console.error(err);
            setView(ViewState.Dashboard);
        } finally {
            setLoadingMessage('');
        }
    }, [getCombinedText, language, activeStudySet]);

    const handleGenerateQuiz = useCallback(async (count: number, selectedFileNames: string[], difficulty: string, topic: string) => {
        if (!activeStudySet) return;
        const combinedText = getCombinedText(selectedFileNames);
        if (!combinedText) {
            setError(errorMessages[language].noTextQuiz);
            return;
        }
        setLoadingMessage(loadingMessages[language].generatingQuiz);
        setView(ViewState.Loading);
        setError(null);
        try {
            const existingQuestionTexts = activeStudySet.quizHistory.map(q => q.question);
            const questions = await generateQuiz(combinedText, language, existingQuestionTexts, count, difficulty, topic);
            setQuizQuestions(questions);
            setView(ViewState.Quiz);
        } catch (err) {
            setError(errorMessages[language].quizFailed);
            console.error(err);
            setView(ViewState.Dashboard);
        } finally {
            setLoadingMessage('');
        }
    }, [getCombinedText, language, activeStudySet]);

    const handleFlashcardSessionComplete = (sessionResults: { card: Flashcard; status: 'correct' | 'incorrect' }[]) => {
        if (!activeStudySetId) return;
        const newHistoryItems: HistoryFlashcard[] = sessionResults
            .map(result => ({ ...result.card, status: result.status }));
    
        setStudySets(prev => prev.map(set => {
            if (set.id === activeStudySetId) {
                const historyMap = new Map(set.flashcardHistory.map(item => [item.term, item]));
                newHistoryItems.forEach(item => historyMap.set(item.term, item));
                return { ...set, flashcardHistory: Array.from(historyMap.values()) };
            }
            return set;
        }));
    };

    const handleQuizComplete = (sessionResults: { question: QuizQuestion; userAnswer: string; status: 'correct' | 'incorrect' }[]) => {
        if (!activeStudySetId) return;
        const newHistoryItems: HistoryQuizQuestion[] = sessionResults.map(result => ({
            ...result.question,
            userAnswer: result.userAnswer,
            status: result.status,
        }));
        
        setStudySets(prev => prev.map(set => {
            if (set.id === activeStudySetId) {
                const historyMap = new Map(set.quizHistory.map(item => [item.question, item]));
                newHistoryItems.forEach(item => historyMap.set(item.question, item));
                return { ...set, quizHistory: Array.from(historyMap.values()) };
            }
            return set;
        }));
    };
    
    const handleBackToDashboard = () => {
        setIsCorrectionSession(false);
        setView(ViewState.Dashboard);
    }
    
    const handleBackToHome = () => {
        setActiveStudySetId(null);
        setError(null);
        setView(ViewState.Home);
    };

    const handleViewHistory = () => {
        setView(ViewState.History);
    };

    const handleStartFlashcardCorrection = () => {
        if (!activeStudySet) return;
        const incorrectFlashcards = activeStudySet.flashcardHistory.filter(f => f.status === 'incorrect');
        if (incorrectFlashcards.length > 0) {
            setFlashcards(incorrectFlashcards);
            setIsCorrectionSession(true);
            setView(ViewState.Flashcards);
        }
    };

    const handleStartQuizCorrection = () => {
        if (!activeStudySet) return;
        const incorrectQuizQuestions = activeStudySet.quizHistory.filter(q => q.status === 'incorrect');
        if (incorrectQuizQuestions.length > 0) {
            setQuizQuestions(incorrectQuizQuestions);
            setIsCorrectionSession(true);
            setView(ViewState.Quiz);
        }
    };

    const renderView = () => {
        switch (view) {
            case ViewState.Home:
                return <HomeScreen 
                            studySets={studySets} 
                            onSelectStudySet={handleSelectStudySet} 
                            onCreateNew={() => setView(ViewState.FileUpload)} 
                            language={language}
                            onDeleteStudySet={handleDeleteStudySet}
                            onUpdateStudySetName={handleUpdateStudySetName}
                            onUpdateStudySetIcon={handleUpdateStudySetIcon}
                        />;
            case ViewState.FileUpload:
                return <FileUploadScreen onCreate={handleCreateStudySet} onBack={handleBackToHome} error={error} language={language} />;
            case ViewState.Loading:
                return <LoadingIndicator message={loadingMessage} />;
            case ViewState.Dashboard:
                if (!activeStudySet) return (
                    <HomeScreen 
                        studySets={studySets} 
                        onSelectStudySet={handleSelectStudySet} 
                        onCreateNew={() => setView(ViewState.FileUpload)} 
                        language={language}
                        onDeleteStudySet={handleDeleteStudySet}
                        onUpdateStudySetName={handleUpdateStudySetName}
                        onUpdateStudySetIcon={handleUpdateStudySetIcon}
                    />
                );
                return <StudyDashboardScreen 
                            studySet={activeStudySet}
                            onGenerateFlashcards={handleGenerateFlashcards} 
                            onGenerateQuiz={handleGenerateQuiz} 
                            onBackToHome={handleBackToHome} 
                            onViewHistory={handleViewHistory}
                            onAddFiles={handleAddFilesToSet}
                            onRemoveFile={handleRemoveFileFromSet}
                            onUpdateStudySetName={handleUpdateStudySetName}
                            language={language}
                            onStartFlashcardCorrection={handleStartFlashcardCorrection}
                            onStartQuizCorrection={handleStartQuizCorrection}
                        />;
            case ViewState.Flashcards:
                return <FlashcardScreen flashcards={flashcards} onRegenerate={() => { if(activeStudySet) handleGenerateFlashcards(flashcards.length || 10, activeStudySet.pdfFiles.map(f=>f.name), 'medium', '')}} onBack={handleBackToDashboard} language={language} onSessionComplete={handleFlashcardSessionComplete} isCorrectionSession={isCorrectionSession} />;
            case ViewState.Quiz:
                return <QuizScreen quizQuestions={quizQuestions} onRegenerate={() => { if(activeStudySet) handleGenerateQuiz(quizQuestions.length || 10, activeStudySet.pdfFiles.map(f=>f.name), 'medium', '')}} onBack={handleBackToDashboard} language={language} onQuizComplete={handleQuizComplete} isCorrectionSession={isCorrectionSession} />;
            case ViewState.History:
                 if (!activeStudySet) return null;
                 return <HistoryScreen flashcardHistory={activeStudySet.flashcardHistory} quizHistory={activeStudySet.quizHistory} onBack={handleBackToDashboard} language={language} />;
            default:
                return <HomeScreen 
                            studySets={studySets} 
                            onSelectStudySet={handleSelectStudySet} 
                            onCreateNew={() => setView(ViewState.FileUpload)} 
                            language={language}
                            onDeleteStudySet={handleDeleteStudySet}
                            onUpdateStudySetName={handleUpdateStudySetName}
                            onUpdateStudySetIcon={handleUpdateStudySetIcon}
                        />;
        }
    };

    return (
        <main className="relative min-h-screen bg-slate-900 text-white p-4 sm:p-8 flex items-center justify-center transition-all duration-500">
            <LanguageSwitcher
                language={language}
                onSetLanguage={setLanguage}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10"
            />
            <div className="w-full max-w-5xl">
                {renderView()}
            </div>
        </main>
    );
};

export default App;
