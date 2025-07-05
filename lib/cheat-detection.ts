interface TypingEvent {
  timestamp: number;
  char: string;
  correct: boolean;
  timeSinceLastKey: number;
}

interface CheatDetectionResult {
  isCheatDetected: boolean;
  cheatType: string[];
  confidence: number;
  details: string[];
}

export class CheatDetector {
  private events: TypingEvent[] = [];
  private startTime = 0;
  private suspiciousPatterns: string[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.events = [];
    this.startTime = Date.now();
    this.suspiciousPatterns = [];
  }

  addEvent(char: string, correct: boolean) {
    const now = Date.now();
    const timeSinceLastKey =
      this.events.length > 0
        ? now - this.events[this.events.length - 1].timestamp
        : 0;

    this.events.push({
      timestamp: now,
      char,
      correct,
      timeSinceLastKey,
    });
  }

  analyze(): CheatDetectionResult {
    const cheatTypes: string[] = [];
    const details: string[] = [];
    let confidence = 0;

    // 1. Impossible Speed Detection
    const impossibleSpeed = this.detectImpossibleSpeed();
    if (impossibleSpeed.detected) {
      cheatTypes.push("impossible_speed");
      details.push(impossibleSpeed.detail);
      confidence += 0.8;
    }

    // 2. Consistent Timing Pattern (Bot Detection)
    const botPattern = this.detectBotPattern();
    if (botPattern.detected) {
      cheatTypes.push("bot_pattern");
      details.push(botPattern.detail);
      confidence += 0.9;
    }

    // 3. Perfect Accuracy at High Speed
    const perfectAccuracy = this.detectPerfectAccuracy();
    if (perfectAccuracy.detected) {
      cheatTypes.push("perfect_accuracy");
      details.push(perfectAccuracy.detail);
      confidence += 0.6;
    }

    // 4. Unusual Keystroke Patterns
    const unusualPattern = this.detectUnusualPatterns();
    if (unusualPattern.detected) {
      cheatTypes.push("unusual_pattern");
      details.push(unusualPattern.detail);
      confidence += 0.5;
    }

    // 5. Copy-Paste Detection
    const copyPaste = this.detectCopyPaste();
    if (copyPaste.detected) {
      cheatTypes.push("copy_paste");
      details.push(copyPaste.detail);
      confidence += 1.0;
    }

    return {
      isCheatDetected: confidence > 0.7,
      cheatType: cheatTypes,
      confidence: Math.min(confidence, 1.0),
      details,
    };
  }

  private detectImpossibleSpeed(): { detected: boolean; detail: string } {
    if (this.events.length < 10) return { detected: false, detail: "" };

    const recentEvents = this.events.slice(-10);
    const avgTimeBetweenKeys =
      recentEvents.reduce((sum, event) => sum + event.timeSinceLastKey, 0) /
      recentEvents.length;

    // If average time between keys is less than 50ms (1200+ WPM), it's suspicious
    if (avgTimeBetweenKeys < 50 && avgTimeBetweenKeys > 0) {
      const estimatedWPM = Math.round(60000 / (avgTimeBetweenKeys * 5));
      return {
        detected: true,
        detail: `Impossible typing speed detected: ~${estimatedWPM} WPM (avg ${avgTimeBetweenKeys}ms between keys)`,
      };
    }

    return { detected: false, detail: "" };
  }

  private detectBotPattern(): { detected: boolean; detail: string } {
    if (this.events.length < 20) return { detected: false, detail: "" };

    const timings = this.events
      .slice(-20)
      .map((e) => e.timeSinceLastKey)
      .filter((t) => t > 0);
    if (timings.length < 10) return { detected: false, detail: "" };

    // Calculate standard deviation
    const mean = timings.reduce((sum, t) => sum + t, 0) / timings.length;
    const variance =
      timings.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) /
      timings.length;
    const stdDev = Math.sqrt(variance);

    // If standard deviation is very low, it might be a bot
    const coefficient = stdDev / mean;
    if (coefficient < 0.1 && mean < 200) {
      return {
        detected: true,
        detail: `Bot-like consistent timing detected: ${coefficient.toFixed(3)} coefficient of variation`,
      };
    }

    return { detected: false, detail: "" };
  }

  private detectPerfectAccuracy(): { detected: boolean; detail: string } {
    if (this.events.length < 50) return { detected: false, detail: "" };

    const recentEvents = this.events.slice(-50);
    const accuracy =
      recentEvents.filter((e) => e.correct).length / recentEvents.length;
    const avgSpeed = this.calculateCurrentWPM();

    // Perfect accuracy at very high speed is suspicious
    if (accuracy === 1.0 && avgSpeed > 120) {
      return {
        detected: true,
        detail: `Perfect accuracy (100%) at high speed (${avgSpeed} WPM) is suspicious`,
      };
    }

    return { detected: false, detail: "" };
  }

  private detectUnusualPatterns(): { detected: boolean; detail: string } {
    if (this.events.length < 30) return { detected: false, detail: "" };

    // Check for alternating fast/slow patterns
    const timings = this.events
      .slice(-30)
      .map((e) => e.timeSinceLastKey)
      .filter((t) => t > 0);
    let alternatingPattern = 0;

    for (let i = 1; i < timings.length - 1; i++) {
      const prev = timings[i - 1];
      const curr = timings[i];
      const next = timings[i + 1];

      // Check if current timing is significantly different from neighbors
      if (
        (curr < prev * 0.5 && curr < next * 0.5) ||
        (curr > prev * 2 && curr > next * 2)
      ) {
        alternatingPattern++;
      }
    }

    if (alternatingPattern > timings.length * 0.3) {
      return {
        detected: true,
        detail: `Unusual alternating speed pattern detected: ${alternatingPattern} irregular timings`,
      };
    }

    return { detected: false, detail: "" };
  }

  private detectCopyPaste(): { detected: boolean; detail: string } {
    if (this.events.length < 5) return { detected: false, detail: "" };

    // Look for sudden bursts of characters with no timing
    const recentEvents = this.events.slice(-10);
    const zeroTimingCount = recentEvents.filter(
      (e) => e.timeSinceLastKey === 0,
    ).length;

    if (zeroTimingCount > 3) {
      return {
        detected: true,
        detail: `Possible copy-paste detected: ${zeroTimingCount} characters with zero timing`,
      };
    }

    return { detected: false, detail: "" };
  }

  private calculateCurrentWPM(): number {
    if (this.events.length < 5) return 0;

    const timeElapsed = (Date.now() - this.startTime) / 1000 / 60; // minutes
    const wordsTyped = this.events.length / 5; // assume 5 chars per word
    return Math.round(wordsTyped / timeElapsed);
  }

  getStats() {
    const totalTime =
      this.events.length > 0
        ? (this.events[this.events.length - 1].timestamp - this.startTime) /
          1000
        : 0;
    const accuracy =
      this.events.length > 0
        ? this.events.filter((e) => e.correct).length / this.events.length
        : 0;
    const wpm = this.calculateCurrentWPM();

    return {
      totalTime,
      accuracy: Math.round(accuracy * 100),
      wpm,
      totalCharacters: this.events.length,
      errors: this.events.filter((e) => !e.correct).length,
    };
  }
}
