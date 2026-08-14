/**
 * KuroBlob AI Expression Generator Engine
 * Powers the "AI Expression Creator Studio" in the web UI.
 * Synthesizes procedural expressions using LLM prompt engineering & built-in procedural shaders.
 */

export class ExpressionGenerator {
  constructor(llmProvider) {
    this.llmProvider = llmProvider;
  }

  /**
   * Generate expression from natural language prompt
   */
  async generate(prompt) {
    const p = prompt.toLowerCase().trim();

    // 1. If Real LLM is active & configured, we can ask the LLM
    if (this.llmProvider && this.llmProvider.isConfigured()) {
      try {
        const sysPrompt = `You are the KuroBlob Procedural Expression Creator Skill.
Generate a valid JSON object matching this schema:
{
  "id": "UPPERCASE_NAME",
  "nameZh": "中文名",
  "nameEn": "English Name",
  "emoji": "emoji",
  "category": "Sci-Fi",
  "body": { "colorStart": "#hex", "colorEnd": "#hex", "glowColor": "rgba(...)", "glowBlur": 20 },
  "eyes": { "style": "PILL", "color": "#hex", "width": 20, "height": 34, "spacing": 72, "tilt": 0.0 },
  "rings": { "enabled": true, "color1": "#hex", "color2": "#hex" },
  "particles": { "enabled": true, "type": "SPARKLE", "count": 12, "color": "#hex" },
  "accessoryType": "COFFEE" | "HACKER" | "CHEF" | "ASTRONAUT" | "WIZARD" | "DRAGON" | "DJ" | "CAT",
  "codeSnippet": "Canvas2D code string for drawAccessory(ctx, t)"
}
Return ONLY valid JSON.`;

        const res = await this.llmProvider.streamChat(
          [{ sender: 'user', text: `Create KuroBlob expression for: "${prompt}"` }],
          () => {},
          () => {}
        );

        const match = res.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          return this.enrichExpression(parsed, p);
        }
      } catch (e) {
        console.warn('LLM expression synthesis failed, falling back to procedural synthesis:', e);
      }
    }

    // 2. High Quality Procedural Synthesis Engine
    return this.synthesizeProceduralExpression(p);
  }

  /**
   * Procedural synthesis with dynamic vector rendering functions
   */
  synthesizeProceduralExpression(p) {
    let exp;

    if (/coffee|咖啡|程序员|geek|码农|写代码/i.test(p)) {
      exp = {
        id: 'COFFEE_DEV',
        nameZh: '咖啡程序员',
        nameEn: 'Coffee Dev',
        emoji: '☕',
        category: 'Character',
        body: { colorStart: '#1E1B4B', colorEnd: '#4338CA', glowColor: 'rgba(99, 102, 241, 0.4)', glowBlur: 22 },
        eyes: { style: 'PILL', color: '#E0E7FF', width: 20, height: 32, spacing: 72, tilt: 0 },
        rings: { enabled: true, color1: '#6366F1', color2: '#A855F7' },
        particles: { enabled: true, type: 'SPARKLE', count: 12, color: '#818CF8' },
        drawAccessory: (ctx, t) => {
          ctx.save();
          // 1. Geek Black-Rimmed Glasses
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 4;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          // Left Lens
          ctx.beginPath();
          ctx.roundRect(-52, -26, 32, 28, 6);
          ctx.fill();
          ctx.stroke();
          // Right Lens
          ctx.beginPath();
          ctx.roundRect(20, -26, 32, 28, 6);
          ctx.fill();
          ctx.stroke();
          // Bridge
          ctx.beginPath();
          ctx.moveTo(-20, -12);
          ctx.lineTo(20, -12);
          ctx.stroke();

          // 2. Steaming Coffee Mug on Bottom Right
          const mugX = 48;
          const mugY = 32;
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(mugX, mugY, 26, 30, 4);
          ctx.fill();
          ctx.stroke();
          // Coffee Logo
          ctx.fillStyle = '#78350F';
          ctx.beginPath();
          ctx.arc(mugX + 13, mugY + 14, 5, 0, Math.PI * 2);
          ctx.fill();
          // Handle
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(mugX + 28, mugY + 14, 7, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();

          // 3. Wavy Steam Particles
          for (let s = 0; s < 3; s++) {
            const steamT = (t * 2 + s * 0.8) % 3;
            const steamY = mugY - 4 - steamT * 12;
            const steamX = mugX + 13 + Math.sin(t * 4 + s) * 4;
            const alpha = Math.max(0, 1 - steamT / 3);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(steamX, steamY, 4, 0, Math.PI);
            ctx.stroke();
          }
          ctx.restore();
        }
      };
    } else if (/hacker|黑客|赛博|cyber/i.test(p)) {
      exp = {
        id: 'CYBER_HACKER',
        nameZh: '赛博黑客',
        nameEn: 'Cyber Hacker',
        emoji: '🕶️',
        category: 'Sci-Fi',
        body: { colorStart: '#0F172A', colorEnd: '#0284C7', glowColor: 'rgba(56, 189, 248, 0.45)', glowBlur: 24 },
        eyes: { style: 'PILL', color: '#38BDF8', width: 22, height: 36, spacing: 74, tilt: 0.1 },
        rings: { enabled: true, color1: '#00F2FE', color2: '#4FACFE' },
        particles: { enabled: true, type: 'MATRIX_CODE', count: 16, color: '#38BDF8' },
        drawAccessory: (ctx, t) => {
          ctx.save();
          ctx.fillStyle = 'rgba(2, 132, 199, 0.88)';
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#00F2FE';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.roundRect(-62, -24, 124, 26, 6);
          ctx.fill();
          ctx.stroke();
          const scanY = -22 + (Math.sin(t * 5) * 0.5 + 0.5) * 22;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-58, scanY);
          ctx.lineTo(58, scanY);
          ctx.stroke();
          ctx.restore();
        }
      };
    } else if (/chef|厨师|拉面|吃|food/i.test(p)) {
      exp = {
        id: 'CHEF_RAMEN',
        nameZh: '拉面大厨',
        nameEn: 'Ramen Chef',
        emoji: '🍜',
        category: 'Character',
        body: { colorStart: '#EA580C', colorEnd: '#FBBF24', glowColor: 'rgba(251, 191, 36, 0.45)', glowBlur: 20 },
        eyes: { style: 'CRESCENT', color: '#78350F', width: 20, height: 30, spacing: 70, tilt: 0.1 },
        rings: { enabled: true, color1: '#F97316', color2: '#FBBF24' },
        particles: { enabled: true, type: 'SPARKLE', count: 10, color: '#FBBF24' },
        drawAccessory: (ctx, t) => {
          ctx.save();
          // White Chef Hat
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-45, -70);
          ctx.quadraticCurveTo(-60, -115, -20, -118);
          ctx.quadraticCurveTo(0, -130, 20, -118);
          ctx.quadraticCurveTo(60, -115, 45, -70);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Hat Brim Band
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.roundRect(-42, -74, 84, 12, 3);
          ctx.fill();
          ctx.restore();
        }
      };
    } else if (/astronaut|宇航员|太空|space/i.test(p)) {
      exp = {
        id: 'ASTRONAUT',
        nameZh: '太空宇航员',
        nameEn: 'Astronaut',
        emoji: '🚀',
        category: 'Sci-Fi',
        body: { colorStart: '#1E293B', colorEnd: '#3B82F6', glowColor: 'rgba(59, 130, 246, 0.4)', glowBlur: 24 },
        eyes: { style: 'STAR', color: '#93C5FD', width: 24, height: 36, spacing: 76, tilt: 0 },
        rings: { enabled: true, color1: '#60A5FA', color2: '#93C5FD' },
        particles: { enabled: true, type: 'SPARKLE', count: 18, color: '#93C5FD' },
        drawAccessory: (ctx, t) => {
          ctx.save();
          // Glass Space Helmet Bubble
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 4;
          ctx.fillStyle = 'rgba(147, 197, 253, 0.18)';
          ctx.beginPath();
          ctx.arc(0, 0, 94, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Visor Light Reflection Arc
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(-20, -30, 60, -Math.PI * 0.7, -Math.PI * 0.3);
          ctx.stroke();
          ctx.restore();
        }
      };
    } else if (/dragon|恐龙|火|flame|dragon/i.test(p)) {
      exp = {
        id: 'FIRE_DRAGON',
        nameZh: '喷火小恐龙',
        nameEn: 'Fire Dragon',
        emoji: '🐉',
        category: 'Animal',
        body: { colorStart: '#DC2626', colorEnd: '#F97316', glowColor: 'rgba(239, 68, 68, 0.5)', glowBlur: 24 },
        eyes: { style: 'STERN', color: '#FEF08A', width: 22, height: 38, spacing: 74, tilt: 0.25 },
        rings: { enabled: true, color1: '#EF4444', color2: '#F59E0B' },
        particles: { enabled: true, type: 'FLAME', count: 18, color: '#EF4444' },
        drawAccessory: (ctx, t) => {
          ctx.save();
          // Golden Dragon Horns
          ctx.fillStyle = '#F59E0B';
          ctx.strokeStyle = '#B45309';
          ctx.lineWidth = 2.5;
          // Left Horn
          ctx.beginPath();
          ctx.moveTo(-45, -60);
          ctx.quadraticCurveTo(-70, -100, -55, -115);
          ctx.quadraticCurveTo(-40, -95, -30, -68);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Right Horn
          ctx.beginPath();
          ctx.moveTo(45, -60);
          ctx.quadraticCurveTo(70, -100, 55, -115);
          ctx.quadraticCurveTo(40, -95, 30, -68);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      };
    } else {
      // Default Creative Wizard
      exp = {
        id: 'MAGIC_WIZARD',
        nameZh: '魔法小巫师',
        nameEn: 'Magic Wizard',
        emoji: '🧙',
        category: 'Special',
        body: { colorStart: '#6D28D9', colorEnd: '#EC4899', glowColor: 'rgba(236, 72, 153, 0.45)', glowBlur: 22 },
        eyes: { style: 'STAR', color: '#FDF4FF', width: 22, height: 36, spacing: 72, tilt: 0 },
        rings: { enabled: true, color1: '#C084FC', color2: '#F472B6' },
        particles: { enabled: true, type: 'SPARKLE', count: 15, color: '#F472B6' },
        drawAccessory: (ctx, t) => {
          ctx.save();
          // Pointed Wizard Hat
          ctx.fillStyle = '#4C1D95';
          ctx.strokeStyle = '#C084FC';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-58, -62);
          ctx.quadraticCurveTo(-20, -130, 25 + Math.sin(t * 2) * 5, -145);
          ctx.quadraticCurveTo(15, -100, 58, -62);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // Gold Star on Hat Tip
          ctx.fillStyle = '#FDE047';
          ctx.beginPath();
          ctx.arc(25 + Math.sin(t * 2) * 5, -145, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      };
    }

    return this.enrichExpression(exp, p);
  }

  enrichExpression(exp, prompt) {
    const code = `// KuroBlob Expression: ${exp.nameEn} (${exp.nameZh})
export const ${exp.id}_EXPRESSION = {
  id: '${exp.id}',
  nameZh: '${exp.nameZh}',
  nameEn: '${exp.nameEn}',
  emoji: '${exp.emoji}',
  body: ${JSON.stringify(exp.body, null, 2)},
  eyes: ${JSON.stringify(exp.eyes, null, 2)},
  rings: ${JSON.stringify(exp.rings, null, 2)},
  drawAccessory: ${exp.drawAccessory ? exp.drawAccessory.toString() : 'null'}
};`;

    return {
      ...exp,
      code
    };
  }
}
