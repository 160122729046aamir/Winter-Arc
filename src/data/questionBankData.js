// Daily question bank.
//
// Source of truth: one JSON file per day in ./questionBank/day_XX.json, written from
// the lecture notes (Notes/…/Lecture NN/notes.pdf) and the lecture's code.
// Each day has 10 questions, ordered easy → medium → hard, mixing conceptual,
// scenario-based and coding questions. To update a day, edit or replace its JSON file.
//
// The UI uses the difficulty keys basic / medium / hard; "easy" in the JSON maps to "basic".

const files = import.meta.glob('./questionBank/day_*.json', { eager: true, import: 'default' });

const DIFFICULTY_KEY = { easy: 'basic', basic: 'basic', medium: 'medium', hard: 'hard' };
const KIND_LABEL = { conceptual: 'Conceptual', scenario: 'Scenario', coding: 'Coding' };

function normaliseQuestion(q, day, dayTopic) {
  const difficulty = DIFFICULTY_KEY[q.difficulty] || 'medium';
  return {
    id: q.id,
    day,
    difficulty,
    kind: q.kind || 'conceptual',
    kindLabel: KIND_LABEL[q.kind] || 'Conceptual',
    type: 'mcq',
    topic: q.topic || dayTopic,
    concept: q.topic || dayTopic,
    question: q.question,
    codeSnippet: q.codeSnippet || null,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    source: q.source || null,
    reference: q.reference || null
  };
}

export const QUESTION_BANK_BY_DAY = {};

Object.values(files).forEach((data) => {
  if (!data || typeof data.day !== 'number' || !Array.isArray(data.questions)) return;
  const day = data.day;
  const topic = data.day <= 57 ? 'Core Java' : 'Spring Boot';
  const questions = data.questions.map((q) => normaliseQuestion(q, day, topic));
  QUESTION_BANK_BY_DAY[day] = {
    day,
    title: data.title,
    topic,
    topics: data.topics || [],
    sources: data.sources || [],
    totalQuestions: questions.length,
    all: questions,
    basic: questions.filter((q) => q.difficulty === 'basic'),
    medium: questions.filter((q) => q.difficulty === 'medium'),
    hard: questions.filter((q) => q.difficulty === 'hard')
  };
});

export const TOTAL_QUESTIONS = Object.values(QUESTION_BANK_BY_DAY).reduce((n, d) => n + d.totalQuestions, 0);

/** Set of every valid question id, used to drop saved answers for questions that no longer exist. */
export const QUESTION_IDS = new Set(
  Object.values(QUESTION_BANK_BY_DAY).flatMap((d) => d.all.map((q) => q.id))
);

export function getQuestionsForDay(dayNumber) {
  return QUESTION_BANK_BY_DAY[dayNumber]?.all || [];
}

export function getQuestionsByDifficulty(dayNumber, difficulty) {
  const dayData = QUESTION_BANK_BY_DAY[dayNumber];
  if (!dayData) return [];
  const key = DIFFICULTY_KEY[difficulty] || difficulty;
  if (key === 'basic' || key === 'medium' || key === 'hard') return dayData[key];
  return dayData.all;
}
