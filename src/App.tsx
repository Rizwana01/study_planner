import React, { useState, useEffect } from 'react';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { BottomNavigation } from './components/BottomNav';
import { PlannerPage } from './pages/PlannerPage';
import { TrackerPage } from './pages/TrackerPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ThemeProvider } from './context/ThemeContext';
import { StorageService } from './services/StorageService';
import { AuthService } from './services/AuthService';
import { NotificationService } from './services/NotificationService';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('planner');
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  useEffect(() => {
    // Initialize the app and storage
    AuthService.init();
    StorageService.init();
    NotificationService.init();
    
    // Check if user is already authenticated
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      setShowAuthModal(true);
    }
    
    setIsInitialized(true);
  }, []);

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    AuthService.logout();
    NotificationService.cancelAllNotifications(currentUser?.id);
    setCurrentUser(null);
    setShowAuthModal(true);
  };

  const handleUserUpdate = (updatedUser: any) => {
    setCurrentUser(updatedUser);
  };

  const renderPage = () => {
    if (!currentUser) {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📚</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Study Planner
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Please sign in to continue
            </p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'planner':
        return <PlannerPage user={currentUser} />;
      case 'tracker':
        return <TrackerPage user={currentUser} />;
      case 'chatbot':
        return <ChatbotPage user={currentUser} />;
      case 'analytics':
        return <AnalyticsPage user={currentUser} />;
      default:
        return <PlannerPage user={currentUser} />;
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
        {/* User Header */}
        {currentUser && (
          <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{currentUser.avatar}</div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {currentUser.fullName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{currentUser.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowUserProfile(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors focus-ring"
                  aria-label="User profile"
                >
                  ⚙️
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors focus-ring"
                  aria-label="Logout"
                >
                  🚪
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="pb-16">
          {renderPage()}
        </main>
        
        {currentUser && (
          <BottomNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* User Profile Modal */}
        {currentUser && (
          <UserProfile
            isOpen={showUserProfile}
            onClose={() => setShowUserProfile(false)}
            user={currentUser}
            onUserUpdate={handleUserUpdate}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;