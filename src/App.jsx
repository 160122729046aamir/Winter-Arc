import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PlannerProvider } from './context/PlannerContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import RoadmapPage from './pages/RoadmapPage';
import DailyPlannerPage from './pages/DailyPlannerPage';
import WeeklySprintsPage from './pages/WeeklySprintsPage';
import ProjectsPage from './pages/ProjectsPage';
import PlaylistsPage from './pages/PlaylistsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StudyTimerPage from './pages/StudyTimerPage';
import NotesRevisionPage from './pages/NotesRevisionPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';

function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans transition-colors duration-300 relative">
      {/* Ambient Apple Liquid Glass Multi-Glow Background */}
      <div className="apple-liquid-bg" />

      {/* Floating Vision-style Top Navigation */}
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex flex-1">
        {/* Floating Apple Liquid Glass Sidebar */}
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-72 min-w-0 flex flex-col justify-between transition-all duration-300">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/plan" element={<RoadmapPage />} />
              <Route path="/daily-planner" element={<DailyPlannerPage />} />
              <Route path="/sprints" element={<WeeklySprintsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/timer" element={<StudyTimerPage />} />
              <Route path="/notes" element={<NotesRevisionPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Liquid Glass Footer */}
          <footer className="border-t border-white/[0.06] glass-ultra py-4 px-6 text-center text-xs text-slate-500 font-mono mt-auto">
            <p>
              Winter Arc – 60 Days of Backend Engineering • Apple Liquid Glass Edition
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PlannerProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </PlannerProvider>
    </ThemeProvider>
  );
}
