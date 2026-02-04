
export interface Flashcard {
  term: string;
  definition: string;
  hint?: string;
}

export interface HistoryFlashcard extends Flashcard {
  status: 'correct' | 'incorrect';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

export interface HistoryQuizQuestion extends QuizQuestion {
    userAnswer: string;
    status: 'correct' | 'incorrect';
}

export interface StudySet {
    id: string;
    name: string;
    pdfFiles: File[];
    extractedTexts: Record<string, string>;
    flashcardHistory: HistoryFlashcard[];
    quizHistory: HistoryQuizQuestion[];
    imageUrl: string;
    createdAt: number;
}

export enum ViewState {
  Home = 'HOME',
  FileUpload = 'FILE_UPLOAD',
  Loading = 'LOADING',
  Dashboard = 'DASHBOARD',
  Flashcards = 'FLASHCARDS',
  Quiz = 'QUIZ',
  History = 'HISTORY',
}