import React, { useState, useMemo } from 'react';
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
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Cpu,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Boxes,
  FileCode2,
  Clock,
  Award,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { SYSTEM_PROJECTS } from '../data/projectsData';
import { usePlanner } from '../context/PlannerContext';
import GlassBadge from '../components/glass/GlassBadge';
import GlassButton from '../components/glass/GlassButton';
import GlassInput from '../components/glass/GlassInput';
import GlassCard from '../components/glass/GlassCard';
import GlassPanel from '../components/glass/GlassPanel';

export default function ProjectsPage() {
  const { triggerCelebration } = usePlanner();
  const [selectedProjectId, setSelectedProjectId] = useState(SYSTEM_PROJECTS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [activeSnippetIdx, setActiveSnippetIdx] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);

  const [completedProjects, setCompletedProjects] = useState(() => {
    try {
      const stored = localStorage.getItem('winter_arc_completed_projects');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const completedCount = useMemo(() => {
    return Object.values(completedProjects).filter(Boolean).length;
  }, [completedProjects]);

  const earnedXP = completedCount * 250;
  const totalCount = SYSTEM_PROJECTS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return SYSTEM_PROJECTS.filter((proj) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        categoryFilter === 'ALL' ||
        (categoryFilter === 'REST' && proj.category.includes('REST')) ||
        (categoryFilter === 'SECURITY' && proj.category.includes('Security')) ||
        (categoryFilter === 'REDIS' && proj.category.includes('Redis')) ||
        (categoryFilter === 'MICROSERVICES' && proj.category.includes('Microservice'));

      const matchesDifficulty =
        difficultyFilter === 'ALL' ||
        proj.difficulty.toLowerCase().includes(difficultyFilter.toLowerCase());

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, categoryFilter, difficultyFilter]);

  // Keep selected project valid
  const activeProject =
    filteredProjects.find((p) => p.id === selectedProjectId) ||
    SYSTEM_PROJECTS.find((p) => p.id === selectedProjectId) ||
    SYSTEM_PROJECTS[0];

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleProjectComplete = (projId) => {
    setCompletedProjects((prev) => {
      const next = { ...prev, [projId]: !prev[projId] };
      localStorage.setItem('winter_arc_completed_projects', JSON.stringify(next));
      if (next[projId]) {
        triggerCelebration();
      }
      return next;
    });
  };

  // Helper for HTTP method badge colors
  const getMethodBadgeStyle = (method) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'POST':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'DELETE':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    }
  };

  const isCurrentDone = Boolean(completedProjects[activeProject.id]);

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* ── Top Apple Liquid Glass Hero Banner ──────────────────────────── */}
      <div className="glass-panel relative rounded-3xl p-6 sm:p-8 overflow-hidden">
        {/* Soft radial ambient sheen */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-sm backdrop-blur-md">
                <Server className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
                System Engineering Track
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Production Backend System Assignments
            </h1>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal">
              Full enterprise architectural blueprints, normalized SQL schemas, REST endpoint contracts, and production-tested starter implementations designed for Java & Spring Boot mastery.
            </p>
          </div>

          {/* Frosted Vision Progress Island */}
          <div className="flex-shrink-0 glass-ultra rounded-2xl p-4 sm:p-5 border border-white/10 shadow-lg min-w-[260px] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono font-medium flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Track Progress
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {completedCount} / {totalCount} Built
              </span>
            </div>

            {/* Apple Progress Bar */}
            <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden p-[1px] border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                +{earnedXP} XP Earned
              </span>
              <span className="text-slate-300 font-bold">{progressPercent}% Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Apple Liquid Glass Filter & Search Toolbar ──────────────────── */}
      <div className="glass-thin rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <GlassInput
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search systems by name, JPA, Redis, Kafka, or tech..."
            />
          </div>

          {/* Category Segmented Control */}
          <div className="glass-ultra p-1 rounded-xl flex items-center overflow-x-auto border border-white/10 no-scrollbar">
            {[
              { id: 'ALL', label: 'All Systems' },
              { id: 'REST', label: 'REST & JPA' },
              { id: 'SECURITY', label: 'Security & Auth' },
              { id: 'REDIS', label: 'Redis & Cache' },
              { id: 'MICROSERVICES', label: 'Gateway & Kafka' }
            ].map((cat) => {
              const active = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 apple-press select-none ${
                    active
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Difficulty Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5 text-xs">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            Difficulty:
          </span>
          {[
            { id: 'ALL', label: 'All Levels' },
            { id: 'Intermediate', label: 'Intermediate' },
            { id: 'Advanced', label: 'Advanced' },
            { id: 'Production', label: 'Production / Capstone' }
          ].map((diff) => {
            const active = difficultyFilter === diff.id;
            return (
              <button
                key={diff.id}
                onClick={() => setDifficultyFilter(diff.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all apple-press ${
                  active
                    ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/40 shadow-sm font-bold'
                    : 'bg-black/20 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                {diff.label}
              </button>
            );
          })}

          {(searchQuery || categoryFilter !== 'ALL' || difficultyFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
                setDifficultyFilter('ALL');
              }}
              className="ml-auto text-[11px] text-cyan-400 hover:text-cyan-300 underline font-mono cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Apple Liquid Glass Project Selector Cards ───────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredProjects.map((proj) => {
          const isSelected = activeProject.id === proj.id;
          const isDone = Boolean(completedProjects[proj.id]);

          return (
            <div
              key={proj.id}
              onClick={() => {
                setSelectedProjectId(proj.id);
                setActiveSnippetIdx(0);
              }}
              className={`group relative rounded-2xl p-4 cursor-pointer transition-all duration-300 apple-press select-none flex flex-col justify-between ${
                isSelected
                  ? 'glass-card border-cyan-400/50 ring-2 ring-cyan-400/30 shadow-[0_8px_32px_rgba(6,182,212,0.22)] bg-gradient-to-b from-white/[0.08] to-cyan-500/[0.05]'
                  : 'glass-ultra hover:bg-white/[0.06] border border-white/10 hover:border-white/20'
              }`}
            >
              {/* Luminous top border sheen */}
              <div
                className={`absolute inset-x-0 top-0 h-[1px] rounded-t-2xl transition-opacity duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-100'
                    : 'bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-40 group-hover:opacity-80'
                }`}
              />

              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span
                    className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    {proj.dayRange}
                  </span>

                  {isDone ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                      <CheckCircle2 className="w-3 h-3" />
                      Done
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Circle className="w-2.5 h-2.5" />
                      Pending
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-100 leading-snug line-clamp-2 mt-1 group-hover:text-cyan-300 transition-colors">
                  {proj.title}
                </h3>

                <p className="text-[11px] text-slate-400 mt-1 font-mono line-clamp-1">
                  {proj.category}
                </p>
              </div>

              {/* Tech stack preview pills */}
              <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-1">
                {proj.techStack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-slate-300 border border-white/5"
                  >
                    {tech}
                  </span>
                ))}
                {proj.techStack.length > 3 && (
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded text-slate-500">
                    +{proj.techStack.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="glass-panel rounded-2xl p-8 text-center space-y-2">
          <p className="text-sm text-slate-300 font-semibold">No systems matched your search filter.</p>
          <p className="text-xs text-slate-500">Try clearing your search query or changing the filter options.</p>
        </div>
      )}

      {/* ── Active Project Main Liquid Glass Inspector ──────────────────── */}
      <div className="glass-panel relative rounded-3xl p-6 sm:p-8 space-y-8 overflow-hidden shadow-2xl">
        {/* Subtle decorative specular glow behind header */}
        <div className="absolute top-0 left-1/3 w-80 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Project Header Banner */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-5 pb-6 border-b border-white/10">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <GlassBadge color="indigo" size="xs">
                {activeProject.phase}
              </GlassBadge>
              <GlassBadge color="cyan" size="xs">
                {activeProject.dayRange}
              </GlassBadge>
              <GlassBadge
                color={
                  activeProject.difficulty.includes('Production')
                    ? 'rose'
                    : activeProject.difficulty.includes('Advanced')
                    ? 'amber'
                    : 'emerald'
                }
                size="xs"
              >
                {activeProject.difficulty}
              </GlassBadge>
              <GlassBadge color="slate" size="xs">
                {activeProject.category}
              </GlassBadge>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight leading-tight">
              {activeProject.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300/95 leading-relaxed font-normal">
              {activeProject.description}
            </p>
          </div>

          {/* Complete System CTA Button */}
          <div className="flex-shrink-0 self-start md:self-center">
            <button
              onClick={() => handleToggleProjectComplete(activeProject.id)}
              className={`apple-press px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all duration-200 select-none shadow-lg ${
                isCurrentDone
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-emerald-500/10 hover:bg-emerald-500/30'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-600/30 border border-indigo-400/30'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${isCurrentDone ? 'text-emerald-300' : 'text-white'}`}
              />
              <span>
                {isCurrentDone
                  ? 'System Completed! (Tap to Undo)'
                  : 'Mark System Completed (+250 XP)'}
              </span>
            </button>
          </div>
        </div>

        {/* 2. Target Tech Stack Pills */}
        <div className="space-y-2.5">
          <span className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Target Technology Stack & Ecosystem:
          </span>
          <div className="flex flex-wrap gap-2">
            {activeProject.techStack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-xl glass-ultra border border-white/10 text-xs font-mono font-medium text-slate-200 shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* 3. System Architecture Diagram - macOS Frosted Window */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              System Architecture Flow & Topology:
            </span>
            <button
              onClick={() => handleCopy(activeProject.architecture.trim(), 'arch')}
              className="apple-press text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-ultra border border-white/10 transition-colors"
            >
              {copiedKey === 'arch' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied Diagram</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Diagram</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 backdrop-blur-xl shadow-lg">
            {/* macOS Window Title Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] inline-block shadow-sm" />
              </div>
              <span className="text-[11px] font-mono text-slate-400 font-semibold">
                architecture-flow.topology
              </span>
              <div className="w-12" />
            </div>

            <pre className="p-4 sm:p-5 text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed select-text">
              {activeProject.architecture.trim()}
            </pre>
          </div>
        </div>

        {/* 4. Database Schema Section - macOS Frosted Window */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-400" />
              Database Schema & DDL Specifications:
            </span>
            <button
              onClick={() => handleCopy(activeProject.databaseSchema, 'schema')}
              className="apple-press text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-ultra border border-white/10 transition-colors"
            >
              {copiedKey === 'schema' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied SQL</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy DDL SQL</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 backdrop-blur-xl shadow-lg">
            {/* macOS Window Title Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] inline-block shadow-sm" />
              </div>
              <span className="text-[11px] font-mono text-slate-400 font-semibold">
                schema.sql — MySQL 8 / PostgreSQL DDL
              </span>
              <div className="w-12" />
            </div>

            <pre className="p-4 sm:p-5 text-xs font-mono text-cyan-300/90 overflow-x-auto leading-relaxed select-text">
              <code>{activeProject.databaseSchema}</code>
            </pre>
          </div>
        </div>

        {/* 5. REST API Endpoints Specification - Apple Frosted Table */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-400" />
              REST API Endpoints Specification:
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {activeProject.apiEndpoints.length} Endpoints Defined
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 font-semibold">Method</th>
                  <th className="p-3.5 font-semibold">Endpoint Path</th>
                  <th className="p-3.5 font-semibold">Description</th>
                  <th className="p-3.5 font-semibold">Expected Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeProject.apiEndpoints.map((ep, i) => (
                  <tr
                    key={i}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    onClick={() => handleCopy(ep.path, `ep_${i}`)}
                  >
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-md font-bold text-[10px] border shadow-sm ${getMethodBadgeStyle(
                          ep.method
                        )}`}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-200 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5 whitespace-nowrap">
                      <span>{ep.path}</span>
                      {copiedKey === `ep_${i}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </td>
                    <td className="p-3.5 text-slate-300/80 min-w-[200px]">{ep.desc}</td>
                    <td className="p-3.5 text-emerald-400 font-semibold whitespace-nowrap">
                      {ep.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Starter Code Templates - Apple macOS Tabbed Code Explorer */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-emerald-400" />
              Production Starter Code Templates:
            </span>
            <button
              onClick={() => {
                const currentSnippet = activeProject.starterCodeSnippets[activeSnippetIdx];
                if (currentSnippet) {
                  handleCopy(currentSnippet.code, `snippet_${activeSnippetIdx}`);
                }
              }}
              className="apple-press text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-ultra border border-white/10 transition-colors"
            >
              {copiedKey === `snippet_${activeSnippetIdx}` ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied Code</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 backdrop-blur-xl shadow-lg">
            {/* macOS Window Header with Tabs */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-white/[0.04] border-b border-white/10 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] inline-block shadow-sm" />
              </div>

              {/* Tabs for Multiple Snippets */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {activeProject.starterCodeSnippets.map((snippet, idx) => {
                  const active = activeSnippetIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveSnippetIdx(idx)}
                      className={`apple-press px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-white/15 text-white border border-white/20 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{snippet.filename}</span>
                    </button>
                  );
                })}
              </div>

              <div className="hidden sm:block text-[10px] font-mono text-slate-500 uppercase">
                Java 21 / Spring Boot 3
              </div>
            </div>

            {/* Code Body */}
            {activeProject.starterCodeSnippets[activeSnippetIdx] && (
              <pre className="p-4 sm:p-5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed select-text">
                <code>{activeProject.starterCodeSnippets[activeSnippetIdx].code}</code>
              </pre>
            )}
          </div>
        </div>

        {/* 7. Verification & Testing Checklist - macOS Terminal Panel */}
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 backdrop-blur-xl shadow-lg">
          <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] inline-block shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] inline-block shadow-sm" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] inline-block shadow-sm" />
              <span className="text-[11px] font-mono text-amber-300 font-bold ml-2 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                Verification & Acceptance Test Suite
              </span>
            </div>

            <button
              onClick={() => handleCopy(activeProject.testingInstructions, 'test')}
              className="apple-press text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-0.5 rounded glass-ultra border border-white/10"
            >
              {copiedKey === 'test' ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>{copiedKey === 'test' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-4 sm:p-5 text-xs font-mono text-slate-300 leading-relaxed space-y-2">
            <p className="text-amber-200/90 font-semibold">Test Specification:</p>
            <p className="text-slate-300/90 select-text bg-white/[0.02] p-3 rounded-xl border border-white/5">
              {activeProject.testingInstructions}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
