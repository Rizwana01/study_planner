interface NotificationPreferences {
  enabled: boolean;
  studyReminders: boolean;
  deadlineAlerts: boolean;
  motivationalTips: boolean;
  breakReminders: boolean;
  sound: boolean;
  vibration: boolean;
}

interface ScheduledNotification {
  id: string;
  type: 'study_reminder' | 'deadline_alert' | 'motivational_tip' | 'break_reminder';
  title: string;
  body: string;
  scheduledFor: string;
  userId: string;
  data?: any;
}

export class NotificationService {
  private static readonly NOTIFICATIONS_KEY = 'study-planner-notifications';
  private static readonly PERMISSION_REQUESTED_KEY = 'notification-permission-requested';
  
  private static scheduledNotifications: ScheduledNotification[] = [];
  private static notificationTimeouts: Map<string, NodeJS.Timeout> = new Map();

  static async init(): Promise<void> {
    // Load scheduled notifications
    this.loadScheduledNotifications();
    
    // Request permission if not already requested
    if (!localStorage.getItem(this.PERMISSION_REQUESTED_KEY)) {
      await this.requestPermission();
    }

    // Schedule daily motivational tips
    this.scheduleDailyMotivationalTips();
    
    // Check for overdue notifications
    this.processOverdueNotifications();
  }

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem(this.PERMISSION_REQUESTED_KEY, 'true');
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  static hasPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  static scheduleStudyReminder(sessionData: { subject: string; duration: number; scheduledFor: string }, userId: string): string {
    const notification: ScheduledNotification = {
      id: `study_${Date.now()}`,
      type: 'study_reminder',
      title: '📚 Study Time!',
      body: `Time to study ${sessionData.subject} for ${sessionData.duration} minutes`,
      scheduledFor: sessionData.scheduledFor,
      userId,
      data: sessionData
    };

    return this.scheduleNotification(notification);
  }

  static scheduleDeadlineAlert(task: { title: string; subject: string; deadline: string }, userId: string): string {
    const deadlineDate = new Date(task.deadline);
    const alertTime = new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before

    if (alertTime <= new Date()) {
      return ''; // Don't schedule past alerts
    }

    const notification: ScheduledNotification = {
      id: `deadline_${Date.now()}`,
      type: 'deadline_alert',
      title: '⏰ Deadline Approaching!',
      body: `"${task.title}" is due tomorrow in ${task.subject}`,
      scheduledFor: alertTime.toISOString(),
      userId,
      data: task
    };

    return this.scheduleNotification(notification);
  }

  static scheduleBreakReminder(duration: number, userId: string): string {
    const breakTime = new Date(Date.now() + duration * 60 * 1000);
    
    const notification: ScheduledNotification = {
      id: `break_${Date.now()}`,
      type: 'break_reminder',
      title: '☕ Break Time!',
      body: `You've been studying for ${duration} minutes. Time for a well-deserved break!`,
      scheduledFor: breakTime.toISOString(),
      userId,
      data: { duration }
    };

    return this.scheduleNotification(notification);
  }

  private static scheduleNotification(notification: ScheduledNotification): string {
    this.scheduledNotifications.push(notification);
    this.saveScheduledNotifications();

    const delay = new Date(notification.scheduledFor).getTime() - Date.now();
    
    if (delay > 0) {
      const timeout = setTimeout(() => {
        this.showNotification(notification);
        this.removeScheduledNotification(notification.id);
      }, delay);

      this.notificationTimeouts.set(notification.id, timeout);
    }

    return notification.id;
  }

  private static showNotification(notification: ScheduledNotification): void {
    if (!this.hasPermission()) return;

    const options: NotificationOptions = {
      body: notification.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: notification.type,
      requireInteraction: notification.type === 'deadline_alert',
      data: notification.data
    };

    // Add action buttons for study reminders
    if (notification.type === 'study_reminder') {
      options.actions = [
        { action: 'start', title: 'Start Now' },
        { action: 'snooze', title: 'Snooze 10min' }
      ];
    }

    const notif = new Notification(notification.title, options);

    // Handle notification clicks
    notif.onclick = () => {
      window.focus();
      if (notification.type === 'study_reminder') {
        // Navigate to tracker page
        window.location.hash = '#tracker';
      } else if (notification.type === 'deadline_alert') {
        // Navigate to planner page
        window.location.hash = '#planner';
      }
      notif.close();
    };

    // Auto-close after 10 seconds (except deadline alerts)
    if (notification.type !== 'deadline_alert') {
      setTimeout(() => notif.close(), 10000);
    }
  }

  private static scheduleDailyMotivationalTips(): void {
    const tips = [
      "🌟 Every expert was once a beginner. Keep going!",
      "💪 Small progress is still progress. You've got this!",
      "🎯 Focus on progress, not perfection.",
      "🚀 Your future self will thank you for studying today!",
      "📚 Knowledge is power. Keep building yours!",
      "⭐ Believe in yourself and your ability to learn.",
      "🔥 Consistency beats perfection every time.",
      "🌱 Growth happens outside your comfort zone."
    ];

    // Schedule tip for tomorrow at 9 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    const notification: ScheduledNotification = {
      id: `tip_${Date.now()}`,
      type: 'motivational_tip',
      title: '💡 Daily Study Tip',
      body: randomTip,
      scheduledFor: tomorrow.toISOString(),
      userId: 'all', // Send to all users
    };

    this.scheduleNotification(notification);
  }

  static cancelNotification(notificationId: string): void {
    const timeout = this.notificationTimeouts.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      this.notificationTimeouts.delete(notificationId);
    }
    this.removeScheduledNotification(notificationId);
  }

  static cancelAllNotifications(userId: string): void {
    const userNotifications = this.scheduledNotifications.filter(n => n.userId === userId);
    userNotifications.forEach(notification => {
      this.cancelNotification(notification.id);
    });
  }

  private static removeScheduledNotification(notificationId: string): void {
    this.scheduledNotifications = this.scheduledNotifications.filter(n => n.id !== notificationId);
    this.saveScheduledNotifications();
  }

  private static loadScheduledNotifications(): void {
    const saved = localStorage.getItem(this.NOTIFICATIONS_KEY);
    if (saved) {
      this.scheduledNotifications = JSON.parse(saved);
    }
  }

  private static saveScheduledNotifications(): void {
    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(this.scheduledNotifications));
  }

  private static processOverdueNotifications(): void {
    const now = new Date();
    const overdueNotifications = this.scheduledNotifications.filter(
      n => new Date(n.scheduledFor) <= now
    );

    overdueNotifications.forEach(notification => {
      this.showNotification(notification);
      this.removeScheduledNotification(notification.id);
    });
  }

  // Test notification
  static async testNotification(): Promise<void> {
    if (!this.hasPermission()) {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    const notification = new Notification('🧪 Test Notification', {
      body: 'Notifications are working correctly!',
      icon: '/icon-192x192.png'
    });

    setTimeout(() => notification.close(), 5000);
  }

  // Get notification statistics
  static getNotificationStats(userId: string): { scheduled: number; types: Record<string, number> } {
    const userNotifications = this.scheduledNotifications.filter(n => n.userId === userId || n.userId === 'all');
    const types: Record<string, number> = {};
    
    userNotifications.forEach(n => {
      types[n.type] = (types[n.type] || 0) + 1;
    });

    return {
      scheduled: userNotifications.length,
      types
    };
  }
}