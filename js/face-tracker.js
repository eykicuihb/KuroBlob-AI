/**
 * Web VTuber Camera Face Tracker
 * Privacy-first lightweight client-side face tracker.
 * Tracks user head roll angle, head position offset (X/Y), and movement
 * to dynamically drive KuroBlob's avatar tilt and eye gaze in real-time.
 */

export class FaceTracker {
  constructor(avatarRenderer) {
    this.avatar = avatarRenderer;
    this.video = null;
    this.stream = null;
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    this.animId = null;

    // Smoothed tracking outputs
    this.smoothRoll = 0;
    this.smoothOffsetX = 0;
    this.smoothOffsetY = 0;

    // Previous frame memory for motion flow
    this.prevFrame = null;
    this.baselineX = null;
    this.baselineY = null;

    // Native browser FaceDetector (Chrome Experimental / Android)
    this.detector = null;
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        // @ts-ignore
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
      this.video.setAttribute('playsinline', '');
      this.video.muted = true;
      await this.video.play();

      // Create mini preview canvas
      if (previewContainer) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 140;
        this.canvas.height = 105;
        this.canvas.className = 'face-preview-canvas';
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        previewContainer.innerHTML = '';
        previewContainer.appendChild(this.canvas);
      }

      this.isRunning = true;
      this.prevFrame = null;
      this.baselineX = null;
      this.baselineY = null;
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
      this.avatar.setFaceTracking(false);
    }
  }

  async trackLoop() {
    if (!this.isRunning || !this.video) return;

    if (this.video.readyState >= 2) {
      let faceDetected = false;
      let rawRoll = 0;
      let rawOffsetX = 0;
      let rawOffsetY = 0;

      // Method A: Native FaceDetector API (Chrome / Edge / Android)
      if (this.detector) {
        try {
          const faces = await this.detector.detect(this.video);
          if (faces && faces.length > 0) {
            const box = faces[0].boundingBox;
            const videoW = this.video.videoWidth || 320;
            const videoH = this.video.videoHeight || 240;

            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;

            // Normalized mirrored offset
            rawOffsetX = -((centerX - videoW / 2) / (videoW / 2)) * 36;
            rawOffsetY = ((centerY - videoH / 2) / (videoH / 2)) * 28;

            // Landmarks (eyes) for roll calculation
            const eyes = faces[0].landmarks?.filter(l => l.type === 'eye') || [];
            if (eyes.length >= 2) {
              const dx = eyes[1].locations[0].x - eyes[0].locations[0].x;
              const dy = eyes[1].locations[0].y - eyes[0].locations[0].y;
              rawRoll = -Math.atan2(dy, dx) * 1.5;
            } else {
              rawRoll = -(rawOffsetX / 36) * 0.35;
            }
            faceDetected = true;
          }
        } catch (e) {
          // Fallback to optical motion flow
        }
      }

      // Method B: Optical Center-of-Mass & Adaptive Brightness/Motion Centroid Fallback
      if (!faceDetected) {
        const tracking = this.computeOpticalTracking();
        rawOffsetX = tracking.offsetX;
        rawOffsetY = tracking.offsetY;
        rawRoll = tracking.roll;
      }

      // Fast, responsive smoothing (0.28 lerp for low latency)
      this.smoothRoll += (rawRoll - this.smoothRoll) * 0.28;
      this.smoothOffsetX += (rawOffsetX - this.smoothOffsetX) * 0.30;
      this.smoothOffsetY += (rawOffsetY - this.smoothOffsetY) * 0.30;

      // Apply directly to KuroBlob avatar
      if (this.avatar) {
        this.avatar.setFaceTracking(true, {
          roll: Math.max(-0.45, Math.min(0.45, this.smoothRoll)),
          offsetX: Math.max(-35, Math.min(35, this.smoothOffsetX)),
          offsetY: Math.max(-25, Math.min(25, this.smoothOffsetY))
        });
      }

      // Render mini PiP canvas preview with head tracking visualizer
      this.renderPreview(rawOffsetX, rawOffsetY, this.smoothRoll);
    }

    this.animId = requestAnimationFrame(() => this.trackLoop());
  }

  computeOpticalTracking() {
    if (!this.ctx || !this.video || !this.canvas) return { offsetX: 0, offsetY: 0, roll: 0 };

    const cw = this.canvas.width;
    const ch = this.canvas.height;

    // Draw downsampled mirrored frame to preview canvas
    this.ctx.save();
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(this.video, -cw, 0, cw, ch);
    this.ctx.restore();

    const imgData = this.ctx.getImageData(0, 0, cw, ch);
    const data = imgData.data;

    let sumX = 0;
    let sumY = 0;
    let weightSum = 0;

    // Left vs Right brightness for Head Roll detection
    let leftLumaSum = 0;
    let rightLumaSum = 0;
    let leftCount = 0;
    let rightCount = 0;

    for (let y = 8; y < ch - 8; y += 3) {
      for (let x = 8; x < cw - 8; x += 3) {
        const idx = (y * cw + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const luma = (r * 0.299 + g * 0.587 + b * 0.114);

        // Center weight priority
        const distFromCenter = Math.hypot((x - cw / 2) / (cw / 2), (y - ch / 2) / (ch / 2));
        const centerWeight = Math.max(0.2, 1.2 - distFromCenter * 0.8);

        // Face & Foreground detection heuristic (warm tone or high center luminance)
        const isWarm = (r > g && g > b && r > 45);
        const isBright = luma > 85;

        if (isWarm || isBright) {
          const weight = (isWarm ? 2.0 : 1.0) * centerWeight;
          sumX += x * weight;
          sumY += y * weight;
          weightSum += weight;
        }

        // Left/right quadrant comparison
        if (x < cw / 2) {
          leftLumaSum += luma;
          leftCount++;
        } else {
          rightLumaSum += luma;
          rightCount++;
        }
      }
    }

    if (weightSum > 10) {
      const avgX = sumX / weightSum;
      const avgY = sumY / weightSum;

      if (this.baselineX === null) {
        this.baselineX = avgX;
        this.baselineY = avgY;
      } else {
        // Slowly drift baseline to accommodate posture shifts
        this.baselineX += (avgX - this.baselineX) * 0.005;
        this.baselineY += (avgY - this.baselineY) * 0.005;
      }

      const diffX = (avgX - this.baselineX) / (cw * 0.3);
      const diffY = (avgY - this.baselineY) / (ch * 0.3);

      const offsetX = Math.max(-35, Math.min(35, diffX * 35));
      const offsetY = Math.max(-25, Math.min(25, diffY * 25));

      // Compute roll from asymmetry and horizontal displacement
      const lumaDiff = (leftCount && rightCount) ? ((rightLumaSum / rightCount) - (leftLumaSum / leftCount)) / 100 : 0;
      const roll = Math.max(-0.45, Math.min(0.45, (diffX * 0.4) + (lumaDiff * 0.2)));

      return { offsetX, offsetY, roll };
    }

    return { offsetX: 0, offsetY: 0, roll: 0 };
  }

  renderPreview(offsetX, offsetY, roll) {
    if (!this.ctx || !this.canvas) return;

    const cw = this.canvas.width;
    const ch = this.canvas.height;

    // Overlay tracking crosshair & roll angle indicator
    this.ctx.save();
    this.ctx.strokeStyle = '#00F2FE';
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = 'rgba(0, 242, 254, 0.6)';
    this.ctx.shadowBlur = 6;

    const cx = cw / 2 + (offsetX / 35) * (cw * 0.35);
    const cy = ch / 2 + (offsetY / 25) * (ch * 0.35);

    // Target circle
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    this.ctx.stroke();

    // Roll indicator angle line
    this.ctx.strokeStyle = '#FF3B30';
    this.ctx.beginPath();
    this.ctx.moveTo(cx - Math.cos(roll) * 26, cy - Math.sin(roll) * 26);
    this.ctx.lineTo(cx + Math.cos(roll) * 26, cy + Math.sin(roll) * 26);
    this.ctx.stroke();

    // Status text
    this.ctx.font = '10px Outfit, sans-serif';
    this.ctx.fillStyle = '#00F2FE';
    this.ctx.fillText(`VTuber: Active`, 6, 14);

    this.ctx.restore();
  }
}
