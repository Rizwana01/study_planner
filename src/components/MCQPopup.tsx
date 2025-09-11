import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface MCQPopupProps {
  question: MCQQuestion;
  onAnswer: (correct: boolean) => void;
  onClose: () => void;
}

export const MCQPopup: React.FC<MCQPopupProps> = ({ question, onAnswer, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === question.correctAnswer;
    setShowResult(true);
    
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full animate-fadeIn">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Focus Check
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus-ring rounded"
            aria-label="Close focus check"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-800 dark:text-gray-200 mb-6 text-base leading-relaxed">
            {question.question}
          </p>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showResult && setSelectedOption(index)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 focus-ring ${
                  showResult
                    ? index === question.correctAnswer
                      ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200'
                      : index === selectedOption && index !== question.correctAnswer
                      ? 'bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    : selectedOption === index
                    ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-800 dark:text-blue-200'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${
                    selectedOption === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-500'
                  }`}>
                    {selectedOption === index && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {showResult && question.explanation && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Explanation:</strong> {question.explanation}
              </p>
            </div>
          )}

          {!showResult && (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="w-full mt-6 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors focus-ring"
            >
              Submit Answer
            </button>
          )}

          {showResult && (
            <div className="mt-4 text-center">
              <div className={`text-lg font-semibold ${
                selectedOption === question.correctAnswer
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {selectedOption === question.correctAnswer ? '🎉 Correct!' : '❌ Incorrect'}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Returning to your study session...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};