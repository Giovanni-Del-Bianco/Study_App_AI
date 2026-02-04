import React from 'react';

interface LanguageSwitcherProps {
  language: 'en' | 'it';
  onSetLanguage: (language: 'en' | 'it') => void;
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, onSetLanguage, className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button 
        onClick={() => onSetLanguage('en')} 
        className={`px-3 py-1 text-sm rounded-md transition-colors ${language === 'en' ? 'bg-sky-500 text-white font-semibold' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button 
        onClick={() => onSetLanguage('it')} 
        className={`px-3 py-1 text-sm rounded-md transition-colors ${language === 'it' ? 'bg-sky-500 text-white font-semibold' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
        aria-pressed={language === 'it'}
      >
        IT
      </button>
    </div>
  );
};

export default LanguageSwitcher;
