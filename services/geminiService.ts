
import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, QuizQuestion } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

const MAX_TEXT_LENGTH = 100000; // A reasonable limit to avoid overly large requests

const truncateText = (text: string): string => {
    if (text.length > MAX_TEXT_LENGTH) {
        return text.substring(0, MAX_TEXT_LENGTH);
    }
    return text;
};

export const generateFlashcards = async (
    text: string, 
    language: 'en' | 'it' = 'en', 
    existingTerms: string[] = [], 
    count: number = 10,
    difficulty: string = 'medium',
    topic?: string
): Promise<Flashcard[]> => {
    const truncatedText = truncateText(text);

    let topic_instruction_en = '';
    if (topic) {
        topic_instruction_en = ` The user wants to focus specifically on this topic: "${topic}". All flashcards should be related to this topic. If the topic is not present in the text, generate general flashcards from the text provided.`;
    }

    let topic_instruction_it = '';
    if (topic) {
        topic_instruction_it = ` L'utente vuole concentrarsi specificamente su questo argomento: "${topic}". Tutte le flashcard devono essere correlate a questo argomento. Se l'argomento non è presente nel testo, genera flashcard generali dal testo fornito.`;
    }

    const prompt_en = `Based on the following text from a university-level document, generate a set of ${count} high-quality flashcards in English. Each flashcard must have a 'term', a 'definition', and a short 'hint' to guide the student towards the definition without giving it away. The difficulty should be '${difficulty}'. All content (term, definition, hint) must be written exclusively in English. The content should be suitable for a university student. ${existingTerms.length > 0 ? `Please ensure the new flashcards cover different topics than these existing terms: ${existingTerms.join(', ')}.` : ''}${topic_instruction_en} Text: """${truncatedText}"""`;
    const prompt_it = `Basandoti sul seguente testo tratto da un documento di livello universitario, genera un set di ${count} flashcard di alta qualità in lingua italiana. Ogni flashcard deve avere un 'term', una 'definition', e un breve 'hint' (suggerimento) per guidare lo studente verso la definizione senza rivelarla. La difficoltà deve essere '${difficulty}'. Tutto il contenuto (term, definition, hint) deve essere scritto exclusively in italiano. Il contenuto deve essere adatto a uno studente universitario. ${existingTerms.length > 0 ? `Assicurati che le nuove flashcard coprano argomenti diversi da questi termini esistenti: ${existingTerms.join(', ')}.` : ''}${topic_instruction_it} Testo: """${truncatedText}"""`;
    const prompt = language === 'it' ? prompt_it : prompt_en;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: "You are an expert academic assistant. Your task is to create study materials for a university student in the specified language and at the specified difficulty.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            term: { type: Type.STRING },
                            definition: { type: Type.STRING },
                            hint: { type: Type.STRING, description: "A short hint to guide the student to the definition." },
                        },
                        required: ["term", "definition", "hint"],
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        const parsedJson = JSON.parse(jsonStr);
        return parsedJson as Flashcard[];
    } catch (error) {
        console.error("Error generating flashcards:", error);
        throw new Error("Failed to generate flashcards from Gemini API.");
    }
};

export const generateQuiz = async (
    text: string, 
    language: 'en' | 'it' = 'en', 
    existingQuestionTexts: string[] = [], 
    count: number = 10,
    difficulty: string = 'medium',
    topic?: string
): Promise<QuizQuestion[]> => {
    const truncatedText = truncateText(text);
    
    let topic_instruction_en = '';
    if (topic) {
        topic_instruction_en = ` The user wants to focus specifically on this topic: "${topic}". All questions should be related to this topic. If the topic is not present in the text, generate general questions from the text provided.`;
    }
    
    let topic_instruction_it = '';
    if (topic) {
        topic_instruction_it = ` L'utente vuole concentrarsi specificamente su questo argomento: "${topic}". Tutte le domande devono essere correlate a questo argomento. Se l'argomento non è presente nel testo, genera domande generali dal testo fornito.`;
    }

    const prompt_en = `Based on the following text from a university-level document, generate a ${count}-question multiple-choice quiz in English with a '${difficulty}' difficulty level. For each question, provide: a question text, 4 distinct options, the correct answer, a brief explanation for why it's correct, and a short 'hint' that guides the student toward the correct answer without revealing it. All parts (question, options, correctAnswer, explanation, and hint) must be written exclusively in English. The questions should test conceptual understanding, not just rote memorization. Important: Ensure that all 4 options for each question have approximately the same length to avoid giving away the answer. ${existingQuestionTexts.length > 0 ? `The new questions should cover different aspects of the text and be different from these already asked questions: "${existingQuestionTexts.join('", "')}"` : ''}${topic_instruction_en} Text: """${truncatedText}"""`;
    const prompt_it = `Basandoti sul seguente testo tratto da un documento di livello universitario, genera un quiz a scelta multipla di ${count} domande in lingua italiana con un livello di difficoltà '${difficulty}'. Per ogni domanda, fornisci: il testo della domanda, 4 opzioni distinte, la risposta corretta, una breve spiegazione del perché è giusta, e un breve 'hint' (suggerimento) che guidi lo studente verso la risposta corretta senza rivelarla. Tutte le parti (domanda, opzioni, risposta corretta, spiegazione e hint) devono essere scritte esclusivamente in italiano. Le domande dovrebbero testare la comprensione concettuale, non solo la memorizzazione. Importante: Assicurati che tutte e 4 le opzioni per ogni domanda abbiano approssimativamente la stessa lunghezza per evitare di suggerire la risposta. ${existingQuestionTexts.length > 0 ? `Le nuove domande dovrebbero coprire aspetti diversi del testo ed essere diverse da queste domande già poste: "${existingQuestionTexts.join('", "')}"` : ''}${topic_instruction_it} Testo: """${truncatedText}"""`;
    const prompt = language === 'it' ? prompt_it : prompt_en;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: "You are an expert academic assistant who creates challenging quizzes for university students in the specified language and at the specified difficulty. You are careful to make distractor options plausible and of similar length to the correct answer.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                            },
                            correctAnswer: { type: Type.STRING },
                            explanation: { type: Type.STRING, description: "An explanation of why the correct answer is correct." },
                            hint: { type: Type.STRING, description: "A hint that guides the student to the correct answer without giving it away." },
                        },
                        required: ["question", "options", "correctAnswer", "explanation", "hint"],
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        const parsedJson = JSON.parse(jsonStr);
        return parsedJson as QuizQuestion[];
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Failed to generate quiz from Gemini API.");
    }
};
