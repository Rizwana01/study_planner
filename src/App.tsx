import React, { useState, useEffect } from 'react';
import { BottomNavigation } from './components/BottomNav';
import { PlannerPage } from './pages/PlannerPage';
import { TrackerPage } from './pages/TrackerPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ThemeProvider } from './context/ThemeContext';
import { StorageService } from './services/StorageService';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('planner');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the app and storage
    StorageService.init();
    setIsInitialized(true);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'planner':
        return <PlannerPage />;
      case 'tracker':
        return <TrackerPage />;
      case 'chatbot':
        return <ChatbotPage />;
      case 'analytics':
        return <AnalyticsPage />;
      default:
        return <PlannerPage />;
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Initializing Study Planner...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <main className="pb-16">
          {renderPage()}
        </main>
        <BottomNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </ThemeProvider>
  );
}

export default App;