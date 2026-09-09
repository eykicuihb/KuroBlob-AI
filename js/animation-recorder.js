/**
 * KuroBlob AI - High-Resolution 60 FPS Animated Exporter
 * Captures 3-second looping MP4 or WebM animations directly from Canvas stream.
 * Automatically prioritizes H.264/MP4 for optimal Twitter/X, WeChat, Discord, and iOS compatibility.
 */

export class AnimationRecorder {
  constructor() {
    this.isRecording = false;
  }

  /**
   * Determine best supported MIME type and file extension
   */
  getBestMimeType(preferred = 'auto') {
    if (typeof MediaRecorder === 'undefined') return { mimeType: 'video/webm', ext: 'webm' };

    const mp4Types = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1',
      'video/mp4'
    ];
    const webmTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];

    if (preferred === 'mp4') {
      for (const t of mp4Types) {
        if (MediaRecorder.isTypeSupported(t)) return { mimeType: t, ext: 'mp4' };
      }
      for (const t of webmTypes) {
        if (MediaRecorder.isTypeSupported(t)) return { mimeType: t, ext: 'webm' };
      }
    } else if (preferred === 'webm') {
      for (const t of webmTypes) {
        if (MediaRecorder.isTypeSupported(t)) return { mimeType: t, ext: 'webm' };
      }
      for (const t of mp4Types) {
        if (MediaRecorder.isTypeSupported(t)) return { mimeType: t, ext: 'mp4' };
      }
    } else {
      // 'auto': prioritize MP4 for superior social media compatibility (Twitter/X, iOS, WeChat)
      for (const t of mp4Types) {
        if (MediaRecorder.isTypeSupported(t)) return { mimeType: t, ext: 'mp4' };
      }
      for (const t of webmTypes) {
        if (MediaRecorder.isTypeSupported(t)) return { mimeType: t, ext: 'webm' };
      }
    }

    return { mimeType: 'video/webm', ext: 'webm' };
  }

  /**
   * Record canvas stream for a given duration
   */
  async record(canvas, durationSeconds = 3, onProgress = null, preferredFormat = 'auto') {
    if (!canvas || this.isRecording) return;
    this.isRecording = true;

    return new Promise((resolve, reject) => {
      try {
        const stream = canvas.captureStream(60); // 60 FPS stream
        const { mimeType, ext } = this.getBestMimeType(preferredFormat);

        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 6000000 // 6 Mbps High Quality
        });

        const chunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          this.isRecording = false;
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `kuroblob_animated_${Date.now()}.${ext}`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);

          resolve({ blob, ext, mimeType });
        };

        recorder.start();

        // Progress timer
        const startTime = Date.now();
        const interval = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          const progress = Math.min(1.0, elapsed / durationSeconds);
          if (onProgress) onProgress(progress);

          if (elapsed >= durationSeconds) {
            clearInterval(interval);
            recorder.stop();
          }
        }, 100);

      } catch (err) {
        this.isRecording = false;
        reject(err);
      }
    });
  }
}
