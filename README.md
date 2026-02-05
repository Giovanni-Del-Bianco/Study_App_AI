# 🎓 AI Study Buddy: Intelligent Adaptive Learning Platform

> **Personal Project | EdTech & AI Engineering**
> A React-based application that leverages Google Gemini AI to transform static PDF lecture notes into interactive study materials like Flashcards and Quizzes.

<div align="center">
  <!-- Inserisci qui lo screenshot della Dashboard o della Home -->
  <img src="./screenshots/home-dashboard.png" alt="AI Study Buddy Dashboard" width="100%" />
</div>

---

## 💡 Purpose and Motivation

As a university student, reviewing hundreds of pages of PDF notes can be passive and inefficient. Traditional study tools often require manual data entry, wasting valuable study time.

**AI Study Buddy** was built to solve this by automating the creation of active recall materials. It acts as a personal tutor that:
1.  **Reads** your specific course material (PDFs).
2.  **Understands** context and nuance using LLMs (Google Gemini).
3.  **Generates** targeted quizzes and flashcards to test your knowledge.
4.  **Adapts** by offering a "Correction Mode" to focus specifically on weak areas.

## ✨ Key Features

### 📚 Document Analysis
*   **Multi-PDF Support:** Upload multiple documents (lecture notes, books, slides) to create a unified context for a specific subject (a "Study Buddy").
*   **Local Processing:** Text extraction happens in the browser using `pdf.js` for privacy and speed.

### 🧠 AI-Powered Generation
*   **Flashcards:** Generates terms and definitions with helpful hints accessible on demand.
*   **Dynamic Quizzes:** Creates multiple-choice questions with 4 options. Crucially, it provides **detailed explanations** for why an answer is correct or incorrect.
*   **Customizable Sessions:** Users can choose the number of questions, difficulty level (Easy/Medium/Hard), and specific sub-topics.

### 🔄 Adaptive Study Loop
*   **Correction Mode:** The app tracks incorrect answers and dynamically generates a new study session focusing *only* on mistakes.
*   **Study History:** A persistent log of all past sessions to track progress over time.

### 🌍 Accessibility & UI
*   **Bilingual Support:** Fully localized in **English** and **Italian**.
*   **Modern UI:** Built with Tailwind CSS for a responsive, dark-mode-first aesthetic.

---

## 📸 Application Screenshots

| **Create Buddy** | **Flashcards** |
|:---:|:---:|
| <img src="./screenshots/upload-screen.png" width="400" alt="Upload Screen"> | <img src="./screenshots/flashcard-mode.png" width="400" alt="Flashcards"> |
| *Drag & drop interface for PDF ingestion* | *Interactive cards with hints and animations* |

| **Quiz Mode** | **Correction & Dashboard** |
|:---:|:---:|
| <img src="./screenshots/quiz-mode.png" width="400" alt="Quiz"> | <img src="./screenshots/dashboard-correction.png" width="400" alt="Dashboard"> |
| *MCQs with immediate feedback and explanation* | *Track progress and retry missed questions* |

---

## 🛠️ Technical Architecture

### Tech Stack
| Component | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 (TypeScript) |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **AI Model** | Google Gemini 1.5 Flash (via API) |
| **PDF Processing** | `pdf.js` (Client-side extraction) |
| **State Management** | React Hooks + LocalStorage Persistence |

### 🧠 AI Engineering & Prompting
The core logic relies on structured prompting to ensure the AI returns data that the UI can render deterministically.

1.  **Context Injection:** Extracted text from PDFs is sanitized and injected into the system prompt.
2.  **Strict Output Enforcement:** The prompt enforces a strict **JSON schema** output. This ensures that the frontend never breaks due to unstructured text.
    *   *Example:* The AI is instructed to return an array of objects containing `question`, `options[]`, `correctAnswer`, `explanation`, and `hint`.
3.  **Temperature Control:** Optimized parameters (Temperature ~0.7) allow for creative question generation while sticking strictly to the source material facts.

---

## 📂 Project Structure

```text
ai-study-buddy/
├── src/
│   ├── components/
│   │   ├── FileUploadScreen.tsx    # Drag & Drop PDF handler
│   │   ├── StudyDashboardScreen.tsx# Main hub for a subject
│   │   ├── FlashcardScreen.tsx     # Flip-card interaction logic
│   │   ├── QuizScreen.tsx          # MCQ game logic
│   │   ├── HistoryScreen.tsx       # Performance analytics
│   │   └── ... (UI components like Modals, Icons)
│   ├── services/
│   │   ├── geminiService.ts        # AI API interaction & Prompt Engineering
│   │   └── pdfService.ts           # PDF text extraction logic
│   ├── types/                      # TypeScript definitions (StudySet, Flashcard, Quiz)
│   ├── App.tsx                     # Main Router & State Manager
│   └── main.tsx
├── public/
├── .env.local                      # API Keys configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   A Google Gemini API Key (Get it from [Google AI Studio](https://aistudiocdn.google.com/))

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/ai-study-buddy.git
    cd ai-study-buddy
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file in the root directory:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    The app will launch at `http://localhost:5173`.

---

## 🔮 Future Roadmap

*   [ ] **Cloud Persistence:** Integrate Firebase/Supabase to sync study buddies across devices.
*   [ ] **Voice Mode:** Use Text-to-Speech to read questions aloud for accessibility.
*   [ ] **Spaced Repetition:** Implement an algorithm (like SM-2) to schedule reviews automatically.

---

## 📜 License

Distributed under the MIT License.


