import React from 'react';
import {
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  CalendarIcon as CalendarSolidIcon,
  ClockIcon as ClockSolidIcon,
  ChatBubbleLeftIcon as ChatBubbleSolidIcon,
  ChartBarIcon as ChartBarSolidIcon
} from '@heroicons/react/24/solid';

interface BottomNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  {
    id: 'planner',
    label: 'Planner',
    icon: CalendarIcon,
    activeIcon: CalendarSolidIcon,
  },
  {
    id: 'tracker',
    label: 'Timer',
    icon: ClockIcon,
    activeIcon: ClockSolidIcon,
  },
  {
    id: 'chatbot',
    label: 'Coach',
    icon: ChatBubbleLeftIcon,
    activeIcon: ChatBubbleSolidIcon,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: ChartBarIcon,
    activeIcon: ChartBarSolidIcon,
  },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentPage,
  onPageChange,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-pb">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const IconComponent = isActive ? item.activeIcon : item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 focus-ring ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              aria-label={`Navigate to ${item.label}`}
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};