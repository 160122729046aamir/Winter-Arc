// Daily question bank.
//
// Source of truth: one JSON file per day in ./questionBank/day_XX.json, written from
// the lecture notes (Notes/…/Lecture NN/notes.pdf) and the lecture's code.
// Each day has 10 questions, ordered easy → medium → hard, mixing conceptual,
// scenario-based and coding questions. To update a day, edit or replace its JSON file.
//
// Loading: ./questionBank/index.json (built by scripts/build_question_index.mjs before
// dev/build) holds only counts and ids, so startup stays light. A day's full questions
// are downloaded only when its quiz is opened (loadDayQuestions).
//
// The UI uses the difficulty keys basic / medium / hard; "easy" in the JSON maps to "basic".
import QUESTION_INDEX from './questionBank/index.json';

const loaders = import.meta.glob('./questionBank/day_*.json', { import: 'default' });

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

function normaliseDay(data) {
  const day = data.day;
  const topic = day <= 57 ? 'Core Java' : 'Spring Boot';
  const questions = data.questions.map((q) => normaliseQuestion(q, day, topic));
  return {
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
}

/** Lightweight per-day summary: { total, easy, medium, hard, title } or null. */
export function getDayQuestionMeta(dayNumber) {
  return QUESTION_INDEX[dayNumber] || null;
}

export const TOTAL_QUESTIONS = Object.values(QUESTION_INDEX).reduce((n, d) => n + d.total, 0);

/** Set of every valid question id, used to drop saved answers for questions that no longer exist. */
export const QUESTION_IDS = new Set(Object.values(QUESTION_INDEX).flatMap((d) => d.ids));

const cache = new Map();

/** Loads (and caches) one day's full question set. Resolves to null if the day has no quiz. */
export function loadDayQuestions(dayNumber) {
  const key = `./questionBank/day_${String(dayNumber).padStart(2, '0')}.json`;
  if (!loaders[key]) return Promise.resolve(null);
  if (!cache.has(dayNumber)) {
    cache.set(dayNumber, loaders[key]().then(normaliseDay).catch((err) => {
      cache.delete(dayNumber);
      throw err;
    }));
  }
  return cache.get(dayNumber);
}
