import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  Save,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  X,
  ArrowRight,
  StickyNote
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { TOP_INTERVIEW_QUESTIONS } from '../data/interviewQuestionsData';
import { getDayQuestionMeta } from '../data/questionBankData';
import { formatShortDate } from '../utils/dateUtils';
import { confirmAction, toast } from '../utils/alerts';

const FILTERS = [
  { id: 'studied', label: 'Studied so far' },
  { id: 'notes', label: 'My notes' },
  { id: 'todo', label: 'To revise' },
  { id: 'all', label: 'All days' }
];

export default function NotesRevisionPage() {
  const { days, updateDayNotes, currentChallengeDay, revisedDays, toggleDayRevised } = usePlanner();

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'interview'
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('studied');
  const [selectedDayToEdit, setSelectedDayToEdit] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({ 1: true });

  const toggleQuestionExpanded = (id) => {
    setExpandedQuestions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Real lecture topics (from the quiz files); fall back to the plan's revision list
  const topicsFor = (d) => {
    const t = getDayQuestionMeta(d.day)?.topics;
    return t && t.length ? t : d.revision || [];
  };

  const studied = (d) => d.completed || d.day <= currentChallengeDay;
  const hasNotes = (d) => Boolean(d.notes && d.notes.trim());

  const counts = useMemo(() => ({
    studied: days.filter(studied).length,
    notes: days.filter(hasNotes).length,
    todo: days.filter((d) => studied(d) && !revisedDays[d.day]).length,
    all: days.length
  }), [days, currentChallengeDay, revisedDays]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleDays = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return days.filter((d) => {
      if (filter === 'studied' && !studied(d)) return false;
      if (filter === 'notes' && !hasNotes(d)) return false;
      if (filter === 'todo' && !(studied(d) && !revisedDays[d.day])) return false;
      if (!q) return true;
      return (
        String(d.day) === q ||
        d.title.toLowerCase().includes(q) ||
        (d.notes || '').toLowerCase().includes(q) ||
        topicsFor(d).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [days, filter, searchQuery, currentChallengeDay, revisedDays]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartEdit = (day) => {
    setSelectedDayToEdit(day.day);
    setEditingText(day.notes || '');
  };

  const handleSaveEdit = (dayNumber) => {
    updateDayNotes(dayNumber, editingText);
    setSelectedDayToEdit(null);
    toast('Notes saved');
  };

  const handleDeleteNotes = async (dayNumber) => {
    const ok = await confirmAction({
      title: `Clear Day ${dayNumber} notes?`,
      text: "Your personal notes for this day will be deleted. This can't be undone.",
      confirmText: 'Clear Notes',
      icon: 'warning',
      danger: true
    });
    if (ok) {
      updateDayNotes(dayNumber, '');
      toast('Notes cleared');
    }
  };

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

  const revisedCount = days.filter((d) => revisedDays[d.day]).length;
  const revisedPct = days.length ? Math.round((revisedCount / days.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-indigo-400" />
            Notes & Revision
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Each day's key topics and your own notes in one place. Tick a day once you've revised it.
          </p>
        </div>
        <div className="glass-ultra rounded-2xl px-4 py-3 border border-white/10 min-w-[220px]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Revised</span>
            <span className="text-emerald-300 font-bold">{revisedCount} / {days.length}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-700" style={{ width: `${revisedPct}%` }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="segmented-control inline-flex items-center gap-1" role="tablist">
        {[
          { id: 'notes', label: 'Topics & notes', icon: StickyNote },
          { id: 'interview', label: `Interview questions (${TOP_INTERVIEW_QUESTIONS.length})`, icon: HelpCircle }
        ].map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => {
              setActiveTab(t.id);
              setSearchQuery('');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === t.id ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="sticky top-[4.5rem] z-20 glass-thin rounded-2xl p-3 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search"
            placeholder={
              activeTab === 'notes'
                ? 'Search topics, notes or a day number (e.g. HashMap, N+1, 42)…'
                : 'Search interview questions (e.g. JWT, IoC, @Transactional)…'
            }
            className="w-full pl-10 pr-9 py-2 bg-black/25 border border-white/10 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/20"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-100">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {activeTab === 'notes' && (
          <div className="segmented-control flex flex-wrap items-center gap-1" role="group" aria-label="Filter days">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === f.id ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label} <span className="opacity-60 font-mono">{counts[f.id]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: topics & notes */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          {visibleDays.map((d) => {
            const isRevised = Boolean(revisedDays[d.day]);
            const isEditing = selectedDayToEdit === d.day;
            const isToday = d.day === currentChallengeDay;
            const topics = topicsFor(d);
            const title = d.title.replace(/^(Spring )?Lecture #\d+:\s*/, '');
            return (
              <div key={d.day} className={`glass-card !rounded-2xl p-4 sm:p-5 ${isRevised ? 'ring-1 ring-emerald-400/30' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] border ${isToday ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40' : 'bg-white/[0.04] text-cyan-400 border-white/10'}`}>
                        {isToday ? `Today · Day ${d.day}` : `Day ${d.day}`}
                      </span>
                      {d.date && <span className="text-[11px] font-mono text-slate-500">{formatShortDate(d.date)}</span>}
                      {d.completed && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">done</span>}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">{title}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleDayRevised(d.day)}
                      aria-pressed={isRevised}
                      className={`apple-press px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isRevised
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : 'glass-ultra text-slate-300 border border-white/10 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isRevised ? 'Revised' : 'Mark revised'}
                    </button>
                    <button onClick={() => handleStartEdit(d)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]" title="Edit notes" aria-label={`Edit Day ${d.day} notes`}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {hasNotes(d) && (
                      <button onClick={() => handleDeleteNotes(d.day)} className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/[0.06]" title="Clear notes" aria-label={`Clear Day ${d.day} notes`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <Link to={`/daily-planner?day=${d.day}`} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]" title="Open day" aria-label={`Open Day ${d.day}`}>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {topics.length > 0 && (
                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    {topics.map((t, i) => (
                      <li key={i} className="text-xs text-slate-300 flex gap-2 leading-relaxed">
                        <span className={isRevised ? 'text-emerald-400' : 'text-slate-500'}>•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {isEditing ? (
                  <div className="space-y-2 mt-3">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={4}
                      autoFocus
                      aria-label={`Day ${d.day} notes`}
                      placeholder="Key takeaways, gotchas, code snippets…"
                      className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-xs text-slate-100 font-mono resize-y focus:outline-none focus:border-indigo-400/70"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSelectedDayToEdit(null)} className="px-3 py-1.5 rounded-lg glass-ultra border border-white/10 text-slate-300 text-xs">
                        Cancel
                      </button>
                      <button onClick={() => handleSaveEdit(d.day)} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1">
                        <Save className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  hasNotes(d) && (
                    <div className="p-3 rounded-xl bg-black/25 border border-white/[0.06] text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed mt-3">
                      {d.notes}
                    </div>
                  )
                )}
              </div>
            );
          })}

          {visibleDays.length === 0 && (
            <div className="glass-panel rounded-2xl p-10 text-center space-y-2">
              <p className="text-sm text-slate-300 font-semibold">
                {filter === 'notes' && !searchQuery ? "You haven't written any notes yet." : filter === 'todo' && !searchQuery ? 'Everything you have studied is revised.' : 'Nothing matches.'}
              </p>
              <button onClick={() => { setSearchQuery(''); setFilter('all'); }} className="text-xs text-cyan-400 hover:underline">
                Show all days
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Interview Questions Flashcards */}
      {activeTab === 'interview' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            Common Core Java and Spring Boot interview questions. Try to answer out loud before opening each one.
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

