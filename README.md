# Winter Arc – 60 Days of Backend Engineering (Java & Spring Boot)

A production-quality learning management and roadmap tracking web application inspired by the **TakeUForward Planly Winter Arc**, built for developers conquering backend engineering through structured daily discipline.

---

## ⚡ Core Features & Recent Extensions

### 1. 🎯 Daily Topic-Based Question Bank (1,500 Questions)
- **25 questions for EVERY DAY of the 60 days**:
  - **10 Basic Questions**: Syntax, definitions, JVM/Spring fundamentals, purpose of keywords, output prediction.
  - **10 Medium Questions**: Practical code analysis, debugging, edge cases, output predictions, concept comparisons, coding challenges.
  - **5 Hard Questions**: Senior interview deep dives, JVM memory internals, tricky concurrency traps, Spring AOP/JPA/Security traps, scalability.
- **Total: 1,500 authentic technical questions** pre-generated and mapped directly to Coder Army's 57 Java and 45 Spring Boot lectures with zero runtime external API dependency.
- **Interactive Quiz Interface**:
  - Filterable by difficulty tabs (`Basic (10)`, `Medium (10)`, `Hard (5)`).
  - Single-question display with instant answer validation, comprehensive technical explanations, core concept tags, and authentic reference links (`dev.java`, `baeldung`, `spring.io`, `geeksforgeeks`).
  - Bookmark questions and mark questions for review.
  - Filter by `All`, `Incorrect (mistakes)`, or `Bookmarked`.
  - Daily performance breakdown and **Weak-Topic Diagnostic Engine** identifying concepts with < 70% accuracy and pointing to corresponding videos and notes.

### 2. ⏸️ Global Pause and Resume Challenge System
- Total control over your learning journey: pause anytime for work, health, college exams, or travel.
- **Freezes current challenge day** so calendar progression does not penalize you.
- **Preserves streaks, completed tasks, quiz scores, notes, and study logs** without penalties or missed-day marks.
- **Paused Dashboard Banner**: Shows pause start date, active break duration, cumulative paused days, and a one-click **Resume Journey** button.
- **Smart Date Recalculation**: When resumed, remaining challenge days are automatically shifted forward.
- Maintains full **Pause History** tracking duration and reasons across multiple pause/resume cycles.

### 3. 📺 Authentic Coder Army Curriculum Integration
- **Core Java (57 Lectures)**: Complete playlist (`PLQEaRBV9gAFsR15tNo2QLF9d2qc-c018p`) with exact video titles, IDs, durations, and original order.
- **Spring Framework & Spring Boot (45 Lectures)**: Complete playlist (`PLEYgx5hMdopw`) including IoC, JPA, Spring Security, and the 5-part **GateKeeper API Gateway** production project.
- In-app YouTube video player modal as well as direct YouTube links.

### 4. 🗺️ Interactive 60-Day Roadmap & Grid
- Large visual 60-Day Grid with color-coded status (Completed, Active Today, Missed, Upcoming).
- Filterable by Phase (Phase 1: Core Java, Phase 2: Spring Boot, Phase 3: Revision & Capstone) and Week.

### 5. 📅 Daily Planner (Planly-Style Experience)
- Tabbed interface between **Learning Tasks & Exercises** and the **25-Question Daily Quiz**.
- Markdown study notes editor with persistence.
- Intelligent Missed-Day Recovery System.

### 6. ⏱️ Pomodoro & Focus Study Timer
- 25-minute Pomodoro, 50-minute deep work, and 5/15-minute breaks with audio chime and session logging.

### 7. 📊 Updated Analytics (Recharts)
- Question accuracy breakdown (Basic, Medium, Hard).
- Weekly quiz performance trends.
- Most frequently incorrect topics.
- Journey timeline: active learning days, calendar days elapsed, paused days, and pause/resume cycles.

---

## 🛠️ Technology Stack

- **Frontend:** React.js (JavaScript, JSX)
- **Bundler:** Vite
- **Styling:** Tailwind CSS (Custom dark theme palette & animations)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Router:** React Router v6
- **Effects:** Canvas Confetti

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

3. **Build for production:**
   ```bash
   npm run build
   ```
