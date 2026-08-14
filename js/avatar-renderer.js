import { soundFx } from './sound-fx.js';

export class AvatarRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Target & Current Emotion States
    this.currentEmotion = 'IDLE';
    this.targetEmotion = 'IDLE';
    this.transitionProgress = 1; // 0 to 1
    
    // Dimensions & DPR
    this.width = 400;
    this.height = 400;
    this.dpr = window.devicePixelRatio || 1;
    
    // Core Avatar Blob Properties
    this.baseRadius = 90;
    this.x = 200;
    this.y = 200;
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotation = 0; // Body tilt angle
    
    // Blob Control Points (12 vertices for smooth bezier morphing)
    this.numPoints = 12;
    this.controlPoints = [];
    this.targetRadii = new Float32Array(this.numPoints);
    this.currentRadii = new Float32Array(this.numPoints);
    this.velocities = new Float32Array(this.numPoints);
    
    // Eye Properties
    this.eyeOffset = { x: 0, y: 0 };
    this.targetEyeOffset = { x: 0, y: 0 };
    this.eyeWidth = 16;
    this.eyeHeight = 38;
    this.eyeSpacing = 28;
    this.eyeTilt = 0; // Angle per eye
    this.blinkProgress = 0; // 0 = open, 1 = closed
    this.isBlinking = false;
    this.nextBlinkTime = Date.now() + 3000;
    
    // Web VTuber Face Tracking State (Bolder live reactive physics)
    this.faceTracking = {
      active: false,
      roll: 0,
      offsetX: 0,
      offsetY: 0,
      bodyX: 0,
      bodyY: 0,
      mouthOpen: 0,
      smoothRoll: 0,
      smoothBodyX: 0,
      smoothBodyY: 0,
      smoothMouth: 0
    };
    
    // 3D Orbital Rings (for THINKING state - frames 19-22 in video)
    this.orbitalRings = [
      { radius: 130, tiltX: 0.8, tiltY: 0.3, rotZ: 0.2, speed: 0.025, color1: '#FF3B30', color2: '#FF9500', width: 6, angle: 0 },
      { radius: 145, tiltX: -0.6, tiltY: 0.7, rotZ: -0.4, speed: -0.03, color1: '#34C759', color2: '#30B0C7', width: 5, angle: 1 },
      { radius: 160, tiltX: 0.4, tiltY: -0.8, rotZ: 0.6, speed: 0.02, color1: '#AF52DE', color2: '#5856D6', width: 7, angle: 2 },
      { radius: 135, tiltX: -0.9, tiltY: -0.2, rotZ: -0.8, speed: -0.035, color1: '#FF2D55', color2: '#FFCC00', width: 5.5, angle: 3 }
    ];
    this.ringVisibility = 0; // 0 = invisible, 1 = fully visible
    
    // Writing/Generating Particle System (frames 23-25)
    this.particles = [];
    this.maxParticles = 24;
    this.particleVisibility = 0;
    
    // Interactive Customizations
    this.theme = 'light'; // 'light' or 'dark'
    this.blobColor = '#0A0A0A';
    this.eyeColor = '#FFFFFF';
    this.orbitSpeedMultiplier = 1.0;
    this.springStiffness = 0.12;
    this.damping = 0.82;

    // Avatar Studio Creator Mode Properties
    this.studioMode = false;
    this.customConfig = {
      shape: 'BLOB',
      eyeStyle: 'PILL',
      eyeWidth: 16,
      eyeHeight: 38,
      eyeSpacing: 28,
      eyeTilt: 0,
      eyeRotation: 0,
      eyePosX: 0,
      eyePosY: 0,
      headAccessory: 'NONE',
      auraAccessory: 'NONE',
      showCheeks: false,
      showRings: false,
      showParticles: false,
      scaleX: 1,
      scaleY: 1,
      rotation: 0
    };
    
    // Mouse Gaze Tracking
    this.mouse = { x: 200, y: 200, isOver: false };
    
    // Time & Animation
    this.time = 0;
    this.animId = null;
    
    this.init();
  }

  init() {
    this.resize();
    this.initControlPoints();
    this.initParticles();
    this.bindEvents();
    this.startLoop();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 400;
    this.height = rect.height || 400;
    this.dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    
    this.x = this.width / 2;
    this.y = this.height / 2;
    this.baseRadius = Math.min(this.width, this.height) * 0.22;
  }

  initControlPoints() {
    for (let i = 0; i < this.numPoints; i++) {
      this.currentRadii[i] = this.baseRadius;
      this.targetRadii[i] = this.baseRadius;
      this.velocities[i] = 0;
    }
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: this.baseRadius * (1.2 + Math.random() * 0.8),
        size: 3 + Math.random() * 4,
        speed: 0.01 + Math.random() * 0.03,
        alpha: Math.random(),
        yOffset: (Math.random() - 0.5) * 30
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    
    this.isDragging = false;
    this.dragTarget = null; // 'EYES' | 'BODY'
    this.dragStartPos = { x: 0, y: 0 };
    this.dragStartTime = 0;
    this.dragVertexAngle = 0;
    this.onEyePositionChange = null;

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : e.clientX);
      const clientY = e.touches && e.touches[0] ? e.touches[0].clientY : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : e.clientY);
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const isNearEyes = (pos) => {
      const eyeX = this.x + (this.studioMode ? this.customConfig.eyePosX : 0) + this.eyeOffset.x;
      const eyeY = this.y + (this.studioMode ? this.customConfig.eyePosY : 0) + this.eyeOffset.y - 12;
      return Math.hypot(pos.x - eyeX, pos.y - eyeY) < 38;
    };

    const handlePointerDown = (e) => {
      const pos = getPos(e);
      this.mouse.x = pos.x;
      this.mouse.y = pos.y;
      this.mouse.isOver = true;
      this.isDragging = true;
      this.dragStartPos = { ...pos };
      this.dragStartTime = Date.now();

      if (isNearEyes(pos)) {
        this.dragTarget = 'EYES';
        this.canvas.style.cursor = 'grabbing';
      } else {
        const dx = pos.x - this.x;
        const dy = pos.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= this.baseRadius * 1.6) {
          this.dragTarget = 'BODY';
          this.dragVertexAngle = Math.atan2(dy, dx);
          this.canvas.style.cursor = 'grabbing';
        } else {
          this.dragTarget = null;
        }
      }
    };

    const handlePointerMove = (e) => {
      const pos = getPos(e);
      this.mouse.x = pos.x;
      this.mouse.y = pos.y;
      this.mouse.isOver = true;

      if (!this.isDragging) {
        if (isNearEyes(pos)) {
          this.canvas.style.cursor = 'move';
        } else if (Math.hypot(pos.x - this.x, pos.y - this.y) <= this.baseRadius * 1.3) {
          this.canvas.style.cursor = 'grab';
        } else {
          this.canvas.style.cursor = 'default';
        }
        return;
      }

      if (this.dragTarget === 'EYES') {
        const rawX = pos.x - this.x;
        const rawY = pos.y - this.y + 12;
        const clampedX = Math.max(-45, Math.min(45, Math.round(rawX)));
        const clampedY = Math.max(-45, Math.min(45, Math.round(rawY)));
        this.customConfig.eyePosX = clampedX;
        this.customConfig.eyePosY = clampedY;
        if (this.onEyePositionChange) {
          this.onEyePositionChange(clampedX, clampedY);
        }
      } else if (this.dragTarget === 'BODY') {
        const dx = pos.x - this.x;
        const dy = pos.y - this.y;
        const pullDist = Math.hypot(dx, dy);
        const pullAngle = Math.atan2(dy, dx);

        for (let i = 0; i < this.numPoints; i++) {
          const ptAngle = (i / this.numPoints) * Math.PI * 2;
          let diff = Math.abs(ptAngle - pullAngle);
          while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);

          if (diff < Math.PI * 0.45) {
            const weight = Math.cos((diff / (Math.PI * 0.45)) * (Math.PI / 2));
            const targetR = Math.max(this.baseRadius * 0.5, Math.min(this.baseRadius * 2.5, pullDist));
            this.currentRadii[i] = this.currentRadii[i] * (1 - weight * 0.6) + targetR * (weight * 0.6);
          }
        }
      }
    };

    const handlePointerUp = (e) => {
      if (!this.isDragging) return;
      const duration = Date.now() - this.dragStartTime;
      const pos = getPos(e);
      const moved = Math.hypot(pos.x - this.dragStartPos.x, pos.y - this.dragStartPos.y);

      if (this.dragTarget === 'BODY') {
        if (duration < 280 && moved < 10) {
          // Poke tap!
          this.applyImpulse(35);
          this.triggerBlink();
          soundFx.poke();
        } else {
          // Stretch release!
          let maxOffset = 0;
          for (let i = 0; i < this.numPoints; i++) {
            const diff = this.currentRadii[i] - this.targetRadii[i];
            if (Math.abs(diff) > Math.abs(maxOffset)) maxOffset = diff;
            this.velocities[i] -= diff * 0.4;
          }
          const intensity = Math.min(2.0, Math.max(0.6, Math.abs(maxOffset) / 35));
          soundFx.boing(intensity);

          // Physical Pinch Overload Tracking
          const now = Date.now();
          if (!this.stretchHistory) this.stretchHistory = [];
          this.stretchHistory.push({ time: now, dist: moved });
          this.stretchHistory = this.stretchHistory.filter(h => now - h.time < 3000);
          const totalRecent = this.stretchHistory.reduce((sum, h) => sum + h.dist, 0);

          if (moved > 160 || totalRecent > 350) {
            this.stretchHistory = [];
            if (this.onPhysicalOverload) {
              this.onPhysicalOverload();
            }
          }
        }
      } else if (this.dragTarget === 'EYES') {
        soundFx.pop(750, 0.08);
      }

      this.isDragging = false;
      this.dragTarget = null;
      this.canvas.style.cursor = isNearEyes(pos) ? 'move' : 'grab';
    };

    // Mouse listeners
    this.canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('mouseleave', () => {
      if (!this.isDragging) {
        this.mouse.isOver = false;
        this.targetEyeOffset.x = 0;
        this.targetEyeOffset.y = 0;
      }
    });

    // Touch listeners (mobile tactile support)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handlePointerDown(e);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging) {
        e.preventDefault();
        handlePointerMove(e);
      }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      if (this.isDragging) {
        handlePointerUp(e);
      }
    });
  }

  triggerBlink() {
    this.isBlinking = true;
    this.blinkProgress = 0;
    soundFx.blink();
  }

  applyImpulse(amount) {
    for (let i = 0; i < this.numPoints; i++) {
      this.velocities[i] += (Math.random() - 0.5) * amount;
    }
  }

  setGreenScreen(active) {
    this.greenScreen = !!active;
  }

  setStudioMode(enabled, config = {}) {
    this.studioMode = enabled;
    if (config) {
      this.customConfig = { ...this.customConfig, ...config };
    }
  }

  setFaceTracking(active, config = {}) {
    this.faceTracking.active = active;
    if (config) {
      if (config.roll !== undefined) this.faceTracking.roll = config.roll;
      if (config.offsetX !== undefined) this.faceTracking.offsetX = config.offsetX;
      if (config.offsetY !== undefined) this.faceTracking.offsetY = config.offsetY;
      if (config.bodyX !== undefined) this.faceTracking.bodyX = config.bodyX;
      if (config.bodyY !== undefined) this.faceTracking.bodyY = config.bodyY;
      if (config.mouthOpen !== undefined) this.faceTracking.mouthOpen = config.mouthOpen;
    }
  }

  updateStudioConfig(newConfig) {
    this.studioMode = true;
    this.customConfig = { ...this.customConfig, ...newConfig };
  }

  registerCustomPreset(id, config) {
    if (!this.customPresets) this.customPresets = {};
    this.customPresets[id] = { ...config };
  }

  applyGeneratedExpression(exp) {
    if (!exp) return;
    this.studioMode = true;
    if (exp.body) {
      if (exp.body.colorStart) this.customConfig.bodyColor1 = exp.body.colorStart;
      if (exp.body.colorEnd) this.customConfig.bodyColor2 = exp.body.colorEnd;
      if (exp.body.glowColor) this.customConfig.glowColor = exp.body.glowColor;
      if (exp.body.glowBlur) this.customConfig.glowBlur = exp.body.glowBlur;
    }
    if (exp.eyes) {
      if (exp.eyes.style) this.customConfig.eyeStyle = exp.eyes.style;
      if (exp.eyes.color) this.eyeColor = exp.eyes.color;
      if (exp.eyes.width) this.customConfig.eyeWidth = exp.eyes.width;
      if (exp.eyes.height) this.customConfig.eyeHeight = exp.eyes.height;
      if (exp.eyes.spacing) this.customConfig.eyeSpacing = exp.eyes.spacing;
      if (exp.eyes.tilt !== undefined) this.customConfig.eyeTilt = (exp.eyes.tilt * 180) / Math.PI;
    }
    if (exp.rings) {
      this.customConfig.showRings = !!exp.rings.enabled;
    }
    if (exp.particles) {
      this.customConfig.showParticles = !!exp.particles.enabled;
    }
    if (typeof exp.drawAccessory === 'function') {
      this.customDrawAccessory = exp.drawAccessory;
    } else {
      this.customDrawAccessory = null;
    }
    this.triggerBlink();
  }

  setEmotion(emotion) {
    if (this.customPresets && this.customPresets[emotion]) {
      this.setStudioMode(true, this.customPresets[emotion]);
      this.targetEmotion = emotion;
      soundFx.emotionReaction(emotion);
      return;
    }

    if (this.studioMode) {
      this.customConfig.shape = emotion;
    }

    if (this.currentEmotion === emotion && this.targetEmotion === emotion) return;
    this.targetEmotion = emotion;
    this.transitionProgress = 0;
    soundFx.emotionReaction(emotion);
  }

  setTheme(theme) {
    this.theme = theme;
    if (theme === 'dark') {
      this.blobColor = '#F2F2F7';
      this.eyeColor = '#0A0A0A';
    } else {
      this.blobColor = '#0A0A0A';
      this.eyeColor = '#FFFFFF';
    }
  }

  update() {
    this.time += 0.016;

    // Handle emotion state switching & parameters calculation
    this.updateEmotionState();
    
    // Physics simulation for control points (Spring dynamics)
    this.updateBlobPhysics();
    
    // Gaze tracking
    this.updateGazeTracking();
    
    // Blink timer
    this.updateBlinking();
    
    // Orbital rings update
    this.updateRings();
    
    // Particles update
    this.updateParticles();
  }

  updateEmotionState() {
    // Target parameters per emotion
    let targetScaleX = 1;
    let targetScaleY = 1;
    let targetRotation = 0;
    let targetEyeWidth = 16;
    let targetEyeHeight = 38;
    let targetEyeTilt = 0;
    let targetRingVis = 0;
    let targetParticleVis = 0;

    const t = this.time;

    switch (this.targetEmotion) {
      case 'IDLE':
        // Breathing pulse & floating
        targetScaleX = 1 + Math.sin(t * 1.5) * 0.03;
        targetScaleY = 1 - Math.sin(t * 1.5) * 0.03;
        targetRotation = Math.sin(t * 0.8) * 0.03;
        break;

      case 'THINKING':
        // Morph to rounded triangle (Video frames 19-21)
        // 3D Orbital rings spin actively
        targetRingVis = 1;
        targetRotation = Math.sin(t * 1.2) * 0.08 - 0.1;
        targetEyeWidth = 14;
        targetEyeHeight = 32;
        targetEyeTilt = -0.15; // Curious slant
        targetScaleX = 0.96 + Math.sin(t * 2) * 0.04;
        targetScaleY = 1.04 - Math.sin(t * 2) * 0.04;
        break;

      case 'WRITING':
        // Pulsing sphere with orbiting stream particles (Video frames 23-25)
        targetParticleVis = 1;
        targetRingVis = 0.4;
        targetScaleX = 0.92 + Math.sin(t * 8) * 0.05; // Fast rhythmic pulse
        targetScaleY = 1.08 - Math.sin(t * 8) * 0.05;
        targetEyeWidth = 14;
        targetEyeHeight = 26;
        targetEyeTilt = 0.1;
        break;

      case 'ANGRY':
        // Flattened squish, sharp stern eyes tilted inward > <
        targetScaleX = 1.28 + Math.sin(t * 10) * 0.04; // Aggressive vibration
        targetScaleY = 0.72 - Math.sin(t * 10) * 0.04;
        targetRotation = Math.sin(t * 6) * 0.05;
        targetEyeWidth = 20;
        targetEyeHeight = 24;
        targetEyeTilt = 0.35; // Sharp inward slant \ /
        break;

      case 'HAPPY':
        // High bouncy spring motion, crescent eyes ^ ^
        targetScaleX = 1 + Math.sin(t * 4) * 0.12;
        targetScaleY = 1 - Math.sin(t * 4) * 0.12;
        targetRotation = Math.sin(t * 2) * 0.1;
        targetEyeWidth = 22;
        targetEyeHeight = 30;
        targetEyeTilt = 0;
        break;

      case 'SURPRISED':
        // Vertical egg shape stretch (Video frame 17), wide open eyes O o
        targetScaleX = 0.78 + Math.sin(t * 3) * 0.03;
        targetScaleY = 1.25 - Math.sin(t * 3) * 0.03;
        targetEyeWidth = 24;
        targetEyeHeight = 44;
        targetRotation = (Math.random() - 0.5) * 0.04;
        break;

      case 'CONFUSED':
        // Asymmetric tilt, uneven eye tilt
        targetRotation = 0.28 + Math.sin(t * 1.5) * 0.05;
        targetScaleX = 1.08;
        targetScaleY = 0.92;
        targetEyeWidth = 16;
        targetEyeHeight = 30;
        targetEyeTilt = -0.25;
        break;

      case 'SLEEPING':
        // Low flat puddle, slow breath
        targetScaleX = 1.35 + Math.sin(t * 0.8) * 0.04;
        targetScaleY = 0.65 - Math.sin(t * 0.8) * 0.04;
        targetEyeWidth = 22;
        targetEyeHeight = 6;
        targetEyeTilt = 0;
        break;

      case 'LOVE':
        // Heartbeat pulse with blush aura
        targetScaleX = 1 + Math.sin(t * 6) * 0.06;
        targetScaleY = 1 - Math.sin(t * 6) * 0.06;
        targetEyeWidth = 22;
        targetEyeHeight = 16;
        targetEyeTilt = 0.15;
        break;

      case 'LAUGHING':
        // Fast spring wiggle & horizontal wide eyes
        targetScaleX = 1.1 + Math.sin(t * 12) * 0.08;
        targetScaleY = 0.9 - Math.sin(t * 12) * 0.08;
        targetRotation = Math.sin(t * 10) * 0.08;
        targetEyeWidth = 26;
        targetEyeHeight = 12;
        break;

      case 'SAD':
        // Drooping body, downward eyes
        targetScaleX = 0.92;
        targetScaleY = 1.12;
        targetRotation = -0.05 + Math.sin(t * 1.5) * 0.02;
        targetEyeWidth = 14;
        targetEyeHeight = 28;
        break;

      case 'SHOCKED':
        // Tremble vibration & tiny wide open eyes
        targetScaleX = 0.88 + (Math.random() - 0.5) * 0.04;
        targetScaleY = 1.18 + (Math.random() - 0.5) * 0.04;
        targetEyeWidth = 12;
        targetEyeHeight = 48;
        break;

      case 'SMUG':
        // Proud chin lift & smirk tilt
        targetRotation = -0.22;
        targetScaleX = 1.05;
        targetScaleY = 0.95;
        targetEyeWidth = 18;
        targetEyeHeight = 22;
        break;

      case 'FOCUSED':
        // Condensed focused gaze with particles
        targetParticleVis = 0.6;
        targetScaleX = 0.96 + Math.sin(t * 3) * 0.02;
        targetScaleY = 1.04 - Math.sin(t * 3) * 0.02;
        targetEyeWidth = 12;
        targetEyeHeight = 36;
        break;

      case 'DIZZY':
        // Wavy shape oscillation & alternating eyes
        targetRotation = Math.sin(t * 4) * 0.2;
        targetScaleX = 1 + Math.sin(t * 5) * 0.08;
        targetScaleY = 1 - Math.sin(t * 5) * 0.08;
        targetEyeWidth = 16;
        targetEyeHeight = 24;
        break;

      case 'SHY':
        // Timid blushing look
        targetScaleX = 0.94;
        targetScaleY = 1.04;
        targetRotation = 0.1;
        targetEyeWidth = 14;
        targetEyeHeight = 22;
        targetEyeTilt = 0.1;
        break;

      case 'EVIL':
        // Scheming evil tilt & sharp gaze
        targetRotation = -0.15;
        targetScaleX = 1.12;
        targetScaleY = 0.88;
        targetEyeWidth = 22;
        targetEyeHeight = 18;
        break;

      case 'HYPED':
        // Ultra energized bounce & 3D rings
        targetRingVis = 1;
        targetScaleX = 1 + Math.sin(t * 8) * 0.14;
        targetScaleY = 1 - Math.sin(t * 8) * 0.14;
        targetEyeWidth = 26;
        targetEyeHeight = 44;
        break;

      case 'BORED':
        // Flat puddle, eyes looking up
        targetScaleX = 1.25;
        targetScaleY = 0.75;
        targetEyeWidth = 20;
        targetEyeHeight = 12;
        break;

      case 'WINK':
        // Playful wink
        targetRotation = 0.12;
        targetScaleX = 1.05;
        targetScaleY = 0.95;
        targetEyeWidth = 20;
        targetEyeHeight = 36;
        break;

      case 'COOL':
        // Sleek visor look
        targetRotation = -0.08;
        targetScaleX = 1.1;
        targetScaleY = 0.9;
        targetEyeWidth = 28;
        targetEyeHeight = 16;
        break;

      case 'NERVOUS':
        // High frequency tremble & small eyes
        targetScaleX = 0.92 + (Math.random() - 0.5) * 0.03;
        targetScaleY = 1.08 + (Math.random() - 0.5) * 0.03;
        targetEyeWidth = 12;
        targetEyeHeight = 24;
        break;

      case 'PARTY':
        // Confetti party bounce
        targetParticleVis = 1;
        targetScaleX = 1 + Math.sin(t * 10) * 0.15;
        targetScaleY = 1 - Math.sin(t * 10) * 0.15;
        targetEyeWidth = 24;
        targetEyeHeight = 32;
        break;

      case 'DISGUSTED':
        // Squish away to the left
        targetRotation = 0.25;
        targetScaleX = 0.85;
        targetScaleY = 1.15;
        targetEyeWidth = 16;
        targetEyeHeight = 16;
        break;

      case 'ROBOT':
        // Rigid squircle shape
        targetScaleX = 1 + Math.sin(t * 2) * 0.02;
        targetScaleY = 1 - Math.sin(t * 2) * 0.02;
        targetEyeWidth = 18;
        targetEyeHeight = 36;
        break;

      case 'BOBA':
        // Giant kawaii Boba eyes
        targetScaleX = 1.05;
        targetScaleY = 0.95;
        targetEyeWidth = 32;
        targetEyeHeight = 52;
        break;

      case 'CAT':
        // Neko cat ear morphing
        targetRotation = Math.sin(t * 3) * 0.06;
        targetEyeWidth = 20;
        targetEyeHeight = 22;
        targetEyeTilt = 0.15;
        break;

      case 'GHOST':
        // Wavy ghost floating
        targetScaleX = 0.9 + Math.sin(t * 2) * 0.05;
        targetScaleY = 1.1 - Math.sin(t * 2) * 0.05;
        targetRotation = Math.sin(t * 1.5) * 0.1;
        targetEyeWidth = 18;
        targetEyeHeight = 34;
        break;

      case 'RABBIT':
        // Bunny ears & rapid hop
        targetScaleX = 0.92 + Math.sin(t * 6) * 0.08;
        targetScaleY = 1.08 - Math.sin(t * 6) * 0.08;
        targetEyeWidth = 16;
        targetEyeHeight = 28;
        break;

      case 'ANGEL':
        // Floating holy halo
        targetScaleX = 1 + Math.sin(t * 1.2) * 0.03;
        targetScaleY = 1 - Math.sin(t * 1.2) * 0.03;
        targetEyeWidth = 18;
        targetEyeHeight = 32;
        break;

      case 'DEVIL':
        // Cute red horns
        targetScaleX = 1.08;
        targetScaleY = 0.92;
        targetEyeWidth = 22;
        targetEyeHeight = 20;
        targetEyeTilt = 0.25;
        break;

      case 'BOUNCY':
        // Extreme jelly spring squish
        targetScaleX = 1.25 + Math.sin(t * 8) * 0.25;
        targetScaleY = 0.75 - Math.sin(t * 8) * 0.25;
        targetEyeWidth = 24;
        targetEyeHeight = 24;
        break;

      case 'YAWN':
        // Sleepy mouth yawn & tears
        targetScaleX = 0.9;
        targetScaleY = 1.15;
        targetEyeWidth = 20;
        targetEyeHeight = 8;
        break;

      case 'PUFF':
        // Pouty puffed cheeks
        targetScaleX = 1.32;
        targetScaleY = 0.82;
        targetEyeWidth = 18;
        targetEyeHeight = 16;
        targetEyeTilt = 0.15;
        break;

      case 'STAR':
        // Sparkle star orbit
        targetParticleVis = 1;
        targetScaleX = 1 + Math.sin(t * 4) * 0.06;
        targetScaleY = 1 - Math.sin(t * 4) * 0.06;
        targetEyeWidth = 24;
        targetEyeHeight = 40;
        break;

      case 'PIRATE':
        // Eyepatch look
        targetRotation = -0.1;
        targetEyeWidth = 20;
        targetEyeHeight = 36;
        break;

      case 'SUPERHERO':
        // Heroic posture & cape
        targetScaleX = 1.12;
        targetScaleY = 0.94;
        targetRotation = -0.15;
        targetEyeWidth = 22;
        targetEyeHeight = 24;
        break;

      case 'PANDA':
        // Panda eyes
        targetScaleX = 1.06;
        targetScaleY = 0.94;
        targetEyeWidth = 20;
        targetEyeHeight = 32;
        break;

      case 'MUSIC':
        // Rhythmic dancing bob
        targetRotation = Math.sin(t * 6) * 0.15;
        targetScaleX = 1 + Math.sin(t * 6) * 0.08;
        targetScaleY = 1 - Math.sin(t * 6) * 0.08;
        targetEyeWidth = 18;
        targetEyeHeight = 30;
        break;

      case 'FOODIE':
        // Yummy licking gaze
        targetScaleX = 1.05;
        targetScaleY = 0.95;
        targetRotation = 0.12;
        targetEyeWidth = 20;
        targetEyeHeight = 20;
        break;

      case 'SNOW':
        // Shivering freeze
        targetScaleX = 0.9 + (Math.random() - 0.5) * 0.04;
        targetScaleY = 1.1 + (Math.random() - 0.5) * 0.04;
        targetEyeWidth = 14;
        targetEyeHeight = 28;
        break;

      case 'FIRE':
        // Flaming passion
        targetScaleX = 0.88 + Math.sin(t * 10) * 0.06;
        targetScaleY = 1.16 - Math.sin(t * 10) * 0.06;
        targetEyeWidth = 20;
        targetEyeHeight = 38;
        break;

      case 'ALIEN':
        // UFO antenna
        targetRotation = Math.sin(t * 2) * 0.08;
        targetEyeWidth = 26;
        targetEyeHeight = 44;
        break;

      case 'MAGIC':
        // Magic star particles
        targetRingVis = 0.8;
        targetParticleVis = 1;
        targetEyeWidth = 20;
        targetEyeHeight = 34;
        break;

      case 'NINJA':
        // Stealth ninja
        targetRotation = -0.1;
        targetScaleX = 1.15;
        targetScaleY = 0.85;
        targetEyeWidth = 24;
        targetEyeHeight = 12;
        break;

      case 'MARSHMALLOW':
        // Soft cloud puff
        targetScaleX = 1.1 + Math.sin(t * 2) * 0.05;
        targetScaleY = 0.9 - Math.sin(t * 2) * 0.05;
        targetEyeWidth = 16;
        targetEyeHeight = 26;
        break;

      case 'PIXEL':
        // Retro pixel pulse
        targetScaleX = 1 + Math.floor(Math.sin(t * 4) * 2) * 0.05;
        targetScaleY = 1 - Math.floor(Math.sin(t * 4) * 2) * 0.05;
        targetEyeWidth = 20;
        targetEyeHeight = 32;
        break;

      case 'COSMIC':
        // Galaxy orbit
        targetRingVis = 1;
        targetParticleVis = 1;
        targetEyeWidth = 22;
        targetEyeHeight = 38;
        break;

      case 'ZEN':
        // Slow float meditation
        targetScaleX = 1 + Math.sin(t * 0.6) * 0.02;
        targetScaleY = 1 - Math.sin(t * 0.6) * 0.02;
        targetEyeWidth = 20;
        targetEyeHeight = 6;
        break;

      case 'CELEBRITY':
        // Idol sparkle sunglasses
        targetScaleX = 1.08;
        targetScaleY = 0.92;
        targetRotation = -0.1;
        targetEyeWidth = 30;
        targetEyeHeight = 18;
        break;

      /* --- Weather Forecast Suite (10 Procedural Weather Emotions) --- */
      case 'SUNNY':
        // Bright radiant bounce with cool sunglasses tilt
        targetScaleX = 1.06 + Math.sin(t * 3) * 0.04;
        targetScaleY = 0.94 - Math.sin(t * 3) * 0.04;
        targetEyeWidth = 28;
        targetEyeHeight = 14;
        targetEyeTilt = -0.1;
        break;

      case 'RAIN':
        // Rain cloud bob with falling raindrops
        targetScaleX = 1.1;
        targetScaleY = 0.9;
        targetEyeWidth = 18;
        targetEyeHeight = 28;
        break;

      case 'THUNDER':
        // Jagged storm tremble & lightning flash
        targetScaleX = 0.88 + (Math.random() - 0.5) * 0.06;
        targetScaleY = 1.12 + (Math.random() - 0.5) * 0.06;
        targetEyeWidth = 14;
        targetEyeHeight = 38;
        break;

      case 'SNOWY':
        // Soft snow cloud & float
        targetScaleX = 1.05 + Math.sin(t * 2) * 0.04;
        targetScaleY = 0.95 - Math.sin(t * 2) * 0.04;
        targetEyeWidth = 18;
        targetEyeHeight = 24;
        break;

      case 'WINDY':
        // Slanted gust tilt & wide blown gaze
        targetRotation = -0.22 + Math.sin(t * 6) * 0.08;
        targetScaleX = 1.18;
        targetScaleY = 0.82;
        targetEyeWidth = 24;
        targetEyeHeight = 12;
        break;

      case 'FOGGY':
        // Flat hazy puddle
        targetScaleX = 1.3;
        targetScaleY = 0.7;
        targetEyeWidth = 22;
        targetEyeHeight = 8;
        break;

      case 'RAINBOW':
        // Happy spring arc & 7-color rainbow
        targetScaleX = 1.08 + Math.sin(t * 5) * 0.08;
        targetScaleY = 0.92 - Math.sin(t * 5) * 0.08;
        targetEyeWidth = 22;
        targetEyeHeight = 26;
        break;

      case 'HAIL':
        // Shivering hail bounce
        targetScaleX = 0.9 + (Math.random() - 0.5) * 0.05;
        targetScaleY = 1.1 + (Math.random() - 0.5) * 0.05;
        targetEyeWidth = 16;
        targetEyeHeight = 32;
        break;

      case 'TORNADO':
        // Vortex spin
        targetRotation = Math.sin(t * 12) * 0.3;
        targetScaleX = 0.85 + Math.sin(t * 10) * 0.15;
        targetScaleY = 1.15 - Math.sin(t * 10) * 0.15;
        targetEyeWidth = 18;
        targetEyeHeight = 24;
        break;
    }

    // Smooth Lerp parameters
    const lerpRate = 0.08;
    this.scaleX += (targetScaleX - this.scaleX) * lerpRate;
    this.scaleY += (targetScaleY - this.scaleY) * lerpRate;
    
    const effectiveTargetRotation = this.faceTracking.active ? this.faceTracking.roll : targetRotation;
    this.rotation += (effectiveTargetRotation - this.rotation) * (this.faceTracking.active ? 0.75 : lerpRate);

    if (this.studioMode) {
      targetEyeWidth = this.customConfig.eyeWidth;
      targetEyeHeight = this.customConfig.eyeHeight;
      targetEyeTilt = (this.customConfig.eyeTilt * Math.PI) / 180;
      targetRingVis = this.customConfig.showRings ? 1 : 0;
      targetParticleVis = this.customConfig.showParticles ? 1 : 0;
    }

    this.eyeWidth += (targetEyeWidth - this.eyeWidth) * lerpRate;
    this.eyeHeight += (targetEyeHeight - this.eyeHeight) * lerpRate;
    this.eyeTilt += (targetEyeTilt - this.eyeTilt) * lerpRate;
    
    this.ringVisibility += (targetRingVis - this.ringVisibility) * 0.05;
    this.particleVisibility += (targetParticleVis - this.particleVisibility) * 0.05;

    // Calculate Target Control Point Radii per Emotion Shape (Unified Bezier Morphing System)
    const activeShape = this.studioMode ? this.customConfig.shape : this.targetEmotion;

    for (let i = 0; i < this.numPoints; i++) {
      const angle = (i / this.numPoints) * Math.PI * 2;
      let r = this.baseRadius;

      if (activeShape === 'CLOUD' || activeShape === 'MARSHMALLOW' || activeShape === 'RAIN' || activeShape === 'THUNDER' || activeShape === 'SNOWY' || activeShape === 'HAIL') {
        // Cloud Shape: 5 distinct fluffy arcs & flatter base
        const isBottom = Math.sin(angle) > 0.4;
        const cloudPuffs = Math.sin(angle * 5) * 0.22 + Math.cos(angle * 3) * 0.14;
        r = this.baseRadius * (isBottom ? 0.85 : 1.1 + cloudPuffs);
      } else if (activeShape === 'TORNADO') {
        // Funnel Tornado Shape: Top wide cloud top, tapering down to a narrow spinning tip at bottom
        const isTop = Math.sin(angle) < 0;
        const funnel = isTop ? (1.35 + Math.sin(angle * 3) * 0.15) : (0.35 + Math.abs(Math.cos(angle)) * 0.25);
        r = this.baseRadius * funnel;
      } else if (activeShape === 'ALIEN' || activeShape === 'UFO') {
        // UFO Flying Saucer Disc Shape: Ultra wide horizontal disc, flattened height
        const disc = 1.0 + Math.abs(Math.cos(angle)) * 0.7 - Math.abs(Math.sin(angle)) * 0.45;
        r = this.baseRadius * disc;
      } else if (activeShape === 'ROBOT' || activeShape === 'PIXEL') {
        // Squircle Box Head
        const squircle = Math.abs(Math.cos(angle * 2)) > 0.5 ? 0.15 : -0.1;
        r = this.baseRadius * (1 + squircle);
      } else if (activeShape === 'CAT') {
        // Neko ears at top left (-2*PI/3) and top right (-PI/3)
        let ears = 0;
        if (Math.abs(angle - (-Math.PI / 3)) < 0.35 || Math.abs(angle - (-2 * Math.PI / 3)) < 0.35) {
          ears = 0.35;
        }
        r = this.baseRadius * (1 + ears);
      } else if (activeShape === 'RABBIT') {
        // Bunny ears at top
        let ears = 0;
        if (Math.abs(angle - (-Math.PI / 2.3)) < 0.3 || Math.abs(angle - (-Math.PI / 1.7)) < 0.3) {
          ears = 0.55;
        }
        r = this.baseRadius * (1 + ears);
      } else if (activeShape === 'PANDA') {
        // Panda ears at top corners
        let ears = 0;
        if (Math.abs(angle - (-Math.PI / 3)) < 0.32 || Math.abs(angle - (-2 * Math.PI / 3)) < 0.32) {
          ears = 0.3;
        }
        r = this.baseRadius * (1 + ears);
      } else if (activeShape === 'TRIANGLE' || activeShape === 'THINKING' || activeShape === 'HYPED' || activeShape === 'MAGIC') {
        // Rounded triangle formula: 3 principal lobes
        const triFactor = Math.cos(angle * 3 + Math.PI / 2);
        r = this.baseRadius * (1 + 0.28 * triFactor);
      } else if (activeShape === 'SURPRISED' || activeShape === 'SHOCKED' || activeShape === 'FIRE') {
        // Egg shape: wider at bottom, narrower at top
        const eggFactor = -Math.sin(angle);
        r = this.baseRadius * (1 + 0.22 * eggFactor);
      } else if (activeShape === 'ANGRY' || activeShape === 'EVIL' || activeShape === 'DEVIL') {
        // Squish with corner spikes
        const spike = Math.cos(angle * 4);
        r = this.baseRadius * (1 + 0.15 * spike);
      } else if (activeShape === 'DIZZY' || activeShape === 'GHOST') {
        // Wavy perimeter ripple
        const wave = Math.sin(angle * 4 + t * 5);
        r = this.baseRadius * (1 + 0.18 * wave);
      } else {
        // Smooth organic liquid blob with subtle noise breath
        const breath = Math.sin(t * 2 + angle * 2) * 0.05;
        r = this.baseRadius * (1 + breath);
      }

      this.targetRadii[i] = r;
    }
  }

  updateBlobPhysics() {
    for (let i = 0; i < this.numPoints; i++) {
      const dist = this.targetRadii[i] - this.currentRadii[i];
      const force = dist * this.springStiffness;
      this.velocities[i] = (this.velocities[i] + force) * this.damping;
      this.currentRadii[i] += this.velocities[i];
    }
  }

  updateGazeTracking() {
    if (this.faceTracking.active) {
      this.eyeOffset.x += (this.faceTracking.offsetX - this.eyeOffset.x) * 0.75;
      this.eyeOffset.y += (this.faceTracking.offsetY - this.eyeOffset.y) * 0.75;
      return;
    }

    if (this.mouse.isOver) {
      const dx = (this.mouse.x - this.x) * 0.12;
      const dy = (this.mouse.y - this.y) * 0.12;
      
      // Limit max eye gaze range
      const maxDist = 24;
      const dist = Math.hypot(dx, dy);
      if (dist > maxDist) {
        this.targetEyeOffset.x = (dx / dist) * maxDist;
        this.targetEyeOffset.y = (dy / dist) * maxDist;
      } else {
        this.targetEyeOffset.x = dx;
        this.targetEyeOffset.y = dy;
      }
    } else {
      // Idle random gaze shift
      if (Math.random() < 0.01) {
        this.targetEyeOffset.x = (Math.random() - 0.5) * 18;
        this.targetEyeOffset.y = (Math.random() - 0.5) * 12;
      }
    }

    this.eyeOffset.x += (this.targetEyeOffset.x - this.eyeOffset.x) * 0.1;
    this.eyeOffset.y += (this.targetEyeOffset.y - this.eyeOffset.y) * 0.1;
  }

  updateBlinking() {
    const now = Date.now();
    const isNervous = this.targetEmotion === 'NERVOUS';
    const blinkInterval = isNervous ? (150 + Math.random() * 250) : (2500 + Math.random() * 4000);
    
    if (now > this.nextBlinkTime && !this.isBlinking && this.targetEmotion !== 'SLEEPING') {
      this.isBlinking = true;
      this.blinkProgress = 0;
      this.nextBlinkTime = now + blinkInterval;
    }

    if (this.isBlinking) {
      this.blinkProgress += isNervous ? 0.35 : 0.15;
      if (this.blinkProgress >= 1) {
        this.blinkProgress = 0;
        this.isBlinking = false;
      }
    }
  }

  updateRings() {
    for (const ring of this.orbitalRings) {
      ring.angle += ring.speed * this.orbitSpeedMultiplier;
    }
  }

  updateParticles() {
    for (const p of this.particles) {
      p.angle += p.speed;
      p.alpha = 0.3 + 0.7 * Math.sin(this.time * 3 + p.angle);
    }
  }

  startLoop() {
    const loop = () => {
      this.update();
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  stopLoop() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  draw() {
    if (this.greenScreen) {
      this.ctx.fillStyle = '#00FF00';
      this.ctx.fillRect(0, 0, this.width, this.height);
    } else {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }

    // Draw Background Aura / Glow per emotion
    if (!this.greenScreen) {
      this.drawEmotionAura();
    }

    // Draw Z-Sorted 3D Orbital Rings - BACK ARCS (z < 0)
    if (this.ringVisibility > 0.01) {
      this.drawOrbitalRings(false); // Draw segments behind avatar
    }

    // Draw Floating Particles - BACK
    if (this.particleVisibility > 0.01) {
      this.drawParticles(false);
    }

    // Draw Main Blob Body & Eyes
    this.drawBlobBody();

    // Draw Z-Sorted 3D Orbital Rings - FRONT ARCS (z >= 0)
    if (this.ringVisibility > 0.01) {
      this.drawOrbitalRings(true); // Draw segments in front of avatar
    }

    // Draw Floating Particles - FRONT
    if (this.particleVisibility > 0.01) {
      this.drawParticles(true);
    }
  }

  drawEmotionAura() {
    let color = null;
    if (this.targetEmotion === 'ANGRY') color = 'rgba(255, 59, 48, 0.28)';
    else if (this.targetEmotion === 'THINKING') color = 'rgba(90, 200, 250, 0.2)';
    else if (this.targetEmotion === 'LOVE' || this.targetEmotion === 'SHY') color = 'rgba(255, 45, 85, 0.3)';
    else if (this.targetEmotion === 'SAD') color = 'rgba(52, 199, 89, 0.2)';
    else if (this.targetEmotion === 'SMUG' || this.targetEmotion === 'ANGEL' || this.targetEmotion === 'ZEN') color = 'rgba(255, 204, 0, 0.3)';
    else if (this.targetEmotion === 'DIZZY' || this.targetEmotion === 'MAGIC' || this.targetEmotion === 'COSMIC') color = 'rgba(175, 82, 222, 0.3)';
    else if (this.targetEmotion === 'EVIL' || this.targetEmotion === 'DEVIL') color = 'rgba(180, 20, 80, 0.35)';
    else if (this.targetEmotion === 'COOL' || this.targetEmotion === 'FOCUSED') color = 'rgba(0, 122, 255, 0.3)';
    else if (this.targetEmotion === 'ROBOT' || this.targetEmotion === 'ALIEN') color = 'rgba(50, 215, 75, 0.35)';
    else if (this.targetEmotion === 'FIRE') color = 'rgba(255, 149, 0, 0.35)';
    else if (this.targetEmotion === 'SNOW') color = 'rgba(90, 200, 250, 0.35)';

    if (color) {
      const grad = this.ctx.createRadialGradient(this.x, this.y, 40, this.x, this.y, 200);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, 200, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawBlobBody() {
    // Apply bold VTuber body position & leaning transformations
    const bodyShiftX = this.faceTracking.active ? this.faceTracking.smoothBodyX : 0;
    const bodyShiftY = this.faceTracking.active ? this.faceTracking.smoothBodyY : 0;
    const rot = this.faceTracking.active ? this.faceTracking.smoothRoll : this.rotation;
    const leanScaleX = this.faceTracking.active ? (1 + Math.abs(rot) * 0.22 - (bodyShiftY / 100) * 0.12) : 1;
    const leanScaleY = this.faceTracking.active ? (1 - Math.abs(rot) * 0.15 + (bodyShiftY / 100) * 0.18) : 1;

    this.ctx.save();
    this.ctx.translate(this.x + bodyShiftX, this.y + bodyShiftY);
    this.ctx.rotate(rot);
    this.ctx.scale(this.scaleX * leanScaleX, this.scaleY * leanScaleY);

    // 1. Draw Back Accessories FIRST
    if (this.studioMode) {
      if (this.customConfig.auraAccessory === 'SUN') this.drawSunnySun();
      if (this.customConfig.auraAccessory === 'RAINBOW') this.drawRainbowArc();
      if (this.customConfig.auraAccessory === 'KATANAS') this.drawKatana();
      if (this.customConfig.auraAccessory === 'CAPE') this.drawHeroCape();
      if (this.customConfig.auraAccessory === 'BEER') this.drawPartyBeer();
      if (this.customConfig.auraAccessory === 'FIRE') this.drawFireFlames();
      if (this.customConfig.auraAccessory === 'SNOW') this.drawIceCrystals();
      if (this.customConfig.shape === 'PANDA') this.drawPandaEars();
    } else {
      if (this.targetEmotion === 'NINJA') this.drawKatana();
      if (this.targetEmotion === 'SUPERHERO') this.drawHeroCape();
      if (this.targetEmotion === 'SNOW') this.drawIceCrystals();
      if (this.targetEmotion === 'FIRE') this.drawFireFlames();
      if (this.targetEmotion === 'STAR') this.drawStarClusters();
      if (this.targetEmotion === 'PARTY') this.drawPartyBeer();
      if (this.targetEmotion === 'PANDA') this.drawPandaEars();
      if (this.targetEmotion === 'SUNNY') this.drawSunnySun();
      if (this.targetEmotion === 'RAINBOW') this.drawRainbowArc();
    }

    // 2. Pure Black Main Body via Smooth Spring Bezier Curve (Organic Liquid Mercury Morphing)
    this.ctx.beginPath();
    const points = [];
    for (let i = 0; i < this.numPoints; i++) {
      const angle = (i / this.numPoints) * Math.PI * 2;
      const r = this.currentRadii[i];
      points.push({
        x: r * Math.cos(angle),
        y: r * Math.sin(angle)
      });
    }

    this.ctx.moveTo((points[0].x + points[this.numPoints - 1].x) / 2, (points[0].y + points[this.numPoints - 1].y) / 2);
    for (let i = 0; i < this.numPoints; i++) {
      const nextIdx = (i + 1) % this.numPoints;
      const midX = (points[i].x + points[nextIdx].x) / 2;
      const midY = (points[i].y + points[nextIdx].y) / 2;
      this.ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    this.ctx.closePath();

    // Determine Body Color - ALL BODY SHAPES ARE PURE BLACK (#0A0A0C) TO MATCH AVATAR IDENTITY
    this.ctx.fillStyle = this.blobColor; // Pure Black #0A0A0C
    this.ctx.fill();

    // 3. Draw Front Accessories per Emotion or Studio Config
    if (this.studioMode) {
      if (this.customConfig.headAccessory === 'HALO') this.drawHalo();
      if (this.customConfig.headAccessory === 'HORNS') this.drawDevilHorns();
      if (this.customConfig.headAccessory === 'ANTENNA') this.drawAntenna();
      if (this.customConfig.headAccessory === 'NINJA_MASK') this.drawNinjaMask();
      if (this.customConfig.headAccessory === 'HERO_MASK') {
        this.drawHeroMask();
        this.drawHeroEmblem();
      }
      if (this.customConfig.headAccessory === 'EYEPATCH') this.drawEyepatch();

      if (this.customConfig.shape === 'PANDA') this.drawPandaRings();
      if (this.customConfig.shape === 'ROBOT') this.drawRobotParts();
      if (this.customConfig.auraAccessory === 'RAIN') this.drawCloudRain();
      if (this.customConfig.auraAccessory === 'THUNDER') this.drawThunderLightning();
      if (this.customConfig.auraAccessory === 'SNOW') this.drawSnowfall();
      if (this.customConfig.showCheeks) this.drawCheeks();

      if (this.customDrawAccessory && typeof this.customDrawAccessory === 'function') {
        try {
          this.customDrawAccessory(this.ctx, this.time);
        } catch (e) {}
      }

      if (this.customConfig.shape !== 'ROBOT') {
        this.drawEyes();
      }
    } else {
      if (this.targetEmotion === 'ANGEL') this.drawHalo();
      if (this.targetEmotion === 'DEVIL') this.drawDevilHorns();
      if (this.targetEmotion === 'ALIEN') this.drawAntenna();
      if (this.targetEmotion === 'ROBOT') this.drawRobotParts();
      if (this.targetEmotion === 'PANDA') this.drawPandaRings();
      if (this.targetEmotion === 'PIRATE') this.drawEyepatch();
      if (this.targetEmotion === 'SUPERHERO') {
        this.drawHeroMask();
        this.drawHeroEmblem();
      }
      if (this.targetEmotion === 'NINJA') this.drawNinjaMask();
      if (this.targetEmotion === 'RAIN') this.drawCloudRain();
      if (this.targetEmotion === 'THUNDER') this.drawThunderLightning();
      if (this.targetEmotion === 'SNOWY') this.drawSnowfall();
      if (this.targetEmotion === 'WINDY') this.drawWindGust();
      if (this.targetEmotion === 'FOGGY') this.drawFogMist();
      if (this.targetEmotion === 'HAIL') this.drawHailPellets();
      if (this.targetEmotion === 'SHY' || this.targetEmotion === 'LOVE' || this.targetEmotion === 'PUFF' || this.targetEmotion === 'BOBA' || this.targetEmotion === 'MARSHMALLOW' || this.targetEmotion === 'SUNNY') {
        this.drawCheeks();
      }

      if (this.targetEmotion !== 'ROBOT') {
        this.drawEyes();
      }
    }

    // 4. Draw Talking Mouth in VTuber Mode when user speaks
    this.drawTalkingMouth();

    this.ctx.restore();
  }

  drawTalkingMouth() {
    if (!this.faceTracking.active || this.faceTracking.smoothMouth <= 0.08) return;

    const mouthH = Math.min(24, Math.max(3, this.faceTracking.smoothMouth * 28));
    const mouthW = Math.min(28, Math.max(8, 8 + this.faceTracking.smoothMouth * 20));
    const mx = this.eyeOffset.x * 0.4;
    const my = 26 + this.eyeOffset.y * 0.4;

    this.ctx.save();
    // Dark outer mouth
    this.ctx.fillStyle = '#111115';
    this.ctx.strokeStyle = '#2A2A35';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.ellipse(mx, my, mouthW, mouthH, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Cute pink tongue
    if (mouthH > 6) {
      this.ctx.fillStyle = '#FF2D55';
      this.ctx.beginPath();
      this.ctx.ellipse(mx, my + mouthH * 0.35, mouthW * 0.65, mouthH * 0.55, 0, 0, Math.PI);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawKatana() {
    this.ctx.save();
    // Dual Diagonal Katana Swords on Back
    this.ctx.lineWidth = 6;
    // Sword 1 Blade
    this.ctx.strokeStyle = '#E2E8F0';
    this.ctx.beginPath();
    this.ctx.moveTo(-65, -65);
    this.ctx.lineTo(65, 65);
    this.ctx.stroke();
    // Guard 1
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(-42, -42, 9, 0, Math.PI * 2);
    this.ctx.fill();
    // Hilt 1
    this.ctx.strokeStyle = '#EF4444';
    this.ctx.lineWidth = 7;
    this.ctx.beginPath();
    this.ctx.moveTo(-42, -42);
    this.ctx.lineTo(-72, -72);
    this.ctx.stroke();

    // Sword 2 Blade
    this.ctx.lineWidth = 6;
    this.ctx.strokeStyle = '#CBD5E1';
    this.ctx.beginPath();
    this.ctx.moveTo(65, -65);
    this.ctx.lineTo(-65, 65);
    this.ctx.stroke();
    // Guard 2
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(42, -42, 9, 0, Math.PI * 2);
    this.ctx.fill();
    // Hilt 2
    this.ctx.strokeStyle = '#EF4444';
    this.ctx.lineWidth = 7;
    this.ctx.beginPath();
    this.ctx.moveTo(42, -42);
    this.ctx.lineTo(72, -72);
    this.ctx.stroke();

    // Spinning Ninja Shurikens orbiting around
    const t = this.time;
    for (let s = 0; s < 3; s++) {
      const sAngle = (s / 3) * Math.PI * 2 + t * 2;
      const sx = Math.cos(sAngle) * 95;
      const sy = Math.sin(sAngle) * 95;

      this.ctx.save();
      this.ctx.translate(sx, sy);
      this.ctx.rotate(t * 8);
      this.ctx.fillStyle = '#94A3B8';
      // 4-pointed Shuriken star
      this.ctx.beginPath();
      for (let k = 0; k < 4; k++) {
        this.ctx.rotate(Math.PI / 2);
        this.ctx.lineTo(12, 0);
        this.ctx.lineTo(3, 3);
      }
      this.ctx.fill();
      this.ctx.restore();
    }
    this.ctx.restore();
  }

  drawNinjaMask() {
    this.ctx.save();
    // 1. Lower Face Mask Covering Mouth & Chin
    this.ctx.fillStyle = '#0F172A';
    this.ctx.beginPath();
    this.ctx.moveTo(-60, -2);
    this.ctx.quadraticCurveTo(0, 25, 60, -2);
    this.ctx.lineTo(55, 60);
    this.ctx.quadraticCurveTo(0, 75, -55, 60);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // 2. Red Ninja Headband across Forehead
    this.ctx.fillStyle = '#EF4444';
    this.ctx.beginPath();
    this.ctx.moveTo(-58, -52);
    this.ctx.quadraticCurveTo(0, -58, 58, -52);
    this.ctx.lineTo(54, -34);
    this.ctx.quadraticCurveTo(0, -40, -54, -34);
    this.ctx.closePath();
    this.ctx.fill();

    // Golden Metal Plate on Headband
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.roundRect(-16, -49, 32, 12, 3);
    this.ctx.fill();

    // 3. Fluttering Red Ribbon Tails on Left Side
    const t = this.time;
    const wave1 = Math.sin(t * 8) * 12;
    const wave2 = Math.cos(t * 8) * 10;
    this.ctx.fillStyle = '#DC2626';
    this.ctx.beginPath();
    this.ctx.moveTo(-54, -42);
    this.ctx.quadraticCurveTo(-75 + wave1, -40, -100 + wave1, -20);
    this.ctx.lineTo(-95 + wave1, -12);
    this.ctx.quadraticCurveTo(-70 + wave1, -34, -54, -36);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(-54, -38);
    this.ctx.quadraticCurveTo(-80 + wave2, -25, -105 + wave2, 0);
    this.ctx.lineTo(-100 + wave2, 8);
    this.ctx.quadraticCurveTo(-75 + wave2, -20, -54, -32);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawCloudBody() {
    this.ctx.save();
    // Cartoon Cloud Body Silhouette with 5 distinct fluffy arcs & flat base:
    this.ctx.beginPath();
    // Center Top Puff Arc
    this.ctx.arc(0, -22, 38, Math.PI * 0.9, Math.PI * 0.1, false);
    // Top Right Puff Arc
    this.ctx.arc(38, -10, 30, -Math.PI * 0.65, Math.PI * 0.25, false);
    // Bottom Right Puff Arc
    this.ctx.arc(54, 14, 25, -Math.PI * 0.4, Math.PI * 0.5, false);
    // Bottom Flat Base
    this.ctx.quadraticCurveTo(0, 48, -54, 39);
    // Bottom Left Puff Arc
    this.ctx.arc(-54, 14, 25, Math.PI * 0.5, -Math.PI * 0.4, false);
    // Top Left Puff Arc
    this.ctx.arc(-38, -10, 30, Math.PI * 0.75, -Math.PI * 0.35, false);
    this.ctx.closePath();

    // Pure Black Fill matching all other avatar bodies
    this.ctx.fillStyle = this.blobColor; // Pure Black #0A0A0C
    this.ctx.fill();
    this.ctx.restore();
  }

  drawSunnySun() {
    this.ctx.save();
    const t = this.time;
    // Spinning Golden Radiant Sun Disc behind head
    this.ctx.translate(0, -50);
    this.ctx.rotate(t * 0.6);
    this.ctx.strokeStyle = '#F59E0B';
    this.ctx.lineWidth = 5;
    for (let r = 0; r < 12; r++) {
      this.ctx.rotate(Math.PI / 6);
      this.ctx.beginPath();
      this.ctx.moveTo(52, 0);
      this.ctx.lineTo(68, 0);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawThunderLightning() {
    this.ctx.save();
    const t = this.time;
    // Flashing Yellow Lightning Bolt Striking down
    if (Math.sin(t * 12) > 0.3) {
      this.ctx.fillStyle = '#FACC15';
      this.ctx.strokeStyle = '#EAB308';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 35);
      this.ctx.lineTo(15, 60);
      this.ctx.lineTo(2, 60);
      this.ctx.lineTo(22, 90);
      this.ctx.lineTo(-5, 68);
      this.ctx.lineTo(8, 68);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawSnowfall() {
    this.ctx.save();
    const t = this.time;
    // Floating 6-pointed snowflakes falling
    this.ctx.strokeStyle = '#93C5FD';
    this.ctx.lineWidth = 2;
    for (let s = 0; s < 6; s++) {
      const sx = -60 + s * 24;
      const sy = 40 + ((t * 40 + s * 15) % 45);
      this.ctx.save();
      this.ctx.translate(sx, sy);
      this.ctx.rotate(t + s);
      for (let k = 0; k < 3; k++) {
        this.ctx.rotate(Math.PI / 3);
        this.ctx.beginPath();
        this.ctx.moveTo(-6, 0);
        this.ctx.lineTo(6, 0);
        this.ctx.stroke();
      }
      this.ctx.restore();
    }
    this.ctx.restore();
  }

  drawWindGust() {
    this.ctx.save();
    const t = this.time;
    // Swirling Gust Wind Spirals & Blowing Leaves
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 3;
    for (let w = 0; w < 3; w++) {
      const wx = -80 + ((t * 90 + w * 40) % 160);
      const wy = -30 + w * 25;
      this.ctx.beginPath();
      this.ctx.arc(wx, wy, 14, 0, Math.PI * 1.4);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawFogMist() {
    this.ctx.save();
    const t = this.time;
    // Translucent Misty Fog Waves drifting
    this.ctx.fillStyle = 'rgba(203, 213, 225, 0.35)';
    for (let f = 0; f < 3; f++) {
      const fx = Math.sin(t * 2 + f) * 15;
      const fy = 10 + f * 18;
      this.ctx.beginPath();
      this.ctx.roundRect(-75 + fx, fy, 150, 10, 5);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawRainbowArc() {
    this.ctx.save();
    // 7-Color Rainbow Arc spanning over head
    const colors = ['#EF4444', '#F97316', '#FACC15', '#10B981', '#06B6D4', '#6366F1', '#8B5CF6'];
    for (let r = 0; r < colors.length; r++) {
      this.ctx.strokeStyle = colors[r];
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 95 + r * 3.5, Math.PI * 1.1, Math.PI * 1.9);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawHailPellets() {
    this.ctx.save();
    const t = this.time;
    // Bouncing White Hail Pellets
    this.ctx.fillStyle = '#E2E8F0';
    for (let h = 0; h < 5; h++) {
      const hx = -50 + h * 25;
      const hy = 50 + Math.abs(Math.sin(t * 8 + h)) * 25;
      this.ctx.beginPath();
      this.ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawTornadoBody() {
    this.ctx.save();
    // Pure Black Cartoon Tornado Funnel Silhouette Body
    this.ctx.beginPath();
    // Top wide puff arc
    this.ctx.arc(0, -45, 55, Math.PI * 0.9, Math.PI * 0.1, false);
    // Tapering right funnel curve down to spinning base tip
    this.ctx.quadraticCurveTo(45, -10, 12, 60);
    this.ctx.quadraticCurveTo(0, 78, -12, 60);
    // Tapering left funnel curve back up to top left
    this.ctx.quadraticCurveTo(-45, -10, -55, -45);
    this.ctx.closePath();

    // Pure Black Fill matching all avatar bodies
    this.ctx.fillStyle = this.blobColor; // #0A0A0C
    this.ctx.fill();
    this.ctx.restore();
  }

  drawUFOBody() {
    this.ctx.save();
    const t = this.time;

    // 1. Downward Green Tractor Beam Light Cone
    const beamGrad = this.ctx.createLinearGradient(0, 15, 0, 80);
    beamGrad.addColorStop(0, 'rgba(52, 199, 89, 0.45)');
    beamGrad.addColorStop(1, 'rgba(52, 199, 89, 0.0)');
    this.ctx.fillStyle = beamGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(-25, 15);
    this.ctx.lineTo(-65, 80);
    this.ctx.lineTo(65, 80);
    this.ctx.lineTo(25, 15);
    this.ctx.closePath();
    this.ctx.fill();

    // 2. Pure Black UFO Flying Saucer Silhouette Body (Dome + Disc combined in #0A0A0C Pure Black)
    this.ctx.beginPath();
    // Top Dome Arc
    this.ctx.arc(0, -6, 34, Math.PI, 0, false);
    // Outer Disc Ellipse Base
    this.ctx.ellipse(0, 6, 72, 22, 0, -Math.PI * 0.05, Math.PI * 1.05, false);
    this.ctx.closePath();

    // PURE BLACK FILL ONLY (#0A0A0C) - NO COLORED STROKES ON BODY
    this.ctx.fillStyle = this.blobColor; // #0A0A0C Pure Black
    this.ctx.fill();

    // 4. Glowing Neon LED Indicator Lights along disc rim
    const leds = [-50, -25, 0, 25, 50];
    for (let i = 0; i < leds.length; i++) {
      const ledColor = Math.sin(t * 8 + i) > 0 ? '#34D399' : '#FBBF24';
      this.ctx.fillStyle = ledColor;
      this.ctx.beginPath();
      this.ctx.arc(leds[i], 5, 4.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 5. Antenna on top of Glass Dome with blinking LED
    this.ctx.strokeStyle = '#34D399';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -46);
    this.ctx.lineTo(0, -64);
    this.ctx.stroke();

    const ledBlink = Math.sin(t * 10) > 0;
    this.ctx.fillStyle = ledBlink ? '#34D399' : '#059669';
    this.ctx.beginPath();
    this.ctx.arc(0, -68, 6, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawCloudSun() {
    this.ctx.save();
    const t = this.time;
    // Smiling Golden Sun peeking from top-right of cloud body
    this.ctx.translate(62, -45);
    
    // Rotating Sun Rays
    this.ctx.save();
    this.ctx.rotate(t * 0.8);
    this.ctx.strokeStyle = '#F59E0B';
    this.ctx.lineWidth = 4;
    for (let r = 0; r < 8; r++) {
      this.ctx.rotate(Math.PI / 4);
      this.ctx.beginPath();
      this.ctx.moveTo(26, 0);
      this.ctx.lineTo(34, 0);
      this.ctx.stroke();
    }
    this.ctx.restore();

    // Sun Disc Body
    this.ctx.fillStyle = '#FBBF24';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 24, 0, Math.PI * 2);
    this.ctx.fill();

    // Cute Sun Eyes & Smile
    this.ctx.fillStyle = '#78350F';
    this.ctx.beginPath();
    this.ctx.arc(-8, -4, 3, 0, Math.PI * 2);
    this.ctx.arc(8, -4, 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = '#78350F';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(0, 2, 7, 0, Math.PI);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawCloudRain() {
    this.ctx.save();
    const t = this.time;
    // 4 Falling Animated Raindrops beneath Cloud Body
    this.ctx.fillStyle = '#38BDF8';
    for (let r = 0; r < 4; r++) {
      const rx = -40 + r * 26;
      const ry = 55 + ((t * 80 + r * 20) % 35);
      const alpha = 1 - (ry - 55) / 35;

      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(rx, ry, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
    this.ctx.restore();
  }

  drawHeroCape() {
    this.ctx.save();
    // Flowing Red Superhero Cape
    const t = this.time;
    const wave = Math.sin(t * 5) * 12;
    this.ctx.fillStyle = '#E62117';
    this.ctx.beginPath();
    this.ctx.moveTo(-45, -20);
    this.ctx.quadraticCurveTo(-90 + wave, 40, -70 + wave, 110);
    this.ctx.quadraticCurveTo(0, 95, 70 - wave, 110);
    this.ctx.quadraticCurveTo(90 - wave, 40, 45, -20);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  drawHeroMask() {
    this.ctx.save();
    // Red Domino Superhero Eye Mask
    this.ctx.fillStyle = '#C41212';
    this.ctx.beginPath();
    this.ctx.moveTo(-50, -25);
    this.ctx.quadraticCurveTo(0, -35, 50, -25);
    this.ctx.quadraticCurveTo(55, 5, 30, 8);
    this.ctx.quadraticCurveTo(0, -8, -30, 8);
    this.ctx.quadraticCurveTo(-55, 5, -50, -25);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawHeroEmblem() {
    this.ctx.save();
    // Golden Diamond Chest Emblem with 'S' Symbol
    this.ctx.translate(0, 32);
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.moveTo(0, -16);
    this.ctx.lineTo(16, 0);
    this.ctx.lineTo(0, 18);
    this.ctx.lineTo(-16, 0);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = '#C41212';
    this.ctx.font = 'bold 16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('S', 0, 1);
    this.ctx.restore();
  }

  drawIceCrystals() {
    this.ctx.save();
    const t = this.time;
    this.ctx.fillStyle = '#A0E8FF';
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 1.5;

    // Frozen Icicles at base
    this.ctx.beginPath();
    this.ctx.moveTo(-50, 45);
    this.ctx.lineTo(-40, 75);
    this.ctx.lineTo(-30, 50);
    this.ctx.lineTo(-15, 80);
    this.ctx.lineTo(0, 52);
    this.ctx.lineTo(15, 82);
    this.ctx.lineTo(35, 48);
    this.ctx.lineTo(48, 72);
    this.ctx.lineTo(55, 45);
    this.ctx.fill();

    // Floating 6-pointed ice crystals
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + t * 0.8;
      const radius = 100 + Math.sin(t * 3 + i) * 10;
      const cx = radius * Math.cos(angle);
      const cy = radius * Math.sin(angle);

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.rotate(t + i);
      for (let k = 0; k < 3; k++) {
        this.ctx.rotate(Math.PI / 3);
        this.ctx.beginPath();
        this.ctx.moveTo(-10, 0);
        this.ctx.lineTo(10, 0);
        this.ctx.stroke();
      }
      this.ctx.restore();
    }
    this.ctx.restore();
  }

  drawStarClusters() {
    this.ctx.save();
    const t = this.time;
    // 8 Bright Golden Twinkling Stars orbiting head
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + t * 1.2;
      const radius = 105 + Math.sin(t * 2 + i) * 12;
      const cx = radius * Math.cos(angle);
      const cy = radius * Math.sin(angle);

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.rotate(t * 2 + i);
      this.ctx.fillStyle = '#FFD700';

      // Draw 5-pointed star
      this.ctx.beginPath();
      for (let s = 0; s < 5; s++) {
        this.ctx.lineTo(Math.cos((18 + s * 72) * Math.PI / 180) * 8, -Math.sin((18 + s * 72) * Math.PI / 180) * 8);
        this.ctx.lineTo(Math.cos((54 + s * 72) * Math.PI / 180) * 3.5, -Math.sin((54 + s * 72) * Math.PI / 180) * 3.5);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    }
    this.ctx.restore();
  }

  drawFireFlames() {
    this.ctx.save();
    const t = this.time;
    // Rising animated flame tongues
    for (let i = -3; i <= 3; i++) {
      const fx = i * 18;
      const fy = -this.baseRadius + 15;
      const flameH = 40 + Math.sin(t * 10 + i) * 15;

      const grad = this.ctx.createLinearGradient(fx, fy, fx, fy - flameH);
      grad.addColorStop(0, '#FF3B30');
      grad.addColorStop(0.5, '#FF9500');
      grad.addColorStop(1, '#FFCC00');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.moveTo(fx - 10, fy);
      this.ctx.quadraticCurveTo(fx, fy - flameH * 1.2, fx + 10, fy);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawPartyBeer() {
    this.ctx.save();
    const t = this.time;
    // Two Foaming Beer Mugs Clinking with Cheers Bubbles
    const swing = Math.sin(t * 6) * 15;

    // Beer Mug Left
    this.drawSingleBeerMug(-80 + swing, -20, true);
    // Beer Mug Right
    this.drawSingleBeerMug(80 - swing, -20, false);

    // Popping Confetti Bubbles
    for (let b = 0; b < 6; b++) {
      const bx = (Math.sin(t * 3 + b) * 90);
      const by = -80 - (Math.cos(t * 2 + b) * 30);
      this.ctx.fillStyle = b % 2 === 0 ? '#FFCC00' : '#FF2D55';
      this.ctx.beginPath();
      this.ctx.arc(bx, by, 5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawSingleBeerMug(x, y, isLeft) {
    this.ctx.save();
    this.ctx.translate(x, y);
    // Glass Body
    this.ctx.fillStyle = '#FFC107'; // Beer Gold
    this.ctx.beginPath();
    this.ctx.roundRect(-12, -15, 24, 30, 4);
    this.ctx.fill();
    // White Foam Cap
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(-8, -15, 8, 0, Math.PI * 2);
    this.ctx.arc(0, -18, 9, 0, Math.PI * 2);
    this.ctx.arc(8, -15, 8, 0, Math.PI * 2);
    this.ctx.fill();
    // Mug Handle
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    const handleDir = isLeft ? -1 : 1;
    this.ctx.arc(handleDir * 14, 0, 7, -Math.PI / 2, Math.PI / 2, !isLeft);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawRobotParts() {
    this.ctx.save();
    // Metallic Ears & Bolts
    this.ctx.fillStyle = '#64748B';
    this.ctx.fillRect(-this.baseRadius - 10, -10, 10, 20);
    this.ctx.fillRect(this.baseRadius, -10, 10, 20);

    // Top Antenna Rod & Blinking Red Signal LED
    this.ctx.strokeStyle = '#94A3B8';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -this.baseRadius);
    this.ctx.lineTo(0, -this.baseRadius - 25);
    this.ctx.stroke();

    const ledBlink = Math.sin(this.time * 8) > 0;
    this.ctx.fillStyle = ledBlink ? '#FF3B30' : '#880000';
    this.ctx.beginPath();
    this.ctx.arc(0, -this.baseRadius - 28, 7, 0, Math.PI * 2);
    this.ctx.fill();

    // Cyan Matrix Digital Visor Screen
    this.ctx.fillStyle = '#0F172A';
    this.ctx.strokeStyle = '#38BDF8';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(-42, -28, 84, 38, 8);
    this.ctx.fill();
    this.ctx.stroke();

    // Matrix LED Pixel Eyes
    this.ctx.fillStyle = '#38BDF8';
    const blink = this.isBlinking ? 2 : 14;
    this.ctx.fillRect(-24, -12 - blink / 2, 14, blink);
    this.ctx.fillRect(10, -12 - blink / 2, 14, blink);
    this.ctx.restore();
  }

  drawHalo() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 6;
    this.ctx.ellipse(0, -this.baseRadius - 20, 45, 12, 0, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawDevilHorns() {
    this.ctx.save();
    this.ctx.fillStyle = '#FF3B30';
    // Left Horn
    this.ctx.beginPath();
    this.ctx.moveTo(-35, -this.baseRadius + 10);
    this.ctx.quadraticCurveTo(-45, -this.baseRadius - 25, -20, -this.baseRadius - 15);
    this.ctx.fill();
    // Right Horn
    this.ctx.beginPath();
    this.ctx.moveTo(35, -this.baseRadius + 10);
    this.ctx.quadraticCurveTo(45, -this.baseRadius - 25, 20, -this.baseRadius - 15);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawAntenna() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#34C759';
    this.ctx.lineWidth = 4;
    this.ctx.moveTo(0, -this.baseRadius);
    this.ctx.lineTo(0, -this.baseRadius - 30);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.fillStyle = '#30B0C7';
    this.ctx.arc(0, -this.baseRadius - 34, 9, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawPandaEars() {
    this.ctx.save();
    // Dark Black Panda Ears on top left and top right of head
    this.ctx.fillStyle = '#1E293B';
    this.ctx.beginPath();
    this.ctx.arc(-42, -this.baseRadius + 12, 20, 0, Math.PI * 2);
    this.ctx.arc(42, -this.baseRadius + 12, 20, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawPandaRings() {
    this.ctx.save();
    // Slanted Dark Panda Eye Patches
    this.ctx.fillStyle = '#1E293B';
    // Left patch
    this.ctx.beginPath();
    this.ctx.ellipse(-this.eyeSpacing / 2 + this.eyeOffset.x, -12 + this.eyeOffset.y, 18, 25, -0.25, 0, Math.PI * 2);
    this.ctx.fill();
    // Right patch
    this.ctx.beginPath();
    this.ctx.ellipse(this.eyeSpacing / 2 + this.eyeOffset.x, -12 + this.eyeOffset.y, 18, 25, 0.25, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawEyepatch() {
    this.ctx.save();
    const leftEyeX = -this.eyeSpacing / 2 + this.eyeOffset.x;
    const eyeY = -12 + this.eyeOffset.y;
    this.ctx.fillStyle = '#1C1C1E';
    this.ctx.beginPath();
    this.ctx.arc(leftEyeX, eyeY, 18, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = '#3A3A3C';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(-this.baseRadius, eyeY - 15);
    this.ctx.lineTo(this.baseRadius, eyeY + 15);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawCheeks() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 105, 180, 0.45)';
    this.ctx.beginPath();
    this.ctx.arc(-26, 12, 10, 0, Math.PI * 2);
    this.ctx.arc(26, 12, 10, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawEyes() {
    const spacing = this.studioMode ? this.customConfig.eyeSpacing : this.eyeSpacing;
    const basePosX = (this.studioMode ? this.customConfig.eyePosX : 0);
    const basePosY = (this.studioMode ? this.customConfig.eyePosY : 0);

    // Dynamic 3D Head-Eye Coupling in VTuber mode:
    // When the human turns/tilts their head, eyes shift across the 3D spherical curvature
    const headRoll = this.faceTracking.active ? this.rotation : 0;
    const eyeCouplingX = this.faceTracking.active ? (this.eyeOffset.x * 1.6 + Math.sin(headRoll) * 32) : this.eyeOffset.x;
    const eyeCouplingY = this.faceTracking.active ? (this.eyeOffset.y * 1.4 - (1 - Math.cos(headRoll)) * 20) : this.eyeOffset.y;

    const posX = basePosX + eyeCouplingX;
    const posY = basePosY + eyeCouplingY;
    let eyeY = -12 + posY;
    let leftEyeX = posX - spacing / 2;
    let rightEyeX = posX + spacing / 2;

    if (!this.studioMode && this.targetEmotion === 'BORED') {
      eyeY -= 14;
    }

    // Calculate blink squish
    let currentHeight = this.eyeHeight;
    if (this.isBlinking) {
      const blinkFactor = Math.sin(this.blinkProgress * Math.PI);
      currentHeight = Math.max(3, this.eyeHeight * (1 - blinkFactor * 0.9));
    } else if (!this.studioMode && this.targetEmotion === 'SLEEPING') {
      currentHeight = 5;
    }

    this.ctx.fillStyle = this.eyeColor;

    // Determine left and right eye tilt & size per emotion or studio config
    let leftTilt = -this.eyeTilt;
    let rightTilt = this.eyeTilt;
    let leftH = currentHeight;
    let rightH = currentHeight;
    let leftW = this.eyeWidth;
    let rightW = this.eyeWidth;

    if (this.studioMode) {
      leftW = this.customConfig.eyeWidth;
      rightW = this.customConfig.eyeWidth;
      leftH = this.customConfig.eyeHeight;
      rightH = this.customConfig.eyeHeight;
      const baseTilt = (this.customConfig.eyeTilt * Math.PI) / 180;
      const combinedRotation = ((this.customConfig.eyeRotation || 0) * Math.PI) / 180;
      
      leftTilt = -baseTilt + combinedRotation;
      rightTilt = baseTilt + combinedRotation;

      const style = this.customConfig.eyeStyle;
      
      if (style === 'CRESCENT') {
        this.drawCrescentEye(leftEyeX, eyeY, leftW, leftH, leftTilt - 0.28);
        this.drawCrescentEye(rightEyeX, eyeY, rightW, rightH, rightTilt + 0.28);
        return;
      } else if (style === 'STERN') {
        leftTilt += 0.45;
        rightTilt -= 0.45;
      } else if (style === 'CIRCLE') {
        this.drawCircleEye(leftEyeX, eyeY, Math.max(leftW, leftH), leftTilt);
        this.drawCircleEye(rightEyeX, eyeY, Math.max(rightW, rightH), rightTilt);
        return;
      } else if (style === 'STAR') {
        this.drawStarEye(leftEyeX, eyeY, Math.max(leftW, 16));
        this.drawStarEye(rightEyeX, eyeY, Math.max(rightW, 16));
        return;
      }
    } else {
      if (this.targetEmotion === 'HAPPY' || this.targetEmotion === 'PARTY') {
        leftTilt = -0.28;
        rightTilt = 0.28;
      } else if (this.targetEmotion === 'ANGRY') {
        leftTilt = 0.38;
        rightTilt = -0.38;
      } else if (this.targetEmotion === 'EVIL') {
        leftTilt = 0.45;
        rightTilt = -0.15;
      } else if (this.targetEmotion === 'SAD') {
        leftTilt = -0.32;
        rightTilt = 0.32;
      } else if (this.targetEmotion === 'CONFUSED') {
        leftTilt = 0.28;
        rightTilt = -0.12;
      } else if (this.targetEmotion === 'DIZZY') {
        leftTilt = Math.sin(this.time * 8) * 0.4;
        rightTilt = -Math.cos(this.time * 8) * 0.4;
      } else if (this.targetEmotion === 'WINK') {
        leftH = 4;
      } else if (this.targetEmotion === 'SURPRISED') {
        rightW = this.eyeWidth * 1.3;
        rightH = currentHeight * 1.18;
      } else if (this.targetEmotion === 'STAR') {
        this.drawStarEye(leftEyeX, eyeY, leftW);
        this.drawStarEye(rightEyeX, eyeY, rightW);
        return;
      }
    }

    // 3D Head-Eye Coupling in VTuber mode:
    // Parallel tilt + perspective width asymmetry
    if (this.faceTracking.active) {
      leftTilt += headRoll * 0.85;
      rightTilt += headRoll * 0.85;
      leftW = Math.max(6, leftW * (1 - Math.sin(headRoll) * 0.35));
      rightW = Math.max(6, rightW * (1 + Math.sin(headRoll) * 0.35));
    }

    // Left Pill Eye
    this.drawPillEye(leftEyeX, eyeY, leftW, leftH, leftTilt);
    
    // Right Pill Eye
    this.drawPillEye(rightEyeX, eyeY, rightW, rightH, rightTilt);
  }

  drawCrescentEye(x, y, w, h, tilt) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(tilt);
    this.ctx.strokeStyle = this.eyeColor;
    this.ctx.lineWidth = Math.max(5, w * 0.35);
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    const r = Math.max(10, w * 0.7);
    this.ctx.arc(0, r * 0.3, r, Math.PI * 1.15, Math.PI * 1.85);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawCircleEye(x, y, radius, tilt) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(tilt);
    this.ctx.fillStyle = this.eyeColor;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, Math.max(6, radius / 2), 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawStarEye(x, y, size) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(this.time * 2);
    this.ctx.fillStyle = '#FACC15';
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerX = Math.cos((18 + i * 72) * Math.PI / 180) * size;
      const outerY = -Math.sin((18 + i * 72) * Math.PI / 180) * size;
      const innerX = Math.cos((54 + i * 72) * Math.PI / 180) * (size * 0.45);
      const innerY = -Math.sin((54 + i * 72) * Math.PI / 180) * (size * 0.45);
      if (i === 0) this.ctx.moveTo(outerX, outerY);
      else this.ctx.lineTo(outerX, outerY);
      this.ctx.lineTo(innerX, innerY);
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawPillEye(x, y, w, h, tilt) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(tilt);

    this.ctx.beginPath();
    const minDim = Math.min(w, h);
    const maxR = minDim / 2;

    if (this.ctx.roundRect) {
      this.ctx.roundRect(-w / 2, -h / 2, w, h, maxR);
    } else {
      // Fallback for capsule shape
      if (h >= w) {
        const r = w / 2;
        this.ctx.arc(0, -h / 2 + r, r, Math.PI, 0);
        this.ctx.lineTo(r, h / 2 - r);
        this.ctx.arc(0, h / 2 - r, r, 0, Math.PI);
      } else {
        const r = h / 2;
        this.ctx.arc(-w / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5);
        this.ctx.lineTo(w / 2 - r, -r);
        this.ctx.arc(w / 2 - r, 0, r, Math.PI * 1.5, Math.PI / 2);
      }
      this.ctx.closePath();
    }
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * 3D Z-Sorted Orbital Rings Renderer (Video Frames 20-22)
   * Projects 3D ellipse points to 2D screen and renders front/back segments separately.
   */
  drawOrbitalRings(inFront) {
    this.ctx.save();
    this.ctx.globalAlpha = this.ringVisibility;

    for (const ring of this.orbitalRings) {
      const samples = 72;
      const pts = [];

      for (let i = 0; i <= samples; i++) {
        const theta = (i / samples) * Math.PI * 2 + ring.angle;
        
        // 3D Ellipse Parametric Equations
        let x0 = ring.radius * Math.cos(theta);
        let y0 = ring.radius * Math.sin(theta) * Math.cos(ring.tiltX);
        let z0 = ring.radius * Math.sin(theta) * Math.sin(ring.tiltX);

        // Rotate around Y and Z axes
        let x1 = x0 * Math.cos(ring.tiltY) + z0 * Math.sin(ring.tiltY);
        let y1 = y0;
        let z1 = -x0 * Math.sin(ring.tiltY) + z0 * Math.cos(ring.tiltY);

        let x2 = x1 * Math.cos(ring.rotZ) - y1 * Math.sin(ring.rotZ);
        let y2 = x1 * Math.sin(ring.rotZ) + y1 * Math.cos(ring.rotZ);
        let z2 = z1;

        pts.push({
          x: this.x + x2,
          y: this.y + y2,
          z: z2
        });
      }

      // Break continuous ring into segments based on depth Z
      let segment = [];
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const isPointInFront = p.z >= 0;

        if (isPointInFront === inFront) {
          segment.push(p);
        } else {
          if (segment.length > 1) {
            this.renderRingSegment(segment, ring);
          }
          segment = [];
        }
      }
      if (segment.length > 1) {
        this.renderRingSegment(segment, ring);
      }
    }

    this.ctx.restore();
  }

  renderRingSegment(segment, ring) {
    if (segment.length < 2) return;

    this.ctx.beginPath();
    this.ctx.moveTo(segment[0].x, segment[0].y);
    for (let i = 1; i < segment.length; i++) {
      this.ctx.lineTo(segment[i].x, segment[i].y);
    }

    // Gradient along segment
    const pStart = segment[0];
    const pEnd = segment[segment.length - 1];
    const grad = this.ctx.createLinearGradient(pStart.x, pStart.y, pEnd.x, pEnd.y);
    grad.addColorStop(0, ring.color1);
    grad.addColorStop(1, ring.color2);

    this.ctx.strokeStyle = grad;
    this.ctx.lineWidth = ring.width;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
  }

  drawParticles(inFront) {
    this.ctx.save();
    this.ctx.globalAlpha = this.particleVisibility;

    for (const p of this.particles) {
      const x = this.x + Math.cos(p.angle) * p.dist;
      const y = this.y + Math.sin(p.angle) * (p.dist * 0.4) + p.yOffset;
      const z = Math.sin(p.angle);

      const isPointInFront = z >= 0;
      if (isPointInFront !== inFront) continue;

      this.ctx.beginPath();
      this.ctx.fillStyle = this.theme === 'dark' ? `rgba(90, 200, 250, ${p.alpha})` : `rgba(10, 10, 10, ${p.alpha})`;
      this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }
}
