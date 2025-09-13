interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    studyReminders: boolean;
    deadlineAlerts: boolean;
    motivationalTips: boolean;
    breakReminders: boolean;
    sound: boolean;
    vibration: boolean;
  };
  studySettings: {
    defaultSessionDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
  };
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export class AuthService {
  private static readonly USERS_KEY = 'study-planner-users';
  private static readonly CURRENT_USER_KEY = 'study-planner-current-user';
  private static readonly SESSION_KEY = 'study-planner-session';
  
  private static currentUser: User | null = null;

  static init(): void {
    // Initialize users storage
    if (!localStorage.getItem(this.USERS_KEY)) {
      const demoUser: User = {
        id: 'demo-user',
        username: 'demo',
        email: 'demo@studyplanner.com',
        fullName: 'Demo User',
        avatar: '👤',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferences: this.getDefaultPreferences()
      };
      
      // Hash demo password (simple demo - in production use proper hashing)
      const users = [{
        ...demoUser,
        passwordHash: this.hashPassword('demo123')
      }];
      
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    // Check for existing session
    const sessionData = localStorage.getItem(this.SESSION_KEY);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      if (this.isValidSession(session)) {
        this.currentUser = this.getUserById(session.userId);
      } else {
        this.clearSession();
      }
    }
  }

  private static getDefaultPreferences(): UserPreferences {
    return {
      theme: 'system',
      notifications: {
        enabled: true,
        studyReminders: true,
        deadlineAlerts: true,
        motivationalTips: true,
        breakReminders: true,
        sound: true,
        vibration: true
      },
      studySettings: {
        defaultSessionDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4
      }
    };
  }

  static async register(data: RegisterData): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Validation
      if (data.password !== data.confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      if (data.password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long' };
      }

      const users = this.getUsers();
      
      // Check if username or email already exists
      if (users.find(u => u.username === data.username)) {
        return { success: false, message: 'Username already exists' };
      }

      if (users.find(u => u.email === data.email)) {
        return { success: false, message: 'Email already registered' };
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        avatar: this.generateAvatar(data.fullName),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferences: this.getDefaultPreferences()
      };

      // Save user with hashed password
      const userWithPassword = {
        ...newUser,
        passwordHash: this.hashPassword(data.password)
      };

      users.push(userWithPassword);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

      // Auto-login the new user
      this.createSession(newUser);
      this.currentUser = newUser;

      return { success: true, message: 'Account created successfully!', user: newUser };
    } catch (error) {
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  static async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const users = this.getUsers();
      const user = users.find(u => u.username === credentials.username);

      if (!user) {
        return { success: false, message: 'Invalid username or password' };
      }

      if (!this.verifyPassword(credentials.password, user.passwordHash)) {
        return { success: false, message: 'Invalid username or password' };
      }

      // Update last login
      user.lastLogin = new Date().toISOString();
      this.updateUserInStorage(user);

      // Create session
      const userWithoutPassword = { ...user };
      delete (userWithoutPassword as any).passwordHash;
      
      this.createSession(userWithoutPassword);
      this.currentUser = userWithoutPassword;

      return { success: true, message: 'Login successful!', user: userWithoutPassword };
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  static logout(): void {
    this.currentUser = null;
    this.clearSession();
  }

  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  static isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  static updateUserPreferences(preferences: Partial<UserPreferences>): boolean {
    if (!this.currentUser) return false;

    try {
      this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
      this.updateUserInStorage(this.currentUser);
      return true;
    } catch (error) {
      return false;
    }
  }

  static updateUserProfile(updates: Partial<Pick<User, 'fullName' | 'email' | 'avatar'>>): boolean {
    if (!this.currentUser) return false;

    try {
      Object.assign(this.currentUser, updates);
      this.updateUserInStorage(this.currentUser);
      return true;
    } catch (error) {
      return false;
    }
  }

  static changePassword(currentPassword: string, newPassword: string): { success: boolean; message: string } {
    if (!this.currentUser) {
      return { success: false, message: 'Not authenticated' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long' };
    }

    try {
      const users = this.getUsers();
      const user = users.find(u => u.id === this.currentUser!.id);

      if (!user || !this.verifyPassword(currentPassword, user.passwordHash)) {
        return { success: false, message: 'Current password is incorrect' };
      }

      user.passwordHash = this.hashPassword(newPassword);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

      return { success: true, message: 'Password changed successfully!' };
    } catch (error) {
      return { success: false, message: 'Failed to change password' };
    }
  }

  private static getUsers(): any[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  private static getUserById(id: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.id === id);
    if (user) {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  private static updateUserInStorage(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      // Preserve password hash
      users[index] = { ...users[index], ...user };
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }

  private static createSession(user: User): void {
    const session = {
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  private static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  private static isValidSession(session: any): boolean {
    return session && session.expiresAt && new Date(session.expiresAt) > new Date();
  }

  private static hashPassword(password: string): string {
    // Simple hash for demo - in production, use proper hashing like bcrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private static verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  private static generateAvatar(fullName: string): string {
    const emojis = ['👤', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍💻', '👩‍💻', '🤓', '😊', '🌟'];
    const index = fullName.length % emojis.length;
    return emojis[index];
  }

  // Demo account helper
  static getDemoCredentials(): LoginCredentials {
    return {
      username: 'demo',
      password: 'demo123'
    };
  }
}