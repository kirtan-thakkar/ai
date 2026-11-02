import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ResultsPage } from './pages/ResultsPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { PlannerPage } from './pages/PlannerPage';
import { AlternativesPage } from './pages/AlternativesPage';
import { WatchPartyPage } from './pages/WatchPartyPage';
import { HistoryPage } from './pages/HistoryPage';
import { AiLabPage } from './pages/AiLabPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-[#050507] text-[#f5f5f7]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/recommendations/:sessionId" element={<ResultsPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/alternatives/:movieId" element={<AlternativesPage />} />
              <Route path="/watch-party" element={<WatchPartyPage />} />
              <Route path="/watch-party/:roomId" element={<WatchPartyPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/ai-lab" element={<AiLabPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};
