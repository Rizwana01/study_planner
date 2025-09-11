import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StorageService } from '../services/StorageService';

interface WebcamCaptureProps {
  onCapture?: (imageSrc: string) => void;
  onClose: () => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onClose }) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      StorageService.saveStudySelfie(imageSrc);
      onCapture?.(imageSrc);
    }
  }, [onCapture]);

  const retake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full animate-fadeIn">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Study Session Selfie
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus-ring rounded"
            aria-label="Close webcam"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {!capturedImage ? (
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{
                    width: 400,
                    height: 400,
                    facingMode: "user"
                  }}
                />
              </div>
              <button
                onClick={capture}
                className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors focus-ring"
              >
                <CameraIcon className="w-5 h-5 mr-2" />
                Capture Study Selfie
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                This helps verify your study focus and track your progress
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Study selfie"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={retake}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors focus-ring"
                >
                  Retake
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors focus-ring"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};