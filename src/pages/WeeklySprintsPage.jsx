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
import { formatShortDate, formatDate } from '../utils/dateUtils';
import ProgressBar from '../components/common/ProgressBar';

const SPRINTS_METADATA = [
  {
    week: 1,
    title: 'Sprint 1: Java Foundations & Language Syntax',
    daysRange: [1, 7],
    phase: 'Phase 1: Core Java',
    objectives: [
      'Master JVM internal architecture, JDK vs JRE, and bytecode execution flow',
      'Understand 2s complement, memory representations, and data type casting rules',
      'Build solid foundation in operators, conditional statements, and loops',
      'Complete 1 single video and 25 questions each day'
    ],
    codingGoals: 'Write 10+ algorithms manipulating types, bits, conditionals, and loops'
  },
  {
    week: 2,
    title: 'Sprint 2: Array Structures & OOP Genesis',
    daysRange: [8, 14],
    phase: 'Phase 1: Core Java',
    objectives: [
      'Arrays in memory (contiguous allocation, heap, bounds checking)',
      'Functions, recursion, and stack frame execution',
      'Object Oriented Programming: Classes, Objects, heap references',
      'Constructors, this keyword, and shallow vs deep object cloning'
    ],
    codingGoals: 'Build custom immutable classes, matrix traversals, and recursive algorithms'
  },
  {
    week: 3,
    title: 'Sprint 3: Advanced OOP, Polymorphism & Abstraction',
    daysRange: [15, 21],
    phase: 'Phase 1: Core Java',
    objectives: [
      'static & final keywords, ClassLoader loading sequences',
      'Strict encapsulation, package structure, and inheritance hierarchy',
      'Abstract classes vs Interfaces, dynamic method dispatch',
      'AutoBoxing, POJOs, and nested/anonymous inner classes'
    ],
    codingGoals: 'Model real-world enterprise domain hierarchies with interfaces and abstractions'
  },
  {
    week: 4,
    title: 'Sprint 4: Java I/O, Strings & Generics Mastery',
    daysRange: [22, 28],
    phase: 'Phase 1: Core Java',
    objectives: [
      'Java I/O: Scanner, BufferedReader, and System streams',
      'Object class contract: equals() & hashCode() consistency and Enums',
      'String Constant Pool, Immutability, StringBuilder vs StringBuffer',
      'Generics: Type Erasure, Bounded Types, and PECS wildcard principle'
    ],
    codingGoals: 'Implement custom generic data structures and high-performance string processors'
  },
  {
    week: 5,
    title: 'Sprint 5: Collections Framework & Data Structures',
    daysRange: [29, 35],
    phase: 'Phase 1: Core Java',
    objectives: [
      'Collection Framework hierarchy, Iterable, and Iterator contracts',
      'List implementations: ArrayList vs LinkedList, internal resizing',
      'HashMap internals: hash collisions, buckets, and Red-Black treeification',
      'Set implementations (HashSet, TreeSet) and PriorityQueue heaps'
    ],
    codingGoals: 'Benchmark collection lookups and implement custom object sorting algorithms'
  },
  {
    week: 6,
    title: 'Sprint 6: Functional Java & Stream API',
    daysRange: [36, 42],
    phase: 'Phase 1: Core Java',
    objectives: [
      'Comparable vs Comparator chaining and lambda expressions',
      'Functional Interfaces, Method References, and composition',
      'Java Stream API: lazy evaluation, intermediate vs terminal operations',
      'Java Optional handling and Parallel Streams concurrency considerations'
    ],
    codingGoals: 'Construct complex multi-stage stream pipelines, collectors, and grouping operations'
  },
  {
    week: 7,
    title: 'Sprint 7: Memory Management, GC & Multithreading',
    daysRange: [43, 50],
    phase: 'Phase 1: Core Java',
    objectives: [
      'Exception hierarchy: checked vs unchecked and custom domain exceptions',
      'JVM Memory model: Stack, Heap, Metaspace, and Garbage Collection algorithms',
      'Multithreading fundamentals: Process vs Thread, Thread lifecycle',
      'Monitor locks, synchronized keyword, wait()/notify(), and atomic CAS variables'
    ],
    codingGoals: 'Simulate Producer-Consumer threads and analyze thread dumps for race conditions'
  },
  {
    week: 8,
    title: 'Sprint 8: Spring Ecosystem, Maven & IoC Container',
    daysRange: [51, 57],
    phase: 'Phase 2: Spring Boot',
    objectives: [
      'Spring Framework architecture, Inversion of Control, and loose coupling',
      'Build first Spring Boot application and master Apache Maven lifecycle',
      'Spring IoC container: @Component, @Service, @Autowired, and explicit @Bean methods',
      'Bean scopes (Singleton vs Prototype) and resolving circular dependencies'
    ],
    codingGoals: 'Bootstrap production Spring Boot services and test IoC dependency injection'
  },
  {
    week: 9,
    title: 'Sprint 9: Core Boot, Configuration & Layered CRUD',
    daysRange: [58, 64],
    phase: 'Phase 2: Spring Boot',
    objectives: [
      'Spring Boot Auto-configuration internals and @SpringBootApplication',
      'Externalized configuration: application.properties, @Value, and profiles',
      'Layered REST architecture (Controller -> Service -> Repository)',
      'MySQL database integration and soft-delete entity management'
    ],
    codingGoals: 'Build full enterprise CRUD REST service with MySQL and soft-delete mechanics'
  },
  {
    week: 10,
    title: 'Sprint 10: Spring MVC, DTOs & Aspect-Oriented Programming',
    daysRange: [65, 71],
    phase: 'Phase 2: Spring Boot',
    objectives: [
      'Servlets, Embedded Tomcat, and DispatcherServlet request flow',
      'DTO Pattern and Jakarta Bean Validation guards',
      'Global exception handling via @RestControllerAdvice and RFC 7807',
      'Filters vs Interceptors and Spring AOP cross-cutting proxies'
    ],
    codingGoals: 'Implement custom AOP execution logging annotations and validated DTO payloads'
  },
  {
    week: 11,
    title: 'Sprint 11: Spring MVC, DTOs & Aspect-Oriented Programming',
    daysRange: [72, 78],
    phase: 'Phase 2: Spring Boot',
    objectives: [
      'Servlets, Embedded Tomcat, and DispatcherServlet request flow',
      'DTO Pattern and Jakarta Bean Validation guards',
      'Global exception handling via @RestControllerAdvice and RFC 7807',
      'Filters vs Interceptors and Spring AOP cross-cutting proxies'
    ],
    codingGoals: 'Implement custom AOP execution logging annotations and validated DTO payloads'
  },
  {
    week: 12,
    title: 'Sprint 12: Database Persistence, JDBC, Hibernate & JPA',
    daysRange: [79, 85],
    phase: 'Phase 2: Spring Boot',
    objectives: [
      'Spring AOP Pointcuts and Proxy types in production',
      'Core JDBC vs Spring JdbcTemplate implementation',
      'Hibernate ORM first-level cache and dirty checking',
      'JPA entity relationships (@OneToMany, @ManyToMany), cascading, and N+1 prevention'
    ],
    codingGoals: 'Design normalized database schemas and implement transactional persistence'
  },
  {
    week: 13,
    title: 'Sprint 13: Spring Data JPA, Transactions & Isolation Levels',
    daysRange: [86, 91],
    phase: 'Phase 2: Spring Boot',
    objectives: [
      'Master Spring Data JPA: custom JPQL queries, pagination, and sorting',
      'Spring Transactions: ACID compliance, @Transactional commit & rollback',
      '@Transactional Propagation: REQUIRED vs REQUIRES_NEW in nested service calls',
      'Isolation Levels: READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE and dirty read prevention'
    ],
    codingGoals: 'Implement robust transaction boundaries and evaluate propagation failure recovery'
  },
  {
    week: 14,
    title: 'Sprint 14: Production Security, JWT, OAuth2 & Testing Graduation',
    daysRange: [92, 97],
    phase: 'Phase 3: Security & Testing',
    objectives: [
      'Spring Security architecture, SecurityFilterChain, and UserDetailsService',
      'Database authentication with BCrypt password hashing',
      'Stateless JWT authentication filters and Refresh Token rotation',
      'OAuth 2.0 / Google Social Login with PKCE',
      'Spring Boot #40 Capstone: Testing Spring Boot Applications with JUnit 5, Mockito & MockMvc'
    ],
    codingGoals: 'Write comprehensive unit and integration tests with Mockito and MockMvc, passing all assertions to graduate!'
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
          The challenge decomposed into weekly sprints with 1 YouTube video per day and weekly retrospectives.
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
            return acc + (d.videos || []).filter((v) => d.checkedVideos?.[v.id]).length;
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
                      {sprintDays.length > 0 && sprintDays[0]?.date && (
                        <>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-400 font-mono">
                            {formatShortDate(sprintDays[0].date)} – {formatDate(sprintDays[sprintDays.length - 1].date)}
                          </span>
                        </>
                      )}
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

