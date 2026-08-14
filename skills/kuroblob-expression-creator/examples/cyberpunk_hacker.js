/**
 * Example Expression: Cyberpunk Hacker
 * Demonstrates glowing neon visor, cybernetic scanlines, and matrix particles.
 */

export const EXPRESSION_DEFINITION = {
  id: 'CYBER_HACKER',
  nameZh: '赛博黑客',
  nameEn: 'Cyber Hacker',
  emoji: '🕶️',
  category: 'Sci-Fi',

  body: {
    colorStart: '#0F172A',
    colorEnd: '#0284C7',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    glowBlur: 24,
    radiusFormula: (angle, t, R) => {
      // Hexagonal cyber pulsation
      const pulse = Math.sin(angle * 6 + t * 4) * 4;
      return R + pulse;
    }
  },

  eyes: {
    style: 'PILL',
    color: '#38BDF8',
    width: 22,
    height: 36,
    spacing: 74,
    tilt: 0.1,
    rotation: 0
  },

  rings: {
    enabled: true,
    speedX: 1.2,
    speedY: 2.5,
    color1: '#00F2FE',
    color2: '#4FACFE',
    radiusX: 135,
    radiusY: 44,
    tilt: 0.35
  },

  particles: {
    enabled: true,
    type: 'MATRIX_CODE',
    count: 16,
    color: '#38BDF8'
  },

  drawAccessory(ctx, t) {
    ctx.save();
    // 1. Cyberpunk Visor across eyes (Y: -24 to +2)
    ctx.fillStyle = 'rgba(2, 132, 199, 0.88)';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00F2FE';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.roundRect(-62, -24, 124, 26, 6);
    ctx.fill();
    ctx.stroke();

    // 2. Glowing Neon Scanline
    const scanY = -22 + (Math.sin(t * 5) * 0.5 + 0.5) * 22;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-58, scanY);
    ctx.lineTo(58, scanY);
    ctx.stroke();

    // 3. Cybernetic Antenna on Right Side
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(56, -45);
    ctx.lineTo(72, -75);
    ctx.stroke();

    // Flashing Beacon LED
    ctx.fillStyle = (Math.sin(t * 8) > 0) ? '#00F2FE' : '#EF4444';
    ctx.beginPath();
    ctx.arc(72, -75, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  nlp: {
    keywordsZh: ['黑客', '赛博朋克', '代码', '侵入', '防火墙', '终端', '矩阵'],
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
