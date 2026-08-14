---
name: kuroblob-expression-creator
description: >-
  Expert procedural expression and character creator for KuroBlob AI.
  Use when asked to create, design, generate, or customize a new procedural emotion,
  character skin, animated accessory, or interactive state for the KuroBlob avatar.
---

# KuroBlob Procedural Expression Creator Skill

This skill guides AI agents in generating production-grade, mathematically fluid procedural emotions and character expressions for **KuroBlob AI** (the physics-driven 2D/3D Canvas avatar).

---

## 🎭 Expression Anatomy & Specification

Every KuroBlob expression consists of **6 tightly coupled layers**:

```
[ Layer 1: Background FX / Orbital Energy Rings / Weather Elements ]
       ↓
[ Layer 2: Blob Body (Spring-mass 16-point Bezier Mesh Morphing) ]
       ↓
[ Layer 3: Dynamic Blush / Cheeks / Facial Markings ]
       ↓
[ Layer 4: Capsule Eyes (Pill / Crescent / Stern / Circle / Star) + 3D Gaze Parallax ]
       ↓
[ Layer 5: Expressive Mouth / Lip-Sync / Teeth ]
       ↓
[ Layer 6: Accessory & Props Layer (Vector Canvas 2D) + Floating Particles ]
```

---

## 📐 Coordinate System & Physics Rules

1. **Center of Origin `(0, 0)`**:
   - All drawing operations in `drawAccessory()` and custom layers assume the origin `(0, 0)` is at the exact center of the Blob body.
   - Base Blob body radius: $R = 80\text{px}$.
   - Top of head: $(0, -80)$ to $(0, -90)$.
   - Eye level: $Y \approx -12\text{px}$.
   - Chin / Bottom: $Y \approx +80\text{px}$.
   - Left side: $X \approx -80\text{px}$; Right side: $X \approx +80\text{px}$.

2. **Animation Clock Variable `t`**:
   - Access current time with `const t = this.time;` (seconds elapsed).
   - Use sine/cosine harmonic frequencies:
     - Breathing / Idle float: `Math.sin(t * 2) * 4`
     - Fast vibration / Shaking: `Math.sin(t * 15) * 6`
     - Wave / Floating oscillation: `Math.cos(t * 3 + index * 0.5)`

3. **Canvas 2D State Hygiene**:
   - **ALWAYS** wrap accessory drawing in `this.ctx.save()` and `this.ctx.restore()`.
   - Never leave unclosed paths or active global transforms.

---

## 🛠️ Procedural Expression Template (JavaScript Module)

When creating a new expression, output a self-contained definition matching the standard format:

```javascript
export const EXPRESSION_DEFINITION = {
  // 1. Identity & Metadata
  id: 'CYBER_HACKER',
  nameZh: '赛博黑客',
  nameEn: 'Cyber Hacker',
  emoji: '🕶️',
  category: 'Sci-Fi', // 'Core' | 'Elemental' | 'Character' | 'Animal' | 'Sci-Fi' | 'Special'

  // 2. Body Colors & Gradients
  body: {
    colorStart: '#0F172A',
    colorEnd: '#0284C7',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    glowBlur: 24,
    // 16-point Bezier Radius Modifier: f(angle, time, baseRadius)
    radiusFormula: (angle, t, R) => {
      // Example: subtle hexagonal cyber pulsation
      const pulse = Math.sin(angle * 6 + t * 4) * 5;
      return R + pulse;
    }
  },

  // 3. Eyes & Gaze Configuration
  eyes: {
    style: 'PILL', // 'PILL' | 'CRESCENT' | 'STERN' | 'CIRCLE' | 'STAR'
    color: '#38BDF8',
    width: 22,
    height: 38,
    spacing: 76,
    tilt: 0.1, // Radians (-0.5 to 0.5)
    rotation: 0
  },

  // 4. Orbital Rings & Particles
  rings: {
    enabled: true,
    speedX: 0.8,
    speedY: 2.2,
    color1: '#00F2FE',
    color2: '#4FACFE',
    radiusX: 130,
    radiusY: 42,
    tilt: 0.35
  },
  particles: {
    enabled: true,
    type: 'MATRIX_CODE', // 'SPARKLE' | 'FLAME' | 'HEART' | 'RAIN' | 'NOTE' | 'MATRIX_CODE'
    count: 14,
    color: '#38BDF8'
  },

  // 5. Custom Vector Accessory Layer (Canvas 2D)
  drawAccessory(ctx, t) {
    ctx.save();
    // Cyberpunk Visor across eyes (Y: -22 to -2)
    ctx.fillStyle = 'rgba(2, 132, 199, 0.85)';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00F2FE';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.roundRect(-62, -24, 124, 26, 6);
    ctx.fill();
    ctx.stroke();

    // Glowing Neon Scanline
    const scanY = -22 + (Math.sin(t * 5) * 0.5 + 0.5) * 22;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-58, scanY);
    ctx.lineTo(58, scanY);
    ctx.stroke();
    ctx.restore();
  },

  // 6. NLP Triggers & Contextual Dialogue Responses
  nlp: {
    keywordsZh: ['黑客', '赛博朋克', '代码', '侵入', '防火墙', '终端'],
    keywordsEn: ['hacker', 'cyberpunk', 'hack', 'matrix', 'firewall', 'terminal'],
    responsesZh: [
      '系统矩阵已链接，正在突破底层安全防线！💻',
      '赛博黑客模式激活，终端数据流正在高速解密中... 🕶️'
    ],
    responsesEn: [
      'Access granted! Cyber matrix stream synchronized. 💻',
      'Cyberpunk hacker mode engaged. Decrypting security nodes... 🕶️'
    ]
  }
};
```

---

## 📋 Step-by-Step Workflow for AI Agents

1. **Analyze User Intent**:
   - Determine theme (Animal, Weather, Sci-Fi, Magic, Emotion, Job).
   - Choose a vibrant, modern color scheme (Dark + Neon, Pastel, Kawaii, Elemental).

2. **Compose Canvas 2D Vector Geometry**:
   - Draw props relative to origin `(0, 0)`.
   - Incorporate time variable `t` for micro-animations (e.g., flutter, glow pulsation, floating tilt).

3. **Verify Canvas Commands**:
   - Run `node .agents/skills/kuroblob-expression-creator/scripts/validate_expression.js <path-to-file>` to guarantee syntax and zero runtime exceptions.

4. **Register with App**:
   - Run `node avatar-dialogue-app/scripts/register_expression.js <expression-id>` to automatically mount into the live web application.
