/**
 * KuroBlob AI - Cute Anime Web Speech TTS Voice Synthesizer
 * Provides browser-native speech synthesis with cute pitch, speed adjustment,
 * and real-time mouth opening lip-sync callbacks.
 */

export class SpeechSynthesizer {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.enabled = true;
    this.pitch = 1.35; // Cute high anime/robot pitch
    this.rate = 1.05;  // Slightly energetic rate
    this.voice = null;
    this.isSpeaking = false;
    this.onLipSync = null; // Callback: (mouthLevel: number) => void
    this.animFrameId = null;

    if (this.synth) {
      this.initVoices();
      if (typeof window !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer Chinese female or natural cute voice
    this.voice = voices.find(v => (v.lang.includes('zh') || v.lang.includes('cmn')) && /female|ting|mei|xiaoxiao|yunxi/i.test(v.name))
      || voices.find(v => v.lang.includes('zh'))
      || voices.find(v => v.lang.includes('en') && /female|samantha|zira|victoria/i.test(v.name))
      || voices[0] || null;
  }

  toggleTTS() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.synth) {
      this.synth.cancel();
      this.stopLipSync();
    }
    return this.enabled;
  }

  /**
   * Speak text with organic mouth lip-sync animation
   */
  speak(text, onComplete) {
    if (!this.synth || !this.enabled || !text) {
      if (onComplete) onComplete();
      return;
    }

    // Clean emotion tags [EMOTION:XYZ] and markdown emojis before speaking
    const cleanText = text.replace(/\[EMOTION:[A-Z0-9_]+\]/gi, '').replace(/[#*`_~]/g, '').trim();
    if (!cleanText) {
      if (onComplete) onComplete();
      return;
    }

    this.synth.cancel(); // Stop prior speech
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.pitch = this.pitch;
    utterance.rate = this.rate;
    if (this.voice) utterance.voice = this.voice;

    this.isSpeaking = true;
    this.startLipSync();

    utterance.onend = () => {
      this.isSpeaking = false;
      this.stopLipSync();
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.stopLipSync();
      if (onComplete) onComplete();
    };

    this.synth.speak(utterance);
  }

  startLipSync() {
    this.stopLipSync();
    let startTime = Date.now();

    const animateMouth = () => {
      if (!this.isSpeaking) return;
      const elapsed = (Date.now() - startTime) / 1000;
      // Synthesize organic talking syllable pulses (3~6 Hz) with random variations
      const mouthLevel = Math.max(0, Math.sin(elapsed * 18) * 0.4 + Math.sin(elapsed * 9) * 0.35 + 0.15);
      if (this.onLipSync) {
        this.onLipSync(mouthLevel);
      }
      this.animFrameId = requestAnimationFrame(animateMouth);
    };

    this.animFrameId = requestAnimationFrame(animateMouth);
  }

  stopLipSync() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.onLipSync) {
      this.onLipSync(0); // Close mouth
    }
  }
}
