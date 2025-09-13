interface Task {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

interface StudySession {
  id: string;
  subject: string;
  duration: number;
  startTime: string;
  endTime: string;
  focusLosses: string[];
  focusReturns: string[];
  mcqResults: MCQResult[];
  selfieUrls: string[];
}

interface MCQResult {
  questionId: string;
  correct: boolean;
  timestamp: string;
}

export class StorageService {
  private static readonly TASKS_KEY = 'study-planner-tasks';
  private static readonly SESSIONS_KEY = 'study-planner-sessions';
  private static readonly SETTINGS_KEY = 'study-planner-settings';
  private static readonly SELFIES_KEY = 'study-planner-selfies';
  private static currentUserId: string | null = null;

  static setCurrentUser(userId: string): void {
    this.currentUserId = userId;
  }

  private static getUserKey(baseKey: string): string {
    return this.currentUserId ? `${baseKey}-${this.currentUserId}` : baseKey;
  }

  static init(): void {
    // Initialize storage if not exists
    if (!localStorage.getItem(this.getUserKey(this.TASKS_KEY))) {
      localStorage.setItem(this.getUserKey(this.TASKS_KEY), JSON.stringify([]));
    }
    if (!localStorage.getItem(this.getUserKey(this.SESSIONS_KEY))) {
      localStorage.setItem(this.getUserKey(this.SESSIONS_KEY), JSON.stringify([]));
    }
    if (!localStorage.getItem(this.getUserKey(this.SETTINGS_KEY))) {
      localStorage.setItem(this.getUserKey(this.SETTINGS_KEY), JSON.stringify({
        darkMode: false,
        notificationsEnabled: true,
      }));
    }
    if (!localStorage.getItem(this.getUserKey(this.SELFIES_KEY))) {
      localStorage.setItem(this.getUserKey(this.SELFIES_KEY), JSON.stringify([]));
    }
  }

  // Task Management
  static getTasks(): Task[] {
    const tasks = localStorage.getItem(this.getUserKey(this.TASKS_KEY));
    return tasks ? JSON.parse(tasks) : [];
  }

  static addTask(task: Task): void {
    const tasks = this.getTasks();
    tasks.push(task);
    localStorage.setItem(this.getUserKey(this.TASKS_KEY), JSON.stringify(tasks));
  }

  static updateTask(updatedTask: Task): void {
    const tasks = this.getTasks();
    const index = tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      localStorage.setItem(this.getUserKey(this.TASKS_KEY), JSON.stringify(tasks));
    }
  }

  static deleteTask(taskId: string): void {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem(this.getUserKey(this.TASKS_KEY), JSON.stringify(filteredTasks));
  }

  // Study Session Management
  private static currentSession: Partial<StudySession> | null = null;

  static startSession(subject: string): void {
    this.currentSession = {
      id: Date.now().toString(),
      subject,
      startTime: new Date().toISOString(),
      focusLosses: [],
      focusReturns: [],
      mcqResults: [],
      selfieUrls: []
    };
  }

  static pauseSession(): void {
    // Session paused - could implement pause tracking here
  }

  static endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date().toISOString();
      this.currentSession.duration = Math.round(
        (new Date(this.currentSession.endTime!).getTime() - 
         new Date(this.currentSession.startTime!).getTime()) / (1000 * 60)
      );
      
      const sessions = this.getSessions();
      sessions.push(this.currentSession as StudySession);
      localStorage.setItem(this.getUserKey(this.SESSIONS_KEY), JSON.stringify(sessions));
      this.currentSession = null;
    }
  }

  static completeStudySession(sessionData: { subject: string; duration: number; completedAt: string }): void {
    const session: StudySession = {
      id: Date.now().toString(),
      subject: sessionData.subject,
      duration: sessionData.duration,
      startTime: new Date(Date.now() - sessionData.duration * 60000).toISOString(),
      endTime: sessionData.completedAt,
      focusLosses: this.currentSession?.focusLosses || [],
      focusReturns: this.currentSession?.focusReturns || [],
      mcqResults: this.currentSession?.mcqResults || [],
      selfieUrls: this.currentSession?.selfieUrls || []
    };

    const sessions = this.getSessions();
    sessions.push(session);
    localStorage.setItem(this.getUserKey(this.SESSIONS_KEY), JSON.stringify(sessions));
    this.currentSession = null;
  }

  static getSessions(): StudySession[] {
    const sessions = localStorage.getItem(this.getUserKey(this.SESSIONS_KEY));
    return sessions ? JSON.parse(sessions) : [];
  }

  static logFocusLoss(timestamp: string): void {
    if (this.currentSession) {
      this.currentSession.focusLosses!.push(timestamp);
    }
  }

  static logFocusReturn(timestamp: string): void {
    if (this.currentSession) {
      this.currentSession.focusReturns!.push(timestamp);
    }
  }

  static logMCQResult(result: MCQResult): void {
    if (this.currentSession) {
      this.currentSession.mcqResults!.push(result);
    }
  }

  static saveStudySelfie(imageData: string): void {
    if (this.currentSession) {
      this.currentSession.selfieUrls!.push(imageData);
    }
    
    // Also save to selfies collection
    const selfies = JSON.parse(localStorage.getItem(this.getUserKey(this.SELFIES_KEY)) || '[]');
    selfies.push({
      id: Date.now().toString(),
      imageData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(this.getUserKey(this.SELFIES_KEY), JSON.stringify(selfies));
  }

  // Analytics
  static getAnalytics(timeRange: 'week' | 'month' | 'all' = 'week') {
    const sessions = this.getSessions();
    const tasks = this.getTasks();
    
    const now = new Date();
    const filterDate = timeRange === 'week' 
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : timeRange === 'month'
      ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      : new Date(0);

    const filteredSessions = sessions.filter(session => 
      new Date(session.endTime) >= filterDate
    );

    const totalMinutes = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalSessions = filteredSessions.length;
    
    // Calculate focus score
    const averageFocus = filteredSessions.length > 0
      ? filteredSessions.reduce((sum, session) => {
          const focusScore = Math.max(0, 1 - (session.focusLosses.length * 0.1));
          return sum + focusScore;
        }, 0) / filteredSessions.length
      : 0;

    // Daily data
    const dailyData = [];
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayMinutes = filteredSessions
        .filter(session => {
          const sessionDate = new Date(session.endTime);
          return sessionDate >= dayStart && sessionDate < dayEnd;
        })
        .reduce((sum, session) => sum + session.duration, 0);

      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        minutes: dayMinutes
      });
    }

    // Subject data
    const subjectMap = new Map();
    filteredSessions.forEach(session => {
      const current = subjectMap.get(session.subject) || 0;
      subjectMap.set(session.subject, current + session.duration);
    });

    const subjectData = Array.from(subjectMap.entries()).map(([name, minutes]) => ({
      name,
      minutes
    }));

    // Calculate streak
    const currentStreak = this.calculateStreak();

    // Recent sessions
    const recentSessions = filteredSessions
      .slice(-10)
      .map(session => ({
        date: session.endTime,
        subject: session.subject,
        duration: session.duration,
        focusScore: Math.max(0, 1 - (session.focusLosses.length * 0.1))
      }))
      .reverse();

    return {
      totalMinutes,
      totalSessions,
      averageFocus,
      currentStreak,
      dailyData,
      subjectData,
      recentSessions,
      sessions: filteredSessions
    };
  }

  private static calculateStreak(): number {
    const sessions = this.getSessions();
    if (sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) { // Check up to a year
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const hasSession = sessions.some(session => {
        const sessionDate = new Date(session.endTime);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });

      if (hasSession) {
        streak++;
      } else if (i > 0) { // Allow today to not have a session yet
        break;
      }
    }

    return streak;
  }

  // Settings
  static getSettings() {
    const settings = localStorage.getItem(this.getUserKey(this.SETTINGS_KEY));
    return settings ? JSON.parse(settings) : {};
  }

  static updateSettings(newSettings: any) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(this.getUserKey(this.SETTINGS_KEY), JSON.stringify(updated));
  }

  // Utility method to clear all data (useful for testing)
  static clearUserData(): void {
    localStorage.removeItem(this.getUserKey(this.TASKS_KEY));
    localStorage.removeItem(this.getUserKey(this.SESSIONS_KEY));
    localStorage.removeItem(this.getUserKey(this.SETTINGS_KEY));
    localStorage.removeItem(this.getUserKey(this.SELFIES_KEY));
    this.init();
  }
}