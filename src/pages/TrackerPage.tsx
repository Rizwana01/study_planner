import React, { useState, useEffect } from 'react';
import { Timer } from '../components/Timer';
import { MCQPopup } from '../components/MCQPopup';
import { WebcamCapture } from '../components/WebcamCapture';
import { StorageService } from '../services/StorageService';
import mcqQuestions from '../utils/mcqQuestionSet.json';

export const TrackerPage: React.FC = () => {
  const [duration, setDuration] = useState(25); // Default Pomodoro
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects] = useState(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science']);
  const [showMCQ, setShowMCQ] = useState(false);
  const [currentMCQ, setCurrentMCQ] = useState<any>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [mcqInterval, setMCQInterval] = useState<NodeJS.Timeout | null>(null);

  // Visibility change detection for focus tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && sessionStarted) {
        StorageService.logFocusLoss(new Date().toISOString());
      } else if (!document.hidden && sessionStarted) {
        StorageService.logFocusReturn(new Date().toISOString());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionStarted]);

  const startSession = () => {
    setSessionStarted(true);
    setShowWebcam(true);
    
    // Schedule random MCQ popups
    const scheduleNextMCQ = () => {
      const randomDelay = Math.random() * 600000 + 300000; // 5-15 minutes
      const timeout = setTimeout(() => {
        if (sessionStarted) {
          showRandomMCQ();
          scheduleNextMCQ();
        }
      }, randomDelay);
      setMCQInterval(timeout);
    };
    
    scheduleNextMCQ();
  };

  const showRandomMCQ = () => {
    const randomQuestion = mcqQuestions[Math.floor(Math.random() * mcqQuestions.length)];
    setCurrentMCQ(randomQuestion);
    setShowMCQ(true);
  };

  const handleMCQAnswer = (correct: boolean) => {
    StorageService.logMCQResult({
      questionId: currentMCQ.id,
      correct,
      timestamp: new Date().toISOString()
    });
    setShowMCQ(false);
    setCurrentMCQ(null);
  };

  const handleTimerComplete = () => {
    setSessionStarted(false);
    if (mcqInterval) {
      clearTimeout(mcqInterval);
      setMCQInterval(null);
    }
    
    // Show completion webcam
    setShowWebcam(true);
    
    // Log session completion
    StorageService.completeStudySession({
      subject: selectedSubject || 'General',
      duration,
      completedAt: new Date().toISOString()
    });
  };

  const durations = [
    { label: '15 min - Quick Review', value: 15 },
    { label: '25 min - Pomodoro', value: 25 },
    { label: '45 min - Deep Study', value: 45 },
    { label: '60 min - Extended Focus', value: 60 },
    { label: '90 min - Marathon Session', value: 90 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Study Timer
          </h1>
          
          {!sessionStarted && (
            <div className="space-y-4">
              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Study Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Duration
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {durations.map((dur) => (
                    <button
                      key={dur.value}
                      onClick={() => setDuration(dur.value)}
                      className={`text-left px-4 py-3 rounded-lg border transition-all duration-200 focus-ring ${
                        duration === dur.value
                          ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-800 dark:text-blue-200'
                          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-medium">{dur.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timer Section */}
      <div className="p-6 flex flex-col items-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md">
          <Timer
            duration={duration}
            onComplete={handleTimerComplete}
            subjectId={selectedSubject}
          />

          {!sessionStarted && (
            <div className="mt-6 text-center">
              <button
                onClick={startSession}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 focus-ring"
              >
                🚀 Start Study Session
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Focus verification and progress tracking included
              </p>
            </div>
          )}
        </div>

        {/* Session Info */}
        {sessionStarted && selectedSubject && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center">
            <h3 className="font-medium text-blue-900 dark:text-blue-100">
              Currently studying: <span className="font-bold">{selectedSubject}</span>
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Stay focused! You'll get random check-ins to verify your attention.
            </p>
          </div>
        )}
      </div>

      {/* MCQ Popup */}
      {showMCQ && currentMCQ && (
        <MCQPopup
          question={currentMCQ}
          onAnswer={handleMCQAnswer}
          onClose={() => setShowMCQ(false)}
        />
      )}

      {/* Webcam Capture */}
      {showWebcam && (
        <WebcamCapture
          onClose={() => setShowWebcam(false)}
        />
      )}
    </div>
  );
};