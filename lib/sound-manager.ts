export class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: { [key: string]: AudioBuffer } = {};
  private enabled = true;

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeAudioContext();
      this.loadSounds();
    }
  }

  private async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn("Audio context not supported:", error);
    }
  }

  private async loadSounds() {
    if (!this.audioContext) return;

    const soundFiles = {
      keypress: this.generateKeypressSound(),
      error: this.generateErrorSound(),
      success: this.generateSuccessSound(),
      finish: this.generateFinishSound(),
    };

    for (const [name, audioBuffer] of Object.entries(soundFiles)) {
      this.sounds[name] = audioBuffer;
    }
  }

  private generateKeypressSound(): AudioBuffer {
    if (!this.audioContext)
      return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.1;
    const buffer = this.audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate,
    );
    const data = buffer.getChannelData(0);

    // Generate a pleasant keypress sound
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 800 + Math.random() * 200;
      const envelope = Math.exp(-t * 10);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.1;
    }

    return buffer;
  }

  private generateErrorSound(): AudioBuffer {
    if (!this.audioContext)
      return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2;
    const buffer = this.audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate,
    );
    const data = buffer.getChannelData(0);

    // Generate an error sound (lower frequency, longer)
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 200 + Math.sin(t * 20) * 50;
      const envelope = Math.exp(-t * 5);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.15;
    }

    return buffer;
  }

  private generateSuccessSound(): AudioBuffer {
    if (!this.audioContext)
      return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const buffer = this.audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate,
    );
    const data = buffer.getChannelData(0);

    // Generate a success sound (ascending notes)
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 440 + t * 220; // Ascending from 440Hz to 660Hz
      const envelope = Math.exp(-t * 3);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.1;
    }

    return buffer;
  }

  private generateFinishSound(): AudioBuffer {
    if (!this.audioContext)
      return new AudioBuffer({ length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5;
    const buffer = this.audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate,
    );
    const data = buffer.getChannelData(0);

    // Generate a finish sound (chord)
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2);
      const note1 = Math.sin(2 * Math.PI * 523 * t); // C5
      const note2 = Math.sin(2 * Math.PI * 659 * t); // E5
      const note3 = Math.sin(2 * Math.PI * 784 * t); // G5
      data[i] = (note1 + note2 + note3) * envelope * 0.05;
    }

    return buffer;
  }

  playSound(soundName: string) {
    if (!this.enabled || !this.audioContext || !this.sounds[soundName]) return;

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds[soundName];
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.warn("Error playing sound:", error);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();
