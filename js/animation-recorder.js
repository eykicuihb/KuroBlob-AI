/**
 * KuroBlob AI - High-Resolution 60 FPS Animated Exporter
 * Captures 3-second looping WebM animations directly from Canvas stream.
 */

export class AnimationRecorder {
  constructor() {
    this.isRecording = false;
  }

  /**
   * Record canvas stream for a given duration
   */
  async record(canvas, durationSeconds = 3, onProgress = null) {
    if (!canvas || this.isRecording) return;
    this.isRecording = true;

    return new Promise((resolve, reject) => {
      try {
        const stream = canvas.captureStream(60); // 60 FPS stream
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }

        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 5000000 // 5 Mbps High Quality
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
          a.download = `kuroblob_animated_${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);

          resolve(blob);
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
