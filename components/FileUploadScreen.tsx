
import React, { useCallback, useState } from 'react';
import { UploadIcon, CloseIcon, ArrowLeftIcon } from './icons';

interface FileUploadScreenProps {
  onCreate: (files: File[], name: string) => void;
  onBack: () => void;
  error: string | null;
  language: 'en' | 'it';
}

const FileUploadScreen: React.FC<FileUploadScreenProps> = ({ onCreate, onBack, error, language }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState('');

  const content = {
    en: {
        title: "Create a New Study Buddy",
        subtitle: "Give your buddy a name and upload the PDF documents you want to study.",
        namePlaceholder: "e.g., Quantum Physics Midterm",
        dropzone: "Drag & Drop PDFs here or ",
        browse: "browse",
        selectedFiles: "Selected files:",
        button: "Create Buddy",
        backToHome: "Back to Home",
    },
    it: {
        title: "Crea un Nuovo Study Buddy",
        subtitle: "Dai un nome al tuo buddy e carica i documenti PDF che vuoi studiare.",
        namePlaceholder: "es. Appunti di Diritto Privato",
        dropzone: "Trascina e rilascia i PDF qui o ",
        browse: "sfoglia",
        selectedFiles: "File selezionati:",
        button: "Crea Buddy",
        backToHome: "Torna alla Home",
    }
  };

  const onFilesSelect = (newFiles: File[]) => {
    setFiles(prevFiles => {
        const existingFileNames = new Set(prevFiles.map(f => f.name));
        const uniqueNewFiles = Array.from(newFiles).filter(f => !existingFileNames.has(f.name));
        return [...prevFiles, ...uniqueNewFiles];
    });
  };

  const onRemoveFile = (fileNameToRemove: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileNameToRemove));
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files) as File[];
      const pdfFiles = filesArray.filter(f => f.type === "application/pdf");
      if(pdfFiles.length > 0) {
        onFilesSelect(pdfFiles);
      }
    }
  }, [onFilesSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(Array.from(e.target.files) as File[]);
      e.target.value = ''; // Reset input to allow selecting the same file again
    }
  };

  const handleCreateClick = () => {
    if (files.length > 0 && name.trim()) {
        onCreate(files, name.trim());
    }
  };

  return (
    <div className="text-center p-4 sm:p-8 max-w-2xl mx-auto w-full">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6 text-sm font-medium">
          <ArrowLeftIcon className="h-4 w-4" />
          {content[language].backToHome}
      </button>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 mb-4">
        {content[language].title}
      </h1>
      <p className="text-slate-400 text-lg mb-8">
        {content[language].subtitle}
      </p>

      <div className="space-y-6">
        <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={content[language].namePlaceholder}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />

        <label
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative block w-full rounded-lg border-2 border-dashed p-12 text-center transition-colors duration-300 ${isDragging ? 'border-sky-400 bg-slate-800' : 'border-slate-600 hover:border-slate-500'}`}
        >
            <UploadIcon className="mx-auto h-12 w-12 text-slate-500" />
            <span className="mt-2 block text-sm font-semibold text-slate-300">
            {content[language].dropzone} <span className="text-sky-400">{content[language].browse}</span>
            </span>
            <input type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" multiple />
        </label>
      </div>


      {files.length > 0 && (
          <div className="mt-6 text-left">
            <h3 className="font-semibold text-slate-300 mb-2">{content[language].selectedFiles}</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {files.map(file => (
                <div key={file.name} className="flex items-center justify-between bg-slate-800/70 p-2 rounded-md animate-fade-in-sm">
                  <p className="text-sm text-slate-300 truncate pr-2">{file.name}</p>
                  <button onClick={() => onRemoveFile(file.name)} className="p-1 rounded-full text-slate-500 hover:bg-slate-700 hover:text-slate-200 transition-colors">
                      <CloseIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      {error && (
        <p className="mt-4 text-red-400">{error}</p>
      )}

      <button
        onClick={handleCreateClick}
        disabled={files.length === 0 || !name.trim()}
        className="mt-8 w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-semibold text-white bg-sky-600 rounded-md shadow-lg transition-all duration-300 ease-in-out hover:bg-sky-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 transform hover:scale-105"
      >
        {content[language].button}
      </button>
    </div>
  );
};

export default FileUploadScreen;
