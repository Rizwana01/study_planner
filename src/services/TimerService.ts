export class TimerService {
  private static startTime: Date | null = null;
  private static pauseTime: number = 0;
  private static sessionSubject: string | null = null;

  static startSession(subject: string): void {
    this.startTime = new Date();
    this.pauseTime = 0;
    this.sessionSubject = subject;
  }

  static pauseSession(): void {
    if (this.startTime) {
      this.pauseTime += Date.now() - this.startTime.getTime();
    }
  }

  static resumeSession(): void {
    this.startTime = new Date();
  }

  static endSession(): void {
    this.startTime = null;
    this.pauseTime = 0;
    this.sessionSubject = null;
  }

  static getElapsedTime(): number {
    if (!this.startTime) return 0;
    const currentTime = Date.now() - this.startTime.getTime();
    return currentTime + this.pauseTime;
  }

  static getCurrentSubject(): string | null {
    return this.sessionSubject;
  }

  static isRunning(): boolean {
    return this.startTime !== null;
  }
}