import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  CheckCircle2,
  Clock,
  PlayCircle,
  Code2,
  Calendar,
  Save,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import ProgressBar from '../components/common/ProgressBar';

const SPRINTS_METADATA = [
  {
    week: 1,
    title: 'Sprint 1: Java Fundamentals & OOP Genesis',
    daysRange: [1, 7],
    phase: 'Phase 1: Core Java',
    objectives: [
      'Master JVM internal architecture, JDK vs JRE, and byte-code execution',
      'Understand 2s complement, memory representations, and data type casting rules',
      'Build solid foundation in control flow, loops, and array memory allocation',
      'Implement first custom classes, constructors, and method overloading'
    ],
    codingGoals: 'Write 10+ algorithms manipulating arrays, matrices, and recursion'
  },
  {
    week: 2,
    title: 'Sprint 2: Deep OOP, Generics & Strings',
    daysRange: [8, 14],
    phase: 'Phase 1: Core Java',
    objectives: [
      'Implement strict encapsulation, inheritance hierarchy, and dynamic method dispatch',
      'Deconstruct Object class: equals() & hashCode() contract and immutability',
      'Master Java Enums, Interfaces (default/static methods), and String Constant Pool',
      'Apply Generics with type bounds and PECS wildcard principle'
    ],
    codingGoals: 'Build custom immutable classes, generic stacks, and string manipulation programs'
  },
  {
    week: 3,
    title: 'Sprint 3: Collections Hierarchy & Stream API',
    daysRange: [15, 21],
    phase: 'Phase 1: Core Java',
    objectives: [
      'Understand Java Collection Framework hierarchy, Iterable, and fail-fast iterators',
      'Internal mechanics of HashMap (Red-Black treeify threshold), HashSet, and TreeMap',
      'PriorityQueue, Comparable vs Comparator chaining',
      'Master Lambdas, Functional Interfaces, and Stream API (intermediate & terminal operations)'
    ],
    codingGoals: 'Implement custom data structures and complex multi-level stream groupings'
  },
  {
    week: 4,
    title: 'Sprint 4: Memory Management, Concurrency & Loom',
    daysRange: [22, 25],
    phase: 'Phase 1: Core Java',
    objectives: [
      'Map JVM runtime memory areas: Stack, Heap, Metaspace, and Garbage Collectors (G1, ZGC)',
      'Thread lifecycle, intrinsic monitor locks, synchronized, and Producer-Consumer pattern',
      'Advanced concurrency: volatile, AtomicInteger, deadlock avoidance, and ExecutorService',
      'Java 21+ Virtual Threads (Project Loom) and CompletableFuture async pipelines'
    ],
    codingGoals: 'Build high-throughput multithreaded simulations and non-blocking pipelines'
  },
  {
    week: 5,
    title: 'Sprint 5: Spring Ecosystem, Maven & IoC',
    daysRange: [26, 32],
    phase: 'Phase 2: Spring Boot',
    objectives: [
      'Deconstruct enterprise Java evolution, Inversion of Control, and loose coupling',
      'Master Apache Maven lifecycle, POM, dependencies, and plugins',
      'Spring IoC container: @Component, @Service, @Autowired, and explicit @Bean methods',
      'Bean scopes (Singleton vs Prototype), Bean lifecycle callbacks, and circular dependency fixes'
    ],
    codingGoals: 'Bootstrap first Spring Boot applications and test loose coupling via interfaces'
  },
  {
    week: 6,
    title: 'Sprint 6: Core Boot Internals, Servlets & CRUD',
    daysRange: [33, 39],
    phase: 'Phase 2: Spring Boot',
    objectives: [
      'Spring Boot Auto-configuration internals and conditional annotations',
      'Type-safe configurations with @ConfigurationProperties and runner interfaces',
      'Layered CRUD architecture (Controller -> Service -> Repository)',
      'How web servers work: Embedded Tomcat, Servlets, and HTTP request pipeline'
    ],
    codingGoals: 'Build end-to-end CRUD REST API connected to MySQL with soft-delete capabilities'
  },
  {
    week: 7,
    title: 'Sprint 7: Spring MVC, DTOs & Aspect-Oriented Programming',
    daysRange: [40, 46],
    phase: 'Phase 2: Spring Boot',
    objectives: [
      'DispatcherServlet request flow and HttpMessageConverters (Jackson)',
      'Data Transfer Objects (DTO) and Jakarta Bean Validation guards',
      'Global exception handling with @RestControllerAdvice and RFC 7807 error formats',
      'Filters vs Interceptors, and Spring AOP cross-cutting concerns (execution benchmarks)'
    ],
    codingGoals: 'Create custom AOP logging annotations and production-grade validation error responses'
  },
  {
    week: 8,
    title: 'Sprint 8: Database Mastery, JPA & Spring Security',
    daysRange: [47, 53],
    phase: 'Phase 2: Spring Boot',
    objectives: [
      'Spring JdbcTemplate vs Hibernate ORM first-level cache and dirty checking',
      'JPA entity relationships (@OneToMany, @ManyToMany), cascading, and solving N+1 problem',
      'Spring Data JPA custom JPQL queries, pagination, and sorting',
      'Spring Transactions (@Transactional propagation and isolation levels)',
      'Spring Security architecture, SecurityFilterChain, and database authentication'
    ],
    codingGoals: 'Model complex relational database schemas and secure endpoints with BCrypt'
  },
  {
    week: 9,
    title: 'Sprint 9: JWT, Capstone Gateway & Graduation',
    daysRange: [54, 60],
    phase: 'Phase 2 & Phase 3',
    objectives: [
      'Stateless JWT authentication filter and OAuth 2.0 / Google Social Login',
      'Testing Spring Boot: JUnit 5, Mockito, and MockMvc integration tests',
      'Build GateKeeper: Production-Grade API Gateway with Microservices, Kafka & Redis',
      'Comprehensive Java & Spring Boot revision and Top 50 technical interview prep'
    ],
    codingGoals: 'Deploy full capstone project, pass technical interview assessment, celebrate Winter Arc!'
  }
];

export default function WeeklySprintsPage() {
  const { days, currentChallengeDay } = usePlanner();
  const navigate = useNavigate();

  const [expandedSprint, setExpandedSprint] = useState(1);
  const [retrospectives, setRetrospectives] = useState(() => {
    try {
      const stored = localStorage.getItem('winter_arc_sprint_retros');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [savedRetroWeek, setSavedRetroWeek] = useState(null);

  const handleSaveRetro = (weekNum) => {
    try {
      localStorage.setItem('winter_arc_sprint_retros', JSON.stringify(retrospectives));
      setSavedRetroWeek(weekNum);
      setTimeout(() => setSavedRetroWeek(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Weekly Sprints & Objectives
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          The 60-day challenge decomposed into 9 high-impact weekly sprints with concrete deliverables and retrospectives.
        </p>
      </div>

      {/* Sprints List */}
      <div className="space-y-4">
        {SPRINTS_METADATA.map((sprint) => {
          const [startDay, endDay] = sprint.daysRange;
          const sprintDays = days.filter((d) => d.day >= startDay && d.day <= endDay);
          const completedDays = sprintDays.filter((d) => d.completed).length;
          const totalDaysInSprint = sprintDays.length;
          const percentDone = Math.round((completedDays / totalDaysInSprint) * 100);

          const isCurrentSprint = currentChallengeDay >= startDay && currentChallengeDay <= endDay;
          const isExpanded = expandedSprint === sprint.week;

          // Video and exercise totals
          const totalVideos = sprintDays.reduce((acc, d) => acc + (d.videos?.length || 0), 0);
          const watchedVideos = sprintDays.reduce((acc, d) => {
            return acc + Object.keys(d.checkedVideos || {}).filter(k => d.checkedVideos[k]).length;
          }, 0);

          return (
            <div
              key={sprint.week}
              className={`arc-card overflow-hidden transition-all ${
                isCurrentSprint ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'border-slate-800'
              }`}
            >
              {/* Sprint Banner Header */}
              <div
                onClick={() => setExpandedSprint(isExpanded ? null : sprint.week)}
                className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-bold flex-shrink-0 ${
                      percentDone === 100
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isCurrentSprint
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                        : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] uppercase text-slate-400 font-normal">Week</span>
                    <span className="text-base -mt-0.5">{sprint.week}</span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold font-mono text-cyan-400">
                        Days {startDay}–{endDay}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400 font-medium">{sprint.phase}</span>
                      {isCurrentSprint && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                          Active Sprint
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-100">
                      {sprint.title}
                    </h3>
                  </div>
                </div>

                {/* Progress Mini Bar & Toggle */}
                <div className="flex items-center gap-4 self-end md:self-center">
                  <div className="w-32 hidden sm:block">
                    <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono mb-1">
                      <span>{completedDays}/{totalDaysInSprint} Days</span>
                      <span className="font-bold text-indigo-400">{percentDone}%</span>
                    </div>
                    <ProgressBar value={percentDone} size="xs" color={percentDone === 100 ? 'emerald' : 'indigo'} />
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                    {/* Objectives */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                        <Target className="w-4 h-4 text-indigo-400" />
                        Weekly Learning Objectives
                      </h4>
                      <ul className="space-y-1.5">
                        {sprint.objectives.map((obj, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                            <span className="text-indigo-400 mt-1">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Coding Goals & Video Metric */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-mono mb-2">
                          <Code2 className="w-4 h-4 text-cyan-400" />
                          Practical Coding Target
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {sprint.codingGoals}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-400">
                          <PlayCircle className="w-4 h-4 text-indigo-400" />
                          <span>Lectures: <strong className="text-slate-200">{watchedVideos} / {totalVideos} completed</strong></span>
                        </div>
                        <span className="font-mono text-cyan-400 font-bold">
                          {totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Day breakdown in this sprint */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2.5">
                      Sprint Daily Schedule
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {sprintDays.map((d) => (
                        <div
                          key={d.day}
                          onClick={() => navigate(`/daily-planner?day=${d.day}`)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            d.completed
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : d.day === currentChallengeDay
                              ? 'bg-cyan-500/10 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400/40'
                              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1 font-mono font-bold">
                            <span>Day {d.day}</span>
                            {d.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <p className="truncate font-medium">{d.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Retrospective Editor */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                        Week {sprint.week} Retrospective & Insights
                      </h4>
                      {savedRetroWeek === sprint.week && (
                        <span className="text-xs text-emerald-400 font-semibold animate-pulse">
                          Saved!
                        </span>
                      )}
                    </div>
                    <textarea
                      value={retrospectives[sprint.week] || ''}
                      onChange={(e) =>
                        setRetrospectives({
                          ...retrospectives,
                          [sprint.week]: e.target.value
                        })
                      }
                      placeholder={`What went well in Sprint ${sprint.week}? What concepts needed extra practice? Key wins & blockers...`}
                      rows={3}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 font-mono resize-none focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleSaveRetro(sprint.week)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Retrospective</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

