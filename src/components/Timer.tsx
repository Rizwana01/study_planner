import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/solid';
import { TimerService } from '../services/TimerService';

interface TimerProps {
  duration: number; // in minutes
  onComplete: () => void;
  onTick?: (remainingSeconds: number) => void;
  subjectId?: string;
}

export const Timer: React.FC<TimerProps> = ({
  duration,
  onComplete,
  onTick,
  subjectId
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration * 60);
  const [totalTime] = useState(duration * 60);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setRemainingTime(duration * 60);
  }, [duration]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = prev - 1;
          onTick?.(newTime);
          
          if (newTime <= 0) {
            setIsRunning(false);
            onComplete();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onComplete, onTick]);

  const handleStart = () => {
    setIsRunning(true);
    TimerService.startSession(subjectId || 'general');
  };

  const handlePause = () => {
    setIsRunning(false);
    TimerService.pauseSession();
  };

  const handleStop = () => {
    setIsRunning(false);
    setRemainingTime(totalTime);
    TimerService.endSession();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const progress = ((totalTime - remainingTime) / totalTime) * 100;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Circular Progress */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className={`text-blue-500 transition-all duration-1000 ${
              isRunning ? 'timer-glow' : ''
            }`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatTime(remainingTime)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isRunning ? 'Focus Time' : remainingTime === totalTime ? 'Ready' : 'Paused'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center justify-center w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 focus-ring"
            aria-label="Start timer"
          >
            <PlayIcon className="w-8 h-8 ml-1" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center justify-center w-16 h-16 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg transition-all duration-200 focus-ring"
            aria-label="Pause timer"
          >
            <PauseIcon className="w-8 h-8" />
          </button>
        )}
        
        <button
          onClick={handleStop}
          className="flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 focus-ring"
          aria-label="Stop timer"
        >
          <StopIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};