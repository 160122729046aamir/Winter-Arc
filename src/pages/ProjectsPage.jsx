import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Server,
  Database,
  Layers,
  Code2,
  Terminal,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Sparkles,
  Cpu,
  Globe,
  FileCode2,
  Award,
  CalendarDays,
  Flag,
  Target,
  ListChecks,
  BookOpen,
  Rocket,
  ClipboardCheck,
  ArrowRight,
  Clock,
  FolderOpen
} from 'lucide-react';
import { SYSTEM_PROJECTS } from '../data/projectsData';
import { usePlanner } from '../context/PlannerContext';
import { getProjectSchedule } from '../utils/projectSchedule';
import { formatDateWithDay, formatShortDate } from '../utils/dateUtils';
import GlassBadge from '../components/glass/GlassBadge';

const STATUS_STYLE = {
  completed: { label: 'Completed', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  upcoming: { label: 'Upcoming', cls: 'bg-white/5 text-slate-300 border-white/10' },
  in_progress: { label: 'In progress', cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  due_today: { label: 'Due today', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  overdue: { label: 'Overdue', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' }
};

const METHOD_STYLE = {
  GET: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  POST: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  PUT: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  PATCH: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  DELETE: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
};

function SectionTitle({ icon: Icon, color = 'text-cyan-400', children, right }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
        <Icon className={`w-4 h-4 ${color}`} />
        {children}
      </span>
      {right}
    </div>
  );
}

function CodeWindow({ title, children, tone = 'text-slate-200' }) {
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 backdrop-blur-xl shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
        </div>
        <span className="text-[11px] font-mono text-slate-400 font-semibold">{title}</span>
        <div className="w-12" />
      </div>
      <pre className={`p-4 sm:p-5 text-xs font-mono ${tone} overflow-x-auto leading-relaxed select-text`}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

function BulletList({ items, icon: Icon = Circle, iconClass = 'text-slate-500' }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <Icon className={`w-3.5 h-3.5 mt-1 flex-shrink-0 ${iconClass}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ProjectsPage() {
  const { days, today, completedProjects, toggleProjectComplete } = usePlanner();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSnippetIdx, setActiveSnippetIdx] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);

  // Schedules from the live plan dates
  const projects = useMemo(
    () =>
      SYSTEM_PROJECTS.map((p) => ({
        ...p,
        schedule: getProjectSchedule(p, days, today, Boolean(completedProjects?.[p.id]))
      })),
    [days, today, completedProjects]
  );

  const requestedId = searchParams.get('project');
  const defaultProject =
    projects.find((p) => ['in_progress', 'due_today', 'overdue'].includes(p.schedule.status)) ||
    projects.find((p) => p.schedule.status === 'upcoming') ||
    projects[0];
  const activeProject = projects.find((p) => p.id === requestedId) || defaultProject;
  const sched = activeProject.schedule;
  const isDone = sched.status === 'completed';

  const completedCount = projects.filter((p) => p.schedule.status === 'completed').length;
  const progressPercent = Math.round((completedCount / projects.length) * 100);

  const selectProject = (id) => {
    setSearchParams({ project: id });
    setActiveSnippetIdx(0);
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const CopyButton = ({ text, id, label = 'Copy' }) => (
    <button
      onClick={() => handleCopy(text, id)}
      className="apple-press text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-ultra border border-white/10 transition-colors"
    >
      {copiedKey === id ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-semibold">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );

  const prereqDays = (activeProject.prerequisites || []).map((pr) => {
    const d = days.find((x) => x.day === pr.day);
    return { ...pr, date: d?.date, done: !!d?.completed };
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Hero */}
      <div className="glass-panel relative rounded-3xl p-6 sm:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
                <Server className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
                Build alongside the plan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              System Projects
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
              Each project runs in parallel with your daily lectures. Start when its first lecture comes up and
              finish by the last one; every milestone unlocks on the day its topic is taught. Dates follow your
              schedule, so they move if you skip, pause or reschedule.
            </p>
          </div>

          <div className="flex-shrink-0 glass-ultra rounded-2xl p-4 sm:p-5 border border-white/10 min-w-[260px] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono font-medium flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Projects built
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {completedCount} / {projects.length}
              </span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden p-[1px] border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />+{completedCount * 250} XP earned
              </span>
              <span>250 XP each</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project timeline cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {projects.map((p) => {
          const selected = p.id === activeProject.id;
          const st = STATUS_STYLE[p.schedule.status];
          return (
            <button
              key={p.id}
              onClick={() => selectProject(p.id)}
              className={`text-left group relative rounded-2xl p-4 transition-all duration-300 apple-press flex flex-col justify-between ${
                selected
                  ? 'glass-card border-cyan-400/50 ring-2 ring-cyan-400/30 shadow-[0_8px_32px_rgba(6,182,212,0.22)]'
                  : 'glass-ultra hover:bg-white/[0.06] border border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${st.cls}`}>
                    {st.label}
                  </span>
                  {p.schedule.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : null}
                </div>
                <h3 className="text-sm font-bold text-slate-100 leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
                  {p.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">{p.category}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-300 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3 h-3 text-cyan-400" />
                  {p.schedule.startDate ? formatShortDate(p.schedule.startDate) : '—'} →{' '}
                  {p.schedule.endDate ? formatShortDate(p.schedule.endDate) : '—'}
                </div>
                <div className="text-slate-500">
                  {p.schedule.startLabel} → {p.schedule.endLabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Inspector */}
      <div className="glass-panel relative rounded-3xl p-6 sm:p-8 space-y-8 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-80 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-5 pb-6 border-b border-white/10">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <GlassBadge
                color={activeProject.difficulty.includes('Capstone') ? 'rose' : activeProject.difficulty.includes('Advanced') ? 'amber' : 'emerald'}
                size="xs"
              >
                {activeProject.difficulty}
              </GlassBadge>
              <GlassBadge color="slate" size="xs">{activeProject.category}</GlassBadge>
              <GlassBadge color="indigo" size="xs">
                <Clock className="w-3 h-3" /> {activeProject.estimatedHours}
              </GlassBadge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight leading-tight">
              {activeProject.title}
            </h2>
            <p className="text-sm text-cyan-200/90 font-medium">{activeProject.tagline}</p>
          </div>

          <button
            onClick={() => toggleProjectComplete(activeProject.id)}
            className={`flex-shrink-0 self-start apple-press px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all shadow-lg ${
              isDone
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30'
                : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border border-indigo-400/30'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isDone ? 'Completed (tap to undo)' : 'Mark project complete (+250 XP)'}
          </button>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="glass-ultra rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] font-mono uppercase text-slate-400 mb-1">Start</p>
            <p className="text-sm font-bold text-slate-100">{sched.startDate ? formatDateWithDay(sched.startDate) : '—'}</p>
            <p className="text-[11px] font-mono text-cyan-400">{sched.startLabel}</p>
          </div>
          <div className="glass-ultra rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] font-mono uppercase text-slate-400 mb-1">Finish by</p>
            <p className="text-sm font-bold text-slate-100">{sched.endDate ? formatDateWithDay(sched.endDate) : '—'}</p>
            <p className="text-[11px] font-mono text-cyan-400">{sched.endLabel}</p>
          </div>
          <div className="glass-ultra rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] font-mono uppercase text-slate-400 mb-1">Status</p>
            <span className={`inline-block text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[sched.status].cls}`}>
              {STATUS_STYLE[sched.status].label}
            </span>
            <p className="text-[11px] font-mono text-slate-400 mt-1">
              {sched.status === 'upcoming' && sched.startDate && `Starts in ${Math.max(0, Math.round((new Date(sched.startDate + 'T12:00:00') - new Date(today + 'T12:00:00')) / 86400000))} days`}
              {sched.status === 'in_progress' && `${sched.daysLeft} days left`}
              {sched.status === 'due_today' && 'Finish today'}
              {sched.status === 'overdue' && `${Math.abs(sched.daysLeft)} days past the finish date`}
              {sched.status === 'completed' && 'Nice work'}
            </p>
          </div>
        </div>
        {activeProject.afterPlan && (
          <p className="text-xs text-amber-200/90 -mt-4 leading-relaxed">
            The GateKeeper videos come after Lecture #40, the last lecture in your plan, so this capstone starts the
            study day after Day {days[days.length - 1].day} and its milestones follow the 5 project videos.
          </p>
        )}

        {/* Overview & goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <SectionTitle icon={BookOpen}>What you will build</SectionTitle>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{activeProject.overview}</p>
          </div>
          <div className="space-y-3">
            <SectionTitle icon={Target} color="text-emerald-400">What you will learn</SectionTitle>
            <BulletList items={activeProject.learningGoals} icon={CheckCircle2} iconClass="text-emerald-400" />
          </div>
        </div>

        {/* Prerequisites */}
        <div className="space-y-3">
          <SectionTitle icon={Flag} color="text-indigo-400">Lectures this project uses</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {prereqDays.map((pr) => (
              <Link
                key={pr.day}
                to={`/daily-planner?day=${pr.day}`}
                className="apple-press flex items-center gap-2 px-3 py-1.5 rounded-xl glass-ultra border border-white/10 hover:border-cyan-400/40 text-xs"
              >
                {pr.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Circle className="w-3.5 h-3.5 text-slate-500" />}
                <span className="font-mono text-cyan-300">Day {pr.day}</span>
                <span className="text-slate-300">{pr.topic}</span>
                {pr.date && <span className="text-slate-500 font-mono">· {formatShortDate(pr.date)}</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          <SectionTitle icon={ListChecks} color="text-amber-400">Milestones (do each one on its day)</SectionTitle>
          <ol className="relative border-l border-white/10 ml-2 space-y-5">
            {sched.milestones.map((m, i) => {
              const past = m.date && m.date < today;
              const isToday = m.date === today;
              return (
                <li key={i} className="ml-5">
                  <span
                    className={`absolute -left-[7px] mt-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                      isToday ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_10px_#22d3ee]' : past ? 'bg-slate-500 border-slate-400' : 'bg-slate-900 border-slate-600'
                    }`}
                  />
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold text-cyan-300">{m.label}</span>
                    {m.date && <span className="text-xs font-mono text-slate-400">{formatDateWithDay(m.date)}</span>}
                    {isToday && <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">TODAY</span>}
                    {m.day && (
                      <Link to={`/daily-planner?day=${m.day}`} className="text-[11px] text-indigo-300 hover:underline flex items-center gap-0.5">
                        open day <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-100">{m.title}</p>
                  {m.resource && (
                    <p className="text-[11px] font-mono text-amber-300/90 flex items-center gap-1 mt-0.5">
                      <FolderOpen className="w-3 h-3" /> {m.resource}
                    </p>
                  )}
                  <ul className="mt-1.5 space-y-1">
                    {m.tasks.map((t, j) => (
                      <li key={j} className="text-xs text-slate-300 leading-relaxed flex gap-2">
                        <span className="text-slate-500">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Requirements */}
        <div className="space-y-3">
          <SectionTitle icon={ClipboardCheck} color="text-rose-400">Rules your implementation must follow</SectionTitle>
          <BulletList items={activeProject.requirements} icon={Check} iconClass="text-rose-300" />
        </div>

        {/* Tech stack */}
        <div className="space-y-2.5">
          <SectionTitle icon={Cpu}>Tech stack</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {activeProject.techStack.map((tech) => (
              <span key={tech} className="px-3 py-1.5 rounded-xl glass-ultra border border-white/10 text-xs font-mono text-slate-200">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Architecture */}
        <div className="space-y-2.5">
          <SectionTitle icon={Layers} right={<CopyButton text={activeProject.architecture.trim()} id="arch" />}>
            Architecture
          </SectionTitle>
          <CodeWindow title="architecture" tone="text-emerald-300/90">{activeProject.architecture.replace(/^\n/, '')}</CodeWindow>
        </div>

        {/* Schema */}
        <div className="space-y-2.5">
          <SectionTitle icon={Database} color="text-amber-400" right={<CopyButton text={activeProject.databaseSchema} id="schema" label="Copy SQL" />}>
            Database schema
          </SectionTitle>
          <CodeWindow title="schema.sql" tone="text-cyan-300/90">{activeProject.databaseSchema}</CodeWindow>
        </div>

        {/* Endpoints */}
        <div className="space-y-2.5">
          <SectionTitle icon={Globe} color="text-indigo-400" right={<span className="text-[11px] font-mono text-slate-400">{activeProject.apiEndpoints.length} endpoints</span>}>
            API endpoints
          </SectionTitle>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 font-semibold">Method</th>
                  <th className="p-3.5 font-semibold">Path</th>
                  <th className="p-3.5 font-semibold">What it does</th>
                  <th className="p-3.5 font-semibold">Responses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeProject.apiEndpoints.map((ep, i) => (
                  <tr key={i} className="hover:bg-white/[0.03]">
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] border ${METHOD_STYLE[ep.method] || 'bg-purple-500/15 text-purple-300 border-purple-500/30'}`}>
                        {ep.method}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-200 whitespace-nowrap">{ep.path}</td>
                    <td className="p-3.5 text-slate-300/80 min-w-[220px] font-sans">{ep.desc}</td>
                    <td className="p-3.5 text-emerald-400 font-semibold whitespace-nowrap">{ep.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {activeProject.sampleRequest && (
            <CodeWindow title="example request & response" tone="text-slate-200">{activeProject.sampleRequest}</CodeWindow>
          )}
        </div>

        {/* Starter code */}
        <div className="space-y-2.5">
          <SectionTitle
            icon={Code2}
            color="text-emerald-400"
            right={
              <CopyButton
                text={activeProject.starterCodeSnippets[activeSnippetIdx]?.code}
                id={`snippet_${activeSnippetIdx}`}
                label="Copy file"
              />
            }
          >
            Starter code
          </SectionTitle>
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-white/[0.04] border-b border-white/10">
              {activeProject.starterCodeSnippets.map((snippet, idx) => (
                <button
                  key={snippet.filename}
                  onClick={() => setActiveSnippetIdx(idx)}
                  className={`apple-press px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 ${
                    activeSnippetIdx === idx ? 'bg-white/15 text-white border border-white/20 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                  {snippet.filename}
                </button>
              ))}
            </div>
            <pre className="p-4 sm:p-5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed select-text">
              <code>{activeProject.starterCodeSnippets[activeSnippetIdx]?.code}</code>
            </pre>
          </div>
        </div>

        {/* Testing */}
        <div className="space-y-3">
          <SectionTitle icon={Terminal} color="text-amber-400">How to test it</SectionTitle>
          <ol className="space-y-2">
            {activeProject.testingSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Stretch & DoD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <SectionTitle icon={Rocket} color="text-indigo-400">Stretch goals (optional)</SectionTitle>
            <BulletList items={activeProject.stretchGoals} icon={Sparkles} iconClass="text-indigo-300" />
          </div>
          <div className="space-y-3">
            <SectionTitle icon={Award} color="text-emerald-400">Done when</SectionTitle>
            <BulletList items={activeProject.definitionOfDone} icon={CheckCircle2} iconClass="text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
