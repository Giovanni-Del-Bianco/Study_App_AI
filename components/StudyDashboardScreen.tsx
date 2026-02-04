
import React, { useState, useRef } from 'react';
import { BrainIcon, QuizIcon, ArrowRightIcon, DocumentIcon, HistoryIcon, WrenchScrewdriverIcon, PlusIcon, TrashIcon, HomeIcon } from './icons';
import QuantityModal from './QuantityModal';
import { StudySet } from '../types';

interface StudyDashboardScreenProps {
  studySet: StudySet;
  onGenerateFlashcards: (count: number, selectedFileNames: string[], difficulty: string, topic: string) => void;
  onGenerateQuiz: (count: number, selectedFileNames:string[], difficulty: string, topic: string) => void;
  onBackToHome: () => void;
  onViewHistory: () => void;
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (fileName: string) => void;
  onUpdateStudySetName: (setId: string, newName: string) => void;
  language: 'en' | 'it';
  onStartFlashcardCorrection: () => void;
  onStartQuizCorrection: () => void;
}

const StudyDashboardScreen: React.FC<StudyDashboardScreenProps> = ({ 
  studySet,
  onGenerateFlashcards, 
  onGenerateQuiz, 
  onBackToHome, 
  onViewHistory,
  onAddFiles,
  onRemoveFile,
  onUpdateStudySetName,
  language,
  onStartFlashcardCorrection,
  onStartQuizCorrection,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'flashcards' | 'quiz' | null>(null);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>(() => studySet.pdfFiles.map(f => f.name));
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleValue, setEditingTitleValue] = useState(studySet.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const content = {
      en: {
          docTitle: "Your Documents",
          docSubtitle: "Select the files you want to study from.",
          studyTitle: "Ready to Master Your Material?",
          studySubtitle: "Choose your study method.",
          flashcardsTitle: "Flashcards",
          flashcardsDesc: "Review key terms and concepts.",
          quizTitle: "Quiz",
          quizDesc: "Test your knowledge with questions.",
          backToHome: "Back to Home",
          selectAll: "Select All",
          deselectAll: "Deselect All",
          history: "View History",
          correctErrorsTitle: "Correct Your Errors",
          correctErrorsSubtitle: "Review the items you missed in previous sessions.",
          reviewFlashcards: "Review Flashcards",
          reviewQuiz: "Review Quiz",
          items: "items",
          questions: "questions",
          addDocuments: "Add Documents",
          editTitleHint: "Double-click to edit",
          removeFile: "Remove file",
      },
      it: {
          docTitle: "I Tuoi Documenti",
          docSubtitle: "Seleziona i file da cui vuoi studiare.",
          studyTitle: "Pronto a Padroneggiare il Materiale?",
          studySubtitle: "Scegli il tuo metodo di studio.",
          flashcardsTitle: "Flashcard",
          flashcardsDesc: "Rivedi i termini e i concetti chiave.",
          quizTitle: "Quiz",
          quizDesc: "Metti alla prova le tue conoscenze.",
          backToHome: "Torna alla Home",
          selectAll: "Seleziona Tutto",
          deselectAll: "Deseleziona Tutto",
          history: "Visualizza Cronologia",
          correctErrorsTitle: "Correggi i Tuoi Errori",
          correctErrorsSubtitle: "Rivedi gli elementi che hai sbagliato nelle sessioni precedenti.",
          reviewFlashcards: "Rivedi le Flashcard",
          reviewQuiz: "Rivedi il Quiz",
          items: "elementi",
          questions: "domande",
          addDocuments: "Aggiungi Documenti",
          editTitleHint: "Doppio clic per modificare",
          removeFile: "Rimuovi file",
      }
  };

  const handleTitleSave = () => {
    if (editingTitleValue.trim() && editingTitleValue.trim() !== studySet.name) {
        onUpdateStudySetName(studySet.id, editingTitleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleTitleSave();
      } else if (e.key === 'Escape') {
          setEditingTitleValue(studySet.name);
          setIsEditingTitle(false);
      }
  };

  const onSelectionChange = (fileName: string, isSelected: boolean) => {
    setSelectedFileNames(prev => {
        const newSet = new Set(prev);
        if (isSelected) {
            newSet.add(fileName);
        } else {
            newSet.delete(fileName);
        }
        return Array.from(newSet);
    });
  };

  const handleRemoveFileClick = (fileName: string) => {
    setSelectedFileNames(prev => prev.filter(f => f !== fileName));
    onRemoveFile(fileName);
  };

  const handleGenerateClick = (type: 'flashcards' | 'quiz') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (options: { count: number; difficulty: string; topic: string }) => {
    setIsModalOpen(false);
    if (modalType === 'flashcards') {
      onGenerateFlashcards(options.count, selectedFileNames, options.difficulty, options.topic);
    } else if (modalType === 'quiz') {
      onGenerateQuiz(options.count, selectedFileNames, options.difficulty, options.topic);
    }
  };
  
  const handleSelectAll = () => {
      setSelectedFileNames(studySet.pdfFiles.map(f => f.name));
  };
  
  const handleDeselectAll = () => {
      setSelectedFileNames([]);
  };

  const handleAddFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        onAddFiles(Array.from(e.target.files));
        e.target.value = ''; // Reset input
    }
  };

  const areAllSelected = studySet.pdfFiles.length > 0 && selectedFileNames.length === studySet.pdfFiles.length;
  const isStudyDisabled = selectedFileNames.length === 0;
  const incorrectFlashcardsCount = studySet.flashcardHistory.filter(f => f.status === 'incorrect').length;
  const incorrectQuizQuestionsCount = studySet.quizHistory.filter(q => q.status === 'incorrect').length;

  return (
    <div className="p-4 sm:p-0 max-w-4xl mx-auto animate-fade-in w-full">
        {/* Header */}
        <div className="text-center mb-12">
            {isEditingTitle ? (
                <input
                    type="text"
                    value={editingTitleValue}
                    onChange={(e) => setEditingTitleValue(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyDown}
                    className="w-full max-w-xl mx-auto text-4xl sm:text-5xl font-extrabold text-slate-100 bg-slate-800 text-center outline-none ring-2 ring-sky-500 rounded-lg p-2"
                    autoFocus
                    onFocus={(e) => e.target.select()}
                />
            ) : (
                <h1 
                    className="text-4xl sm:text-5xl font-extrabold text-slate-100 mb-2 p-2 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors"
                    onDoubleClick={() => {
                        setEditingTitleValue(studySet.name);
                        setIsEditingTitle(true);
                    }}
                    title={content[language].editTitleHint}
                >
                    {studySet.name}
                </h1>
            )}
        </div>

        {/* Document Selection */}
        <div className="mb-12">
             <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">{content[language].docTitle}</h2>
                    <p className="text-slate-400">{content[language].docSubtitle}</p>
                </div>
                <button onClick={handleAddFilesClick} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-colors">
                    <PlusIcon className="h-5 w-5" />
                    {content[language].addDocuments}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" multiple className="hidden" />
             </div>
             <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 max-h-64 overflow-y-auto">
                <div className="flex justify-end gap-4 mb-4">
                    <button onClick={handleSelectAll} disabled={areAllSelected} className="text-sm font-medium text-sky-400 hover:text-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{content[language].selectAll}</button>
                    <button onClick={handleDeselectAll} disabled={selectedFileNames.length === 0} className="text-sm font-medium text-slate-400 hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{content[language].deselectAll}</button>
                </div>
                <div className="space-y-3">
                    {studySet.pdfFiles.map(file => (
                        <div key={file.name} className="flex items-center justify-between bg-slate-900/50 rounded-md hover:bg-slate-800 transition-colors group pr-3">
                            <label className="flex items-center flex-grow p-3 cursor-pointer mr-2">
                                <input 
                                    type="checkbox"
                                    className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
                                    checked={selectedFileNames.includes(file.name)}
                                    onChange={(e) => onSelectionChange(file.name, e.target.checked)}
                                />
                                <DocumentIcon className="h-5 w-5 mx-3 text-slate-500" />
                                <span className="text-slate-200 font-medium truncate">{file.name}</span>
                            </label>
                            <button 
                                onClick={() => handleRemoveFileClick(file.name)}
                                className="text-slate-500 hover:text-red-400 transition-colors p-2"
                                title={content[language].removeFile}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
             </div>
        </div>
        
        {/* Correct Errors Section */}
        {(incorrectFlashcardsCount > 0 || incorrectQuizQuestionsCount > 0) && (
            <div className="mb-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2 text-center">{content[language].correctErrorsTitle}</h2>
                <p className="text-slate-400 text-lg mb-6 text-center">{content[language].correctErrorsSubtitle}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={onStartFlashcardCorrection}
                        disabled={incorrectFlashcardsCount === 0}
                        className="group relative p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:bg-yellow-900/50 hover:border-yellow-600 transform hover:-translate-y-1"
                    >
                        <WrenchScrewdriverIcon className="h-12 w-12 text-yellow-400 mb-4 mx-auto" />
                        <h3 className="text-2xl font-bold text-slate-100">{content[language].reviewFlashcards}</h3>
                        <p className="text-slate-400 mt-2">{incorrectFlashcardsCount} {content[language].items}</p>
                    </button>
                    <button
                        onClick={onStartQuizCorrection}
                        disabled={incorrectQuizQuestionsCount === 0}
                        className="group relative p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:bg-orange-900/50 hover:border-orange-600 transform hover:-translate-y-1"
                    >
                        <WrenchScrewdriverIcon className="h-12 w-12 text-orange-400 mb-4 mx-auto" />
                        <h3 className="text-2xl font-bold text-slate-100">{content[language].reviewQuiz}</h3>
                        <p className="text-slate-400 mt-2">{incorrectQuizQuestionsCount} {content[language].questions}</p>
                    </button>
                </div>
            </div>
        )}

        {/* Study Method Selection */}
        <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">{content[language].studyTitle}</h2>
            <p className="text-slate-400 text-lg mb-10">{content[language].studySubtitle}</p>
        
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isStudyDisabled ? 'opacity-50' : ''}`}>
                <div 
                    onClick={() => !isStudyDisabled && handleGenerateClick('flashcards')}
                    className={`group relative p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg ${!isStudyDisabled ? 'cursor-pointer transition-all duration-300 hover:bg-sky-900/50 hover:border-sky-600 transform hover:-translate-y-1' : 'cursor-not-allowed'}`}
                >
                    <BrainIcon className="h-12 w-12 text-sky-400 mb-4 mx-auto" />
                    <h3 className="text-2xl font-bold text-slate-100">{content[language].flashcardsTitle}</h3>
                    <p className="text-slate-400 mt-2">{content[language].flashcardsDesc}</p>
                    <ArrowRightIcon className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-600 transition-all duration-300 group-hover:text-sky-400 group-hover:translate-x-1" />
                </div>
                
                <div 
                    onClick={() => !isStudyDisabled && handleGenerateClick('quiz')}
                    className={`group relative p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg ${!isStudyDisabled ? 'cursor-pointer transition-all duration-300 hover:bg-emerald-900/50 hover:border-emerald-600 transform hover:-translate-y-1' : 'cursor-not-allowed'}`}
                >
                    <QuizIcon className="h-12 w-12 text-emerald-400 mb-4 mx-auto" />
                    <h3 className="text-2xl font-bold text-slate-100">{content[language].quizTitle}</h3>
                    <p className="text-slate-400 mt-2">{content[language].quizDesc}</p>
                    <ArrowRightIcon className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-600 transition-all duration-300 group-hover:text-emerald-400 group-hover:translate-x-1" />
                </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                <button
                    onClick={onBackToHome}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-slate-700/60 text-slate-300 rounded-md hover:bg-slate-700 hover:text-slate-100 transition-colors"
                >
                     <HomeIcon className="h-5 w-5" />
                    {content[language].backToHome}
                </button>
                 <button
                    onClick={onViewHistory}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-slate-700/60 text-slate-300 rounded-md hover:bg-slate-700 hover:text-slate-100 transition-colors"
                >
                    <HistoryIcon className="h-5 w-5" />
                    {content[language].history}
                </button>
            </div>
        </div>

        <QuantityModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleModalSubmit}
            title={modalType === 'flashcards' ? content[language].flashcardsTitle : content[language].quizTitle}
            language={language}
        />
    </div>
  );
};

export default StudyDashboardScreen;
