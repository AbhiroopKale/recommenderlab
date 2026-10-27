import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OverviewPage from './pages/OverviewPage';
import CollaborativePage from './pages/CollaborativePage';
import ContentBasedPage from './pages/ContentBasedPage';
import ComparisonPage from './pages/ComparisonPage';
import { fetchHealth } from './services/api';
import { Heart, Sparkles, BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [backendHealth, setBackendHealth] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);

  // Check health on load and periodically
  useEffect(() => {
    async function checkStatus() {
      try {
        setIsCheckingHealth(true);
        const health = await fetchHealth();
        setBackendHealth(health);
      } catch (err) {
        setBackendHealth(null);
      } finally {
        setIsCheckingHealth(false);
      }
    }
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        backendHealth={backendHealth}
        isCheckingHealth={isCheckingHealth}
      />

      {/* Main Lab Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'overview' && <OverviewPage onNavigate={setActiveTab} />}
        {activeTab === 'collaborative' && <CollaborativePage />}
        {activeTab === 'content' && <ContentBasedPage />}
        {activeTab === 'comparison' && <ComparisonPage />}
      </main>

      {/* Educational Lab Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">RecommenderLab</span>
            <span>—</span>
            <span>Educational Recommendation System Simulation Workbench</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline mx-0.5" /> for Machine Learning Education
            </span>
            <span>•</span>
            <span className="font-mono text-slate-400">React + Vite + Flask</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
