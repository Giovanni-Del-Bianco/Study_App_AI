
import React, { useState, useRef, useEffect } from 'react';
import { StudySet } from '../types';
import { PlusIcon, DocumentIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon, FaceSmileIcon } from './icons';

interface HomeScreenProps {
  studySets: StudySet[];
  onSelectStudySet: (id: string) => void;
  onCreateNew: () => void;
  language: 'en' | 'it';
  onDeleteStudySet: (id: string) => void;
  onUpdateStudySetName: (id: string, name: string) => void;
  onUpdateStudySetIcon: (id: string, icon: string) => void;
}

const content = {
    en: {
        title: "Your Study Buddies",
        subtitle: "Select a buddy to continue studying or create a new one.",
        createNew: "Create New Buddy",
        documents: "documents",
        noBuddiesTitle: "Welcome!",
        noBuddiesSubtitle: "Create your first Study Buddy to get started.",
        rename: "Rename",
        changeIcon: "Change Icon",
        delete: "Delete",
        deleteModalTitle: "Delete Buddy",
        deleteModalDesc: "Are you sure you want to delete this buddy? This action cannot be undone.",
        cancel: "Cancel",
        confirm: "Delete",
    },
    it: {
        title: "I Tuoi Study Buddies",
        subtitle: "Seleziona un buddy per continuare a studiare o creane uno nuovo.",
        createNew: "Crea Nuovo Buddy",
        documents: "documenti",
        noBuddiesTitle: "Benvenuto!",
        noBuddiesSubtitle: "Crea il tuo primo Study Buddy per iniziare.",
        rename: "Rinomina",
        changeIcon: "Cambia Icona",
        delete: "Elimina",
        deleteModalTitle: "Elimina Buddy",
        deleteModalDesc: "Sei sicuro di voler eliminare questo buddy? Questa azione non può essere annullata.",
        cancel: "Annulla",
        confirm: "Elimina",
    }
};

const predefinedIcons = ['📚', '🎓', '📝', '💡', '🚀', '🧠', '🔬', '⚖️', '💻', '🎨', '🌎', '⚡', '🧬', '📊', '🎵', '⚽', '🏦', '🏥', '✈️', '🍕'];

const EmojiPicker: React.FC<{ onSelect: (icon: string) => void, onClose: () => void }> = ({ onSelect, onClose }) => {
    return (
        <div className="absolute top-10 right-0 z-50 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl grid grid-cols-5 gap-2 w-64 animate-fade-in-sm">
            {predefinedIcons.map(icon => (
                <button 
                    key={icon}
                    onClick={(e) => { e.stopPropagation(); onSelect(icon); }}
                    className="p-2 text-2xl hover:bg-slate-700 rounded-md transition-colors"
                >
                    {icon}
                </button>
            ))}
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    language: 'en' | 'it'; 
}> = ({ isOpen, onClose, onConfirm, language }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-sm" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl max-w-sm w-full mx-4 shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-slate-100 mb-2">{content[language].deleteModalTitle}</h3>
                <p className="text-slate-400 mb-6">{content[language].deleteModalDesc}</p>
                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-md transition-colors font-medium"
                    >
                        {content[language].cancel}
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors font-medium shadow-lg"
                    >
                        {content[language].confirm}
                    </button>
                </div>
            </div>
        </div>
    );
};

const StudySetCard: React.FC<{ 
    set: StudySet, 
    onSelect: () => void, 
    language: 'en' | 'it',
    onRequestDelete: () => void,
    onRename: (newName: string) => void,
    onChangeIcon: (newIcon: string) => void
}> = ({ set, onSelect, language, onRequestDelete, onRename, onChangeIcon }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [isPickingIcon, setIsPickingIcon] = useState(false);
    const [tempName, setTempName] = useState(set.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isRenaming]);

    const handleRenameSubmit = () => {
        if (tempName.trim()) {
            onRename(tempName.trim());
        } else {
            setTempName(set.name);
        }
        setIsRenaming(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleRenameSubmit();
        if (e.key === 'Escape') {
            setTempName(set.name);
            setIsRenaming(false);
        }
    };

    return (
        <div 
            onClick={() => !isRenaming && !isMenuOpen && !isPickingIcon && onSelect()}
            className="group relative flex flex-col justify-between aspect-[4/3] w-full cursor-pointer rounded-xl bg-slate-800 border border-slate-700 p-5 shadow-lg transition-all duration-300 hover:border-sky-500/50 hover:shadow-2xl hover:-translate-y-1 overflow-visible"
        >
             {/* Menu Button */}
             <div className="absolute top-3 right-3 z-10">
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); setIsPickingIcon(false); }}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors relative z-20"
                >
                    <EllipsisVerticalIcon className="h-6 w-6" />
                </button>
                
                {isMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}></div>
                        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-xl z-50 overflow-hidden animate-fade-in-sm">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsRenaming(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                            >
                                <PencilIcon className="h-4 w-4" /> {content[language].rename}
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsPickingIcon(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                            >
                                <FaceSmileIcon className="h-4 w-4" /> {content[language].changeIcon}
                            </button>
                            <div className="border-t border-slate-700 my-1"></div>
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onRequestDelete();
                                    setIsMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 flex items-center gap-2"
                            >
                                <TrashIcon className="h-4 w-4" /> {content[language].delete}
                            </button>
                        </div>
                    </>
                )}

                {isPickingIcon && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsPickingIcon(false); }}></div>
                        <EmojiPicker 
                            onSelect={(icon) => { onChangeIcon(icon); setIsPickingIcon(false); }} 
                            onClose={() => setIsPickingIcon(false)}
                        />
                    </>
                )}
            </div>

            {/* Icon Content */}
            <div className="flex-grow flex items-center justify-center pointer-events-none">
                <span className="text-6xl sm:text-7xl filter drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
                    {set.icon || '🎓'}
                </span>
            </div>

            {/* Text Content */}
            <div className="mt-4">
                {isRenaming ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-slate-900 text-white font-bold text-lg sm:text-xl rounded border border-sky-500 px-2 py-1 focus:outline-none"
                    />
                ) : (
                    <h3 className="font-bold text-lg sm:text-xl text-slate-100 truncate pr-6" title={set.name}>
                        {set.name}
                    </h3>
                )}
                
                <div className="mt-2 flex items-center justify-between text-xs sm:text-sm text-slate-400">
                     <p className="flex items-center gap-1.5">
                        <DocumentIcon className="w-4 h-4" />
                        <span>{set.pdfFiles.length} {content[language].documents}</span>
                    </p>
                    <p>{new Date(set.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
};

const CreateNewCard: React.FC<{ onClick: () => void, language: 'en' | 'it' }> = ({ onClick, language }) => (
    <div 
        onClick={onClick}
        className="group flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/30 p-6 text-center transition-all duration-300 hover:border-sky-500 hover:bg-slate-800 hover:shadow-lg hover:-translate-y-1"
    >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/50 transition-colors group-hover:bg-sky-500 shadow-md">
            <PlusIcon className="h-8 w-8 text-slate-300 transition-colors group-hover:text-white" />
        </div>
        <p className="font-semibold text-lg text-slate-300 group-hover:text-white transition-colors">{content[language].createNew}</p>
    </div>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ 
    studySets, 
    onSelectStudySet, 
    onCreateNew, 
    language,
    onDeleteStudySet,
    onUpdateStudySetName,
    onUpdateStudySetIcon
}) => {
    const sortedSets = [...studySets].sort((a, b) => b.createdAt - a.createdAt);
    const [deletingSetId, setDeletingSetId] = useState<string | null>(null);

    const handleConfirmDelete = () => {
        if (deletingSetId) {
            onDeleteStudySet(deletingSetId);
            setDeletingSetId(null);
        }
    };

    return (
        <div className="w-full animate-fade-in relative">
            <div className="mb-10 text-left">
                 <h1 className="text-3xl font-bold text-slate-200 mb-2">
                    {content[language].title}
                </h1>
            </div>

            {sortedSets.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <CreateNewCard onClick={onCreateNew} language={language} />
                    {sortedSets.map(set => (
                        <StudySetCard 
                            key={set.id} 
                            set={set} 
                            onSelect={() => onSelectStudySet(set.id)} 
                            language={language}
                            onRequestDelete={() => setDeletingSetId(set.id)}
                            onRename={(name) => onUpdateStudySetName(set.id, name)}
                            onChangeIcon={(icon) => onUpdateStudySetIcon(set.id, icon)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center max-w-lg mx-auto mt-12">
                     <h2 className="text-2xl font-bold text-slate-200">{content[language].noBuddiesTitle}</h2>
                     <p className="text-slate-400 mt-2 mb-6">{content[language].noBuddiesSubtitle}</p>
                     <div className="max-w-xs mx-auto">
                        <CreateNewCard onClick={onCreateNew} language={language} />
                     </div>
                </div>
            )}

            <DeleteConfirmationModal 
                isOpen={!!deletingSetId} 
                onClose={() => setDeletingSetId(null)} 
                onConfirm={handleConfirmDelete} 
                language={language} 
            />
        </div>
    );
};

export default HomeScreen;
