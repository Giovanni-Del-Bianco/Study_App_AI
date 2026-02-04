import React from 'react';
import { StudySet } from '../types';
import { PlusIcon, DocumentIcon } from './icons';

interface HomeScreenProps {
  studySets: StudySet[];
  onSelectStudySet: (id: string) => void;
  onCreateNew: () => void;
  language: 'en' | 'it';
}

const content = {
    en: {
        title: "Your Study Buddies",
        subtitle: "Select a buddy to continue studying or create a new one.",
        createNew: "Create New Buddy",
        documents: "documents",
        noBuddiesTitle: "Welcome!",
        noBuddiesSubtitle: "Create your first Study Buddy to get started.",
    },
    it: {
        title: "I Tuoi Study Buddies",
        subtitle: "Seleziona un buddy per continuare a studiare o creane uno nuovo.",
        createNew: "Crea Nuovo Buddy",
        documents: "documenti",
        noBuddiesTitle: "Benvenuto!",
        noBuddiesSubtitle: "Crea il tuo primo Study Buddy per iniziare.",
    }
};

const StudySetCard: React.FC<{ set: StudySet, onSelect: () => void, language: 'en' | 'it' }> = ({ set, onSelect, language }) => (
    <div 
        onClick={onSelect} 
        className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
    >
        <img src={set.imageUrl} alt={set.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 sm:p-5">
            <h3 className="font-bold text-lg sm:text-xl text-white">{set.name}</h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                <DocumentIcon className="w-4 h-4" />
                <span>{set.pdfFiles.length} {content[language].documents}</span>
            </p>
        </div>
    </div>
);

const CreateNewCard: React.FC<{ onClick: () => void, language: 'en' | 'it' }> = ({ onClick, language }) => (
    <div 
        onClick={onClick}
        className="group flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 p-6 text-center transition-all duration-300 hover:border-sky-500 hover:bg-slate-800"
    >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 transition-colors group-hover:bg-sky-500">
            <PlusIcon className="h-6 w-6 text-slate-300 transition-colors group-hover:text-white" />
        </div>
        <p className="font-semibold text-slate-200">{content[language].createNew}</p>
    </div>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ studySets, onSelectStudySet, onCreateNew, language }) => {
    const sortedSets = [...studySets].sort((a, b) => b.createdAt - a.createdAt);

    return (
        <div className="w-full animate-fade-in">
            <div className="mb-8 text-center">
                 <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-100 mb-2">
                    {content[language].title}
                </h1>
                <p className="text-slate-400 text-lg">
                    {content[language].subtitle}
                </p>
            </div>

            {sortedSets.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <CreateNewCard onClick={onCreateNew} language={language} />
                    {sortedSets.map(set => (
                        <StudySetCard key={set.id} set={set} onSelect={() => onSelectStudySet(set.id)} language={language} />
                    ))}
                </div>
            ) : (
                <div className="text-center max-w-lg mx-auto mt-12">
                     <h2 className="text-2xl font-bold text-slate-200">{content[language].noBuddiesTitle}</h2>
                     <p className="text-slate-400 mt-2 mb-6">{content[language].noBuddiesSubtitle}</p>
                     <CreateNewCard onClick={onCreateNew} language={language} />
                </div>
            )}
        </div>
    );
};

export default HomeScreen;
