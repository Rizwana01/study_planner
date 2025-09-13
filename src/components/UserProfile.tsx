import React, { useState } from 'react';
import { XMarkIcon, BellIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline';
import { AuthService } from '../services/AuthService';
import { NotificationService } from '../services/NotificationService';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserUpdate: (user: any) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose, user, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'study'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    avatar: user?.avatar || '👤'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState(user?.preferences?.notifications || {
    enabled: true,
    studyReminders: true,
    deadlineAlerts: true,
    motivationalTips: true,
    breakReminders: true,
    sound: true,
    vibration: true
  });

  const [studySettings, setStudySettings] = useState(user?.preferences?.studySettings || {
    defaultSessionDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const success = AuthService.updateUserProfile(profileData);
    
    if (success) {
      const updatedUser = AuthService.getCurrentUser();
      onUserUpdate(updatedUser);
      setMessage('Profile updated successfully!');
    } else {
      setMessage('Failed to update profile');
    }
    
    setLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      setLoading(false);
      return;
    }

    const result = AuthService.changePassword(passwordData.currentPassword, passwordData.newPassword);
    setMessage(result.message);
    
    if (result.success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
    
    setLoading(false);
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    setMessage('');

    const success = AuthService.updateUserPreferences({ notifications });
    
    if (success) {
      const updatedUser = AuthService.getCurrentUser();
      onUserUpdate(updatedUser);
      setMessage('Notification preferences updated!');
    } else {
      setMessage('Failed to update preferences');
    }
    
    setLoading(false);
  };

  const handleStudySettingsUpdate = async () => {
    setLoading(true);
    setMessage('');

    const success = AuthService.updateUserPreferences({ studySettings });
    
    if (success) {
      const updatedUser = AuthService.getCurrentUser();
      onUserUpdate(updatedUser);
      setMessage('Study settings updated!');
    } else {
      setMessage('Failed to update settings');
    }
    
    setLoading(false);
  };

  const testNotification = async () => {
    await NotificationService.testNotification();
    setMessage('Test notification sent!');
  };

  const requestNotificationPermission = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      setMessage('Notification permission granted!');
      setNotifications({ ...notifications, enabled: true });
    } else {
      setMessage('Notification permission denied');
      setNotifications({ ...notifications, enabled: false });
    }
  };

  const avatarOptions = ['👤', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍💻', '👩‍💻', '🤓', '😊', '🌟'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            User Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus-ring rounded"
            aria-label="Close profile"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Profile', icon: UserIcon },
              { id: 'notifications', label: 'Notifications', icon: BellIcon },
              { id: 'study', label: 'Study Settings', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.includes('success') || message.includes('granted') || message.includes('sent')
                ? 'bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200'
            }`}>
              {message}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Avatar Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setProfileData({ ...profileData, avatar })}
                      className={`w-12 h-12 text-2xl rounded-full border-2 transition-colors ${
                        profileData.avatar === avatar
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors focus-ring"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>

              {/* Password Change */}
              <div className="border-t dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Change Password
                </h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors focus-ring"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Notification Permissions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {NotificationService.hasPermission() 
                      ? 'Notifications are enabled' 
                      : 'Notifications are disabled'
                    }
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={testNotification}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors focus-ring"
                  >
                    Test
                  </button>
                  {!NotificationService.hasPermission() && (
                    <button
                      onClick={requestNotificationPermission}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors focus-ring"
                    >
                      Enable
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'studyReminders', label: 'Study Session Reminders', desc: 'Get notified when it\'s time to study' },
                  { key: 'deadlineAlerts', label: 'Deadline Alerts', desc: 'Receive alerts 24 hours before deadlines' },
                  { key: 'motivationalTips', label: 'Daily Motivational Tips', desc: 'Get daily inspiration and study tips' },
                  { key: 'breakReminders', label: 'Break Reminders', desc: 'Reminders to take breaks during long sessions' },
                  { key: 'sound', label: 'Sound Notifications', desc: 'Play sound with notifications' },
                  { key: 'vibration', label: 'Vibration', desc: 'Vibrate device for notifications (mobile)' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {setting.label}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {setting.desc}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[setting.key as keyof typeof notifications]}
                        onChange={(e) => setNotifications({
                          ...notifications,
                          [setting.key]: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNotificationUpdate}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors focus-ring"
              >
                {loading ? 'Updating...' : 'Update Notification Preferences'}
              </button>
            </div>
          )}

          {activeTab === 'study' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Session Duration (minutes)
                  </label>
                  <select
                    value={studySettings.defaultSessionDuration}
                    onChange={(e) => setStudySettings({
                      ...studySettings,
                      defaultSessionDuration: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={25}>25 minutes (Pomodoro)</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Short Break Duration (minutes)
                  </label>
                  <select
                    value={studySettings.breakDuration}
                    onChange={(e) => setStudySettings({
                      ...studySettings,
                      breakDuration: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Long Break Duration (minutes)
                  </label>
                  <select
                    value={studySettings.longBreakDuration}
                    onChange={(e) => setStudySettings({
                      ...studySettings,
                      longBreakDuration: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sessions Before Long Break
                  </label>
                  <select
                    value={studySettings.sessionsBeforeLongBreak}
                    onChange={(e) => setStudySettings({
                      ...studySettings,
                      sessionsBeforeLongBreak: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-ring"
                  >
                    <option value={3}>3 sessions</option>
                    <option value={4}>4 sessions</option>
                    <option value={5}>5 sessions</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleStudySettingsUpdate}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors focus-ring"
              >
                {loading ? 'Updating...' : 'Update Study Settings'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};