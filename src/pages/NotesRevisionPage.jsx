import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  Save,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { TOP_INTERVIEW_QUESTIONS } from '../data/interviewQuestionsData';
import { formatDate } from '../utils/dateUtils';

export default function NotesRevisionPage() {
  const { days, updateDayNotes } = usePlanner();

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'interview'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDayToEdit, setSelectedDayToEdit] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Revised status tracked in localStorage
  const [revisedTopics, setRevisedTopics] = useState(() => {
    try {
      const stored = localStorage.getItem('winter_arc_revised_topics');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Expanded interview questions
  const [expandedQuestions, setExpandedQuestions] = useState({ 1: true });

  const toggleTopicRevised = (dayNumber) => {
    setRevisedTopics((prev) => {
      const next = { ...prev, [dayNumber]: !prev[dayNumber] };
      localStorage.setItem('winter_arc_revised_topics', JSON.stringify(next));
      return next;
    });
  };

  const toggleQuestionExpanded = (id) => {
    setExpandedQuestions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Days with notes or topics
  const daysWithNotes = useMemo(() => {
    return days.filter((d) => {
      const hasContent = Boolean(d.notes && d.notes.trim()) || Boolean(d.revision && d.revision.length);
      if (!hasContent) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDay = String(d.day).includes(q);
        const matchesTitle = d.title.toLowerCase().includes(q);
        const matchesNotes = (d.notes || '').toLowerCase().includes(q);
        const matchesRevision = (d.revision || []).some((r) => r.toLowerCase().includes(q));
        return matchesDay || matchesTitle || matchesNotes || matchesRevision;
      }
      return true;
    });
  }, [days, searchQuery]);

  const handleStartEdit = (day) => {
    setSelectedDayToEdit(day.day);
    setEditingText(day.notes || '');
  };

  const handleSaveEdit = (dayNumber) => {
    updateDayNotes(dayNumber, editingText);
    setSelectedDayToEdit(null);
  };

  const handleDeleteNotes = (dayNumber) => {
    if (confirm(`Clear personal notes for Day ${dayNumber}?`)) {
      updateDayNotes(dayNumber, '');
    }
  };

  // Filtered interview questions
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return TOP_INTERVIEW_QUESTIONS;
    const q = searchQuery.toLowerCase();
    return TOP_INTERVIEW_QUESTIONS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const revisedCount = Object.values(revisedTopics).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-indigo-400" />
            Notes & Revision Center
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Topic checklists, personal study takeaways, and technical interview flashcards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
            {revisedCount} / 60 Topics Revised
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'notes'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Curriculum Notes & Concept Checklists
        </button>

        <button
          onClick={() => setActiveTab('interview')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'interview'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Top 50 Interview Questions</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeTab === 'notes'
              ? 'Search notes or key concepts (e.g. HashMap, Virtual Threads, AOP, N+1)...'
              : 'Search interview questions (e.g. JWT, IoC, Metaspace, @Transactional)...'
          }
          className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Tab 1: Curriculum Notes & Revision Checklists */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {daysWithNotes.map((d) => {
            const isRevised = revisedTopics[d.day];
            const isEditing = selectedDayToEdit === d.day;

            return (
              <div
                key={d.day}
                className={`arc-card p-5 transition-all ${
                  isRevised ? 'border-emerald-500/30 bg-emerald-950/5' : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-cyan-400 font-mono font-bold text-xs">
                      Day {d.day}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      {d.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleTopicRevised(d.day)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isRevised
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isRevised ? 'Marked Revised' : 'Mark as Revised'}</span>
                    </button>

                    <button
                      onClick={() => handleStartEdit(d)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit notes"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {d.notes && (
                      <button
                        onClick={() => handleDeleteNotes(d.day)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Clear notes"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Key Revision Concepts Tags */}
                {d.revision && d.revision.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {d.revision.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                      >
                        • {item}
                      </span>
                    ))}
                  </div>
                )}

                {/* Personal Notes Content or Edit Box */}
                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={4}
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono resize-none focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedDayToEdit(null)}
                        className="px-3 py-1 rounded-md bg-slate-800 text-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(d.day)}
                        className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  d.notes && (
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed mt-2">
                      {d.notes}
                    </div>
                  )
                )}
              </div>
            );
          })}

          {daysWithNotes.length === 0 && (
            <div className="arc-card p-12 text-center">
              <p className="text-slate-400 text-sm">No notes or revision concepts found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Interview Questions Flashcards */}
      {activeTab === 'interview' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            <strong>Day 59 Interview Prep:</strong> High-frequency technical questions asked at Top Tech Companies for Core Java and Spring Boot roles. Test your recall before opening answers!
          </div>

          {filteredQuestions.map((q) => {
            const isExpanded = expandedQuestions[q.id];
            return (
              <div key={q.id} className="arc-card p-5 transition-all border-slate-800">
                <div
                  onClick={() => toggleQuestionExpanded(q.id)}
                  className="flex items-start justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-indigo-600/20 text-indigo-400 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      #{q.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-cyan-500/20">
                          {q.topic}
                        </span>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          q.difficulty === 'Hard' ? 'text-rose-400 bg-rose-500/10' : 'text-amber-400 bg-amber-500/10'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 leading-snug">
                        {q.question}
                      </h4>
                    </div>
                  </div>

                  <div className="p-1 text-slate-400 flex-shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Answer reveal */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 animate-fadeIn">
                    <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                      {q.answer}
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-500 font-mono">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Tags: {q.tags.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

