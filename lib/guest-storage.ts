export interface GuestStats {
  totalTests: number;
  totalTime: number;
  bestWpm: number;
  averageWpm: number;
  bestAccuracy: number;
  averageAccuracy: number;
  totalWords: number;
  totalErrors: number;
  sessionStarted: string;
}

export interface GuestTestResult {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  testType: string;
  timestamp: string;
  cheatDetected: boolean;
}

const GUEST_STATS_KEY = "typing-competitor-guest-stats";
const GUEST_TESTS_KEY = "typing-competitor-guest-tests";

export class GuestStorageManager {
  static getStats(): GuestStats {
    if (typeof window === "undefined") return this.getDefaultStats();

    const stored = localStorage.getItem(GUEST_STATS_KEY);
    if (!stored) return this.getDefaultStats();

    try {
      return JSON.parse(stored);
    } catch {
      return this.getDefaultStats();
    }
  }

  static saveStats(stats: GuestStats): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(GUEST_STATS_KEY, JSON.stringify(stats));
  }

  static getRecentTests(): GuestTestResult[] {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(GUEST_TESTS_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static saveTestResult(result: GuestTestResult): void {
    if (typeof window === "undefined") return;

    const tests = this.getRecentTests();
    tests.unshift(result);

    // Keep only last 20 tests
    const limitedTests = tests.slice(0, 20);
    localStorage.setItem(GUEST_TESTS_KEY, JSON.stringify(limitedTests));
  }

  static updateStats(testResult: GuestTestResult): void {
    const stats = this.getStats();

    const newStats: GuestStats = {
      totalTests: stats.totalTests + 1,
      totalTime: stats.totalTime + testResult.timeElapsed,
      bestWpm: Math.max(stats.bestWpm, testResult.wpm),
      averageWpm: Math.round(
        (stats.averageWpm * stats.totalTests + testResult.wpm) /
          (stats.totalTests + 1),
      ),
      bestAccuracy: Math.max(stats.bestAccuracy, testResult.accuracy),
      averageAccuracy: Math.round(
        (stats.averageAccuracy * stats.totalTests + testResult.accuracy) /
          (stats.totalTests + 1),
      ),
      totalWords:
        stats.totalWords +
        Math.round(testResult.wpm * (testResult.timeElapsed / 60)),
      totalErrors: stats.totalErrors + testResult.errors,
      sessionStarted: stats.sessionStarted,
    };

    this.saveStats(newStats);
    this.saveTestResult(testResult);
  }

  static clearData(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(GUEST_STATS_KEY);
    localStorage.removeItem(GUEST_TESTS_KEY);
  }

  static exportData(): string {
    const stats = this.getStats();
    const tests = this.getRecentTests();

    return JSON.stringify(
      {
        stats,
        tests,
        exportedAt: new Date().toISOString(),
      },
      null,
      2,
    );
  }

  private static getDefaultStats(): GuestStats {
    return {
      totalTests: 0,
      totalTime: 0,
      bestWpm: 0,
      averageWpm: 0,
      bestAccuracy: 0,
      averageAccuracy: 0,
      totalWords: 0,
      totalErrors: 0,
      sessionStarted: new Date().toISOString(),
    };
  }
}
