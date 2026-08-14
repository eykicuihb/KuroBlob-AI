/**
 * Web VTuber Camera Face Tracker & Audio Lip-Sync Engine
 * Privacy-first lightweight client-side face tracker.
 * Tracks user head roll angle, yaw/turning angle, position offset (X/Y),
 * and microphone speech volume to dynamically drive KuroBlob's avatar tilt,
 * jelly lean, 3D eye gaze parallax, and talking mouth in real-time.
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

    // Audio Analysis for Voice / Lip-Sync
    this.audioCtx = null;
    this.analyser = null;
    this.audioData = null;
    this.mouthLevel = 0;

    // Smoothed tracking outputs (high-speed snappy lerp)
    this.smoothRoll = 0;
    this.smoothBodyX = 0;
    this.smoothBodyY = 0;
    this.smoothOffsetX = 0;
    this.smoothOffsetY = 0;

    // Baseline drift
    this.baselineX = null;
    this.baselineY = null;

    // Native browser FaceDetector (Chrome / Edge / Android)
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
      // 1. Request Video & Audio
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
          },
          audio: true
        });
      } catch (e) {
        // Fallback to video only
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
          },
          audio: false
        });
      }

      // 2. Setup Video Element
      this.video = document.createElement('video');
      this.video.srcObject = this.stream;
      this.video.setAttribute('playsinline', '');
      this.video.muted = true;
      await this.video.play();

      // 3. Setup Audio Analyser for Lip-sync
      const audioTracks = this.stream.getAudioTracks();
      if (audioTracks && audioTracks.length > 0) {
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            this.audioCtx = new AudioContextClass();
            const source = this.audioCtx.createMediaStreamSource(this.stream);
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.4;
            source.connect(this.analyser);
            this.audioData = new Uint8Array(this.analyser.frequencyBinCount);
          }
        } catch (err) {
          console.warn('Audio analyser init failed, continuing without lip sync:', err);
        }
      }

      // 4. Create mini preview canvas
      if (previewContainer) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 150;
        this.canvas.height = 112;
        this.canvas.className = 'face-preview-canvas';
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        previewContainer.innerHTML = '';
        previewContainer.appendChild(this.canvas);
      }

      this.isRunning = true;
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

    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
      this.analyser = null;
      this.audioData = null;
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
      let rawBodyX = 0;
      let rawBodyY = 0;

      // 1. Audio Volume Analysis for Talking Mouth / Lip-Sync
      if (this.analyser && this.audioData) {
        this.analyser.getByteFrequencyData(this.audioData);
        let sum = 0;
        for (let i = 0; i < this.audioData.length; i++) {
          sum += this.audioData[i];
        }
        const avg = sum / this.audioData.length;
        const targetMouth = Math.min(1.0, Math.max(0, (avg - 10) / 40));
        this.mouthLevel += (targetMouth - this.mouthLevel) * 0.6;
      } else {
        this.mouthLevel = 0;
      }

      // 2. Method A: Native FaceDetector API (Chrome / Edge / Android)
      if (this.detector) {
        try {
          const faces = await this.detector.detect(this.video);
          if (faces && faces.length > 0) {
            const box = faces[0].boundingBox;
            const videoW = this.video.videoWidth || 320;
            const videoH = this.video.videoHeight || 240;

            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;

            // Normalized mirrored head offset (Exaggerated for bold visual motion)
            const normX = -((centerX - videoW / 2) / (videoW / 2));
            const normY = ((centerY - videoH / 2) / (videoH / 2));

            rawBodyX = normX * 52;
            rawBodyY = normY * 38;
            rawOffsetX = normX * 46;
            rawOffsetY = normY * 32;

            // Landmarks (eyes) for exact roll angle calculation
            const eyes = faces[0].landmarks?.filter(l => l.type === 'eye') || [];
            if (eyes.length >= 2) {
              const dx = eyes[1].locations[0].x - eyes[0].locations[0].x;
              const dy = eyes[1].locations[0].y - eyes[0].locations[0].y;
              rawRoll = -Math.atan2(dy, dx) * 2.4; // Exaggerated roll response
            } else {
              rawRoll = normX * 0.7;
            }
            faceDetected = true;
          }
        } catch (e) {
          // Fallback to optical tracker
        }
      }

      // 3. Method B: High Sensitivity Optical Motion & Luminance Tracking Fallback
      if (!faceDetected) {
        const tracking = this.computeOpticalTracking();
        rawBodyX = tracking.bodyX;
        rawBodyY = tracking.bodyY;
        rawOffsetX = tracking.offsetX;
        rawOffsetY = tracking.offsetY;
        rawRoll = tracking.roll;
      }

      // Fast, near-instantaneous smoothing (0.65 lerp for 60 FPS zero-lag response)
      this.smoothRoll += (rawRoll - this.smoothRoll) * 0.65;
      this.smoothBodyX += (rawBodyX - this.smoothBodyX) * 0.65;
      this.smoothBodyY += (rawBodyY - this.smoothBodyY) * 0.65;
      this.smoothOffsetX += (rawOffsetX - this.smoothOffsetX) * 0.65;
      this.smoothOffsetY += (rawOffsetY - this.smoothOffsetY) * 0.65;

      // Apply bold parameters directly to KuroBlob avatar
      if (this.avatar) {
        this.avatar.setFaceTracking(true, {
          roll: Math.max(-0.75, Math.min(0.75, this.smoothRoll)),
          bodyX: Math.max(-55, Math.min(55, this.smoothBodyX)),
          bodyY: Math.max(-40, Math.min(40, this.smoothBodyY)),
          offsetX: Math.max(-48, Math.min(48, this.smoothOffsetX)),
          offsetY: Math.max(-35, Math.min(35, this.smoothOffsetY)),
          mouthOpen: this.mouthLevel
        });
      }

      // Render mini PiP canvas preview with head tracking HUD
      this.renderPreview(rawBodyX, rawBodyY, this.smoothRoll, this.mouthLevel);
    }

    this.animId = requestAnimationFrame(() => this.trackLoop());
  }

  computeOpticalTracking() {
    if (!this.ctx || !this.video || !this.canvas) return { bodyX: 0, bodyY: 0, offsetX: 0, offsetY: 0, roll: 0 };

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

    let topSumX = 0, topWeight = 0;
    let btmSumX = 0, btmWeight = 0;

    let leftLuma = 0;
    let rightLuma = 0;
    let leftCount = 0;
    let rightCount = 0;

    for (let y = 6; y < ch - 6; y += 3) {
      for (let x = 6; x < cw - 6; x += 3) {
        const idx = (y * cw + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const luma = (r * 0.299 + g * 0.587 + b * 0.114);

        const distFromCenter = Math.hypot((x - cw / 2) / (cw / 2), (y - ch / 2) / (ch / 2));
        const centerWeight = Math.max(0.3, 1.5 - distFromCenter * 0.8);

        // Prominent face and movement heuristic
        const isWarm = (r > g && g > b && r > 35);
        const isBright = luma > 65;

        if (isWarm || isBright) {
          const weight = (isWarm ? 2.5 : 1.0) * centerWeight;
          sumX += x * weight;
          sumY += y * weight;
          weightSum += weight;

          // Upper vs Lower face distribution for head tilt (Roll)
          if (y < ch / 2) {
            topSumX += x * weight;
            topWeight += weight;
          } else {
            btmSumX += x * weight;
            btmWeight += weight;
          }
        }

        if (x < cw / 2) {
          leftLuma += luma;
          leftCount++;
        } else {
          rightLuma += luma;
          rightCount++;
        }
      }
    }

    if (weightSum > 8) {
      const avgX = sumX / weightSum;
      const avgY = sumY / weightSum;

      if (this.baselineX === null) {
        this.baselineX = avgX;
        this.baselineY = avgY;
      } else {
        // Slow adaptive baseline drift
        this.baselineX += (avgX - this.baselineX) * 0.005;
        this.baselineY += (avgY - this.baselineY) * 0.005;
      }

      const diffX = (avgX - this.baselineX) / (cw * 0.22);
      const diffY = (avgY - this.baselineY) / (ch * 0.22);

      // Body & Eye Offsets
      const bodyX = Math.max(-55, Math.min(55, diffX * 52));
      const bodyY = Math.max(-40, Math.min(40, diffY * 38));
      const offsetX = Math.max(-48, Math.min(48, diffX * 46));
      const offsetY = Math.max(-35, Math.min(35, diffY * 32));

      // Roll computation from top-bottom centroid tilt + horizontal displacement
      let tiltDiff = 0;
      if (topWeight > 3 && btmWeight > 3) {
        const topX = topSumX / topWeight;
        const btmX = btmSumX / btmWeight;
        tiltDiff = -(topX - btmX) / (cw * 0.15);
      }

      const lumaDiff = (leftCount && rightCount) ? ((rightLuma / rightCount) - (leftLuma / leftCount)) / 70 : 0;
      const roll = Math.max(-0.75, Math.min(0.75, (tiltDiff * 0.6) + (diffX * 0.4) + (lumaDiff * 0.25)));

      return { bodyX, bodyY, offsetX, offsetY, roll };
    }

    return { bodyX: 0, bodyY: 0, offsetX: 0, offsetY: 0, roll: 0 };
  }

  renderPreview(bodyX, bodyY, roll, mouthLevel) {
    if (!this.ctx || !this.canvas) return;

    const cw = this.canvas.width;
    const ch = this.canvas.height;

    // Overlay tracking crosshair & roll HUD
    this.ctx.save();
    this.ctx.strokeStyle = '#00F2FE';
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = 'rgba(0, 242, 254, 0.8)';
    this.ctx.shadowBlur = 8;

    const cx = cw / 2 + (bodyX / 55) * (cw * 0.35);
    const cy = ch / 2 + (bodyY / 40) * (ch * 0.35);

    // Target circle
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    this.ctx.stroke();

    // Roll indicator angle needle
    this.ctx.strokeStyle = '#FF3B30';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(cx - Math.cos(roll) * 30, cy - Math.sin(roll) * 30);
    this.ctx.lineTo(cx + Math.cos(roll) * 30, cy + Math.sin(roll) * 30);
    this.ctx.stroke();

    // Eye Target indicators
    this.ctx.fillStyle = '#00F2FE';
    this.ctx.beginPath();
    this.ctx.arc(cx - 8, cy - 4, 3, 0, Math.PI * 2);
    this.ctx.arc(cx + 8, cy - 4, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Mic Voice VU Meter bar
    if (mouthLevel > 0.05) {
      this.ctx.fillStyle = '#34C759';
      this.ctx.fillRect(8, ch - 10, Math.min(cw - 16, mouthLevel * (cw - 16)), 4);
    }

    // Status text
    this.ctx.font = 'bold 10px Outfit, sans-serif';
    this.ctx.fillStyle = '#00F2FE';
    this.ctx.fillText(`VTuber: 60 FPS Sync`, 6, 14);

    this.ctx.restore();
  }
}
