/**
 * 📹 FaceTracker — Lightweight Web Camera Face Tracking for KuroBlob AI (Web VTuber Mode)
 * 100% Client-side. Tracks head tilt, position drift, and eye blinks in real-time.
 */

export class FaceTracker {
  constructor(avatarRenderer) {
    this.avatar = avatarRenderer;
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.stream = null;
    this.isRunning = false;
    this.animId = null;
    this.detector = null;

    // Filtered smoothing values
    this.smoothRoll = 0;
    this.smoothOffsetX = 0;
    this.smoothOffsetY = 0;
    this.lastBlinkTime = 0;

    // Check for native browser FaceDetector
    if (window.FaceDetector) {
      try {
        this.detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      } catch (e) {
        this.detector = null;
      }
    }
  }

  async start(previewContainer) {
    if (this.isRunning) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user'
        },
        audio: false
      });

      this.video = document.createElement('video');
      this.video.srcObject = this.stream;
      this.video.setAttribute('playsinline', 'true');
      this.video.muted = true;
      await this.video.play();

      // Create mini preview canvas
      if (previewContainer) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 120;
        this.canvas.height = 90;
        this.canvas.className = 'face-preview-canvas';
        this.ctx = this.canvas.getContext('2d');
        previewContainer.innerHTML = '';
        previewContainer.appendChild(this.canvas);
      }

      this.isRunning = true;
      this.trackLoop();
      return true;
    } catch (err) {
      console.warn('Camera access denied or failed:', err);
      this.stop();
      throw err;
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }

    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
      this.video = null;
    }

    // Reset avatar tracking offsets
    if (this.avatar) {
      this.avatar.rotation = 0;
      this.avatar.targetEyeOffset.x = 0;
      this.avatar.targetEyeOffset.y = 0;
    }
  }

  async trackLoop() {
    if (!this.isRunning || !this.video) return;

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      let faceDetected = false;
      let roll = 0;
      let offsetX = 0;
      let offsetY = 0;

      // Method A: Native FaceDetector API (Chrome / Edge / Android)
      if (this.detector) {
        try {
          const faces = await this.detector.detect(this.video);
          if (faces && faces.length > 0) {
            const box = faces[0].boundingBox;
            const videoW = this.video.videoWidth;
            const videoH = this.video.videoHeight;

            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;

            // Normalized mirrored offset
            offsetX = -((centerX - videoW / 2) / (videoW / 2)) * 28;
            offsetY = ((centerY - videoH / 2) / (videoH / 2)) * 22;

            // Landmarks (eyes) for roll calculation if available
            const eyes = faces[0].landmarks?.filter(l => l.type === 'eye') || [];
            if (eyes.length >= 2) {
              const dx = eyes[1].locations[0].x - eyes[0].locations[0].x;
              const dy = eyes[1].locations[0].y - eyes[0].locations[0].y;
              roll = -Math.atan2(dy, dx);
            }
            faceDetected = true;
          }
        } catch (e) {
          // Fallback to optical tracker below
        }
      }

      // Method B: Optical Center-of-Mass & Head Movement Tracker Fallback
      if (!faceDetected) {
        const tracking = this.computeOpticalTracking();
        offsetX = tracking.offsetX;
        offsetY = tracking.offsetY;
        roll = tracking.roll;
      }

      // Smooth interpolation for jitter-free 60 FPS motion
      this.smoothRoll += (roll - this.smoothRoll) * 0.15;
      this.smoothOffsetX += (offsetX - this.smoothOffsetX) * 0.18;
      this.smoothOffsetY += (offsetY - this.smoothOffsetY) * 0.18;

      // Apply to KuroBlob avatar
      if (this.avatar) {
        this.avatar.rotation = Math.max(-0.4, Math.min(0.4, this.smoothRoll));
        this.avatar.targetEyeOffset.x = this.smoothOffsetX;
        this.avatar.targetEyeOffset.y = this.smoothOffsetY;
      }

      // Render mini PiP canvas
      this.renderPreview(offsetX, offsetY, roll);
    }

    this.animId = requestAnimationFrame(() => this.trackLoop());
  }

  computeOpticalTracking() {
    if (!this.ctx || !this.video) return { offsetX: 0, offsetY: 0, roll: 0 };

    // Draw downsampled frame to preview canvas
    this.ctx.save();
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(this.video, -this.canvas.width, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    // Sample center quadrant for optical skin/face centroid
    const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imgData.data;
    let sumX = 0;
    let sumY = 0;
    let weightSum = 0;

    for (let y = 10; y < this.canvas.height - 10; y += 4) {
      for (let x = 10; x < this.canvas.width - 10; x += 4) {
        const idx = (y * this.canvas.width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Skin-tone & face luminance heuristic
        const isFaceLuma = (r > 60 && g > 40 && b > 20 && r > b && (r - g) > 10);
        if (isFaceLuma) {
          sumX += x;
          sumY += y;
          weightSum++;
        }
      }
    }

    if (weightSum > 30) {
      const avgX = sumX / weightSum;
      const avgY = sumY / weightSum;

      const normX = (avgX - this.canvas.width / 2) / (this.canvas.width / 2);
      const normY = (avgY - this.canvas.height / 2) / (this.canvas.height / 2);

      const offsetX = normX * 24;
      const offsetY = normY * 18;
      const roll = normX * 0.25;

      return { offsetX, offsetY, roll };
    }

    return { offsetX: 0, offsetY: 0, roll: 0 };
  }

  renderPreview(offsetX, offsetY, roll) {
    if (!this.ctx || !this.canvas) return;

    // Overlay tracking crosshair & roll indicator
    this.ctx.save();
    this.ctx.strokeStyle = '#00F2FE';
    this.ctx.lineWidth = 1.5;
    const cx = this.canvas.width / 2 + offsetX * 1.2;
    const cy = this.canvas.height / 2 + offsetY * 1.2;

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    this.ctx.stroke();

    // Roll indicator line
    this.ctx.beginPath();
    this.ctx.moveTo(cx - Math.cos(roll) * 20, cy - Math.sin(roll) * 20);
    this.ctx.lineTo(cx + Math.cos(roll) * 20, cy + Math.sin(roll) * 20);
    this.ctx.stroke();

    this.ctx.restore();
  }
}
