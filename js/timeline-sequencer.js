/**
 * KuroBlob AI - Animation Timeline & Montage Sequencer Engine
 * Allows chaining multiple emotions into a narrative motion sequence with custom durations.
 * Supports loop playback, active clip tracking, and multi-clip MP4 export.
 */

export class TimelineSequencer {
  constructor(avatarRenderer, soundFx) {
    this.avatar = avatarRenderer;
    this.soundFx = soundFx;
    this.clips = [];
    this.isPlaying = false;
    this.currentIndex = 0;
    this.timerId = null;
    this.loop = true;
    this.onStepChange = null;
    this.onPlayStateChange = null;

    // Load default narrative story preset
    this.loadPreset('INSIGHT');
  }

  /**
   * Story narrative presets
   */
  static PRESETS = {
    INSIGHT: [
      { emotion: 'IDLE', emoji: '👁️', nameZh: '平视静止', duration: 1.2 },
      { emotion: 'THINKING', emoji: '🌀', nameZh: '深度思考', duration: 2.0 },
      { emotion: 'STAR', emoji: '🤩', nameZh: '灵光乍现', duration: 1.5 },
      { emotion: 'HAPPY', emoji: '😄', nameZh: '豁然开朗', duration: 2.0 }
    ],
    ROMANCE: [
      { emotion: 'COOL', emoji: '😎', nameZh: '酷帅登场', duration: 1.5 },
      { emotion: 'WINK', emoji: '😜', nameZh: '眨眼放电', duration: 1.0 },
      { emotion: 'SHY', emoji: '😳', nameZh: '害羞脸红', duration: 1.8 },
      { emotion: 'LOVE', emoji: '❤️', nameZh: '心动告白', duration: 2.2 }
    ],
    HACKER: [
      { emotion: 'ROBOT', emoji: '🤖', nameZh: '机器待机', duration: 1.5 },
      { emotion: 'FOCUSED', emoji: '🎯', nameZh: '极客敲码', duration: 2.0 },
      { emotion: 'FIRE', emoji: '🔥', nameZh: '热血沸腾', duration: 1.5 },
      { emotion: 'PARTY', emoji: '🎉', nameZh: '通宵狂欢', duration: 2.5 }
    ],
    WEATHER: [
      { emotion: 'SUNNY', emoji: '☀️', nameZh: '明媚晴天', duration: 1.5 },
      { emotion: 'WINDY', emoji: '🌬️', nameZh: '起风吹拂', duration: 1.5 },
      { emotion: 'RAIN', emoji: '🌧️', nameZh: '阴雨绵绵', duration: 1.8 },
      { emotion: 'THUNDER', emoji: '🌩️', nameZh: '电闪雷鸣', duration: 1.5 },
      { emotion: 'RAINBOW', emoji: '🌈', nameZh: '彩虹破晓', duration: 2.5 }
    ]
  };

  loadPreset(presetKey) {
    const list = TimelineSequencer.PRESETS[presetKey] || TimelineSequencer.PRESETS.INSIGHT;
    this.stop();
    this.clips = list.map((item, idx) => ({
      id: `clip_${Date.now()}_${idx}`,
      emotion: item.emotion,
      emoji: item.emoji,
      nameZh: item.nameZh,
      duration: item.duration
    }));
    this.currentIndex = 0;
  }

  getTotalDuration() {
    return Math.round(this.clips.reduce((sum, c) => sum + (parseFloat(c.duration) || 1.0), 0) * 10) / 10;
  }

  addClip(emotion, emoji = '✨', nameZh = '动态表情', duration = 1.5) {
    this.clips.push({
      id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      emotion,
      emoji,
      nameZh,
      duration: Math.max(0.4, Math.min(6.0, parseFloat(duration) || 1.5))
    });
  }

  removeClip(index) {
    if (index >= 0 && index < this.clips.length) {
      this.clips.splice(index, 1);
      if (this.currentIndex >= this.clips.length) {
        this.currentIndex = 0;
      }
    }
  }

  moveClip(index, direction) {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= this.clips.length) return;
    const item = this.clips.splice(index, 1)[0];
    this.clips.splice(newIdx, 0, item);
  }

  updateClipDuration(index, newDuration) {
    if (this.clips[index]) {
      this.clips[index].duration = Math.max(0.4, Math.min(8.0, parseFloat(newDuration) || 1.0));
    }
  }

  play() {
    if (this.clips.length === 0) return;
    this.isPlaying = true;
    if (this.onPlayStateChange) this.onPlayStateChange(true);
    this._executeStep();
  }

  pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.onPlayStateChange) this.onPlayStateChange(false);
  }

  stop() {
    this.pause();
    this.currentIndex = 0;
    if (this.onStepChange) this.onStepChange(0);
  }

  _executeStep() {
    if (!this.isPlaying || this.clips.length === 0) return;

    if (this.currentIndex >= this.clips.length) {
      if (this.loop) {
        this.currentIndex = 0;
      } else {
        this.stop();
        return;
      }
    }

    const currentClip = this.clips[this.currentIndex];
    if (currentClip && this.avatar) {
      this.avatar.setEmotion(currentClip.emotion);
      if (this.soundFx) {
        this.soundFx.pop(700 + (this.currentIndex % 4) * 80, 0.05);
      }
    }

    if (this.onStepChange) {
      this.onStepChange(this.currentIndex);
    }

    const ms = (parseFloat(currentClip.duration) || 1.5) * 1000;
    this.timerId = setTimeout(() => {
      if (!this.isPlaying) return;
      this.currentIndex++;
      this._executeStep();
    }, ms);
  }
}
