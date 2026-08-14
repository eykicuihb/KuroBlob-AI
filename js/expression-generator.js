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
    let llmResult = null;

    // 1. If Real LLM is active & configured, invoke LLM with Creator Skill Prompt
    if (this.llmProvider && this.llmProvider.isConfigured()) {
      try {
        const sysPrompt = `You are the KuroBlob Procedural Expression Creator Skill.
Generate a valid JSON object matching this schema:
{
  "id": "UPPERCASE_ID",
  "nameZh": "中文名称",
  "nameEn": "English Name",
  "emoji": "emoji",
  "category": "Character",
  "body": { "colorStart": "#HEX", "colorEnd": "#HEX", "glowColor": "rgba(...)", "glowBlur": 22 },
  "eyes": { "style": "PILL", "color": "#HEX", "width": 20, "height": 34, "spacing": 72, "tilt": 0.0 },
  "rings": { "enabled": true, "color1": "#HEX", "color2": "#HEX" },
  "particles": { "enabled": true, "type": "SPARKLE", "count": 14, "color": "#HEX" }
}
Output ONLY the raw JSON without markdown.`;

        const rawText = await this.llmProvider.generateJson(sysPrompt, `Create KuroBlob expression for: "${prompt}"`);
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          llmResult = JSON.parse(match[0]);
        }
      } catch (e) {
        console.warn('LLM expression synthesis fallback to procedural engine:', e);
      }
    }

    // 2. Synthesize with High-Fidelity Procedural Vector Shaders
    return this.synthesizeProceduralExpression(p, llmResult);
  }

  /**
   * Procedural synthesis with dynamic vector rendering functions
   */
  synthesizeProceduralExpression(p, llmResult = null) {
    let exp;

    // A. Beach Bikini / Summer Vacation (海边比基尼 / 夏日沙滩)
    if (/bikini|比基尼|海边|沙滩|夏日|泳装|度假|beach|summer|ocean/i.test(p)) {
      exp = {
        id: 'BEACH_BIKINI',
        nameZh: '海边比基尼',
        nameEn: 'Beach Bikini',
        emoji: '👙',
        category: 'Special',
        body: {
          colorStart: '#0284C7', // Ocean Blue
          colorEnd: '#F43F5E',   // Tropical Sunset Pink
          glowColor: 'rgba(244, 63, 94, 0.45)',
          glowBlur: 24
        },
        eyes: {
          style: 'PILL',
          color: '#FFF1F2',
          width: 20,
          height: 32,
          spacing: 70,
          tilt: 0.08
        },
        rings: {
          enabled: true,
          color1: '#38BDF8',
          color2: '#FB7185'
        },
        particles: {
          enabled: true,
          type: 'SPARKLE',
          count: 16,
          color: '#38BDF8'
        },
        drawAccessory: (ctx, t) => {
          ctx.save();

          // 1. Tropical Pink Hibiscus Flower on Head (Top Left)
          const flowerX = -52;
          const flowerY = -62 + Math.sin(t * 2) * 2;
          ctx.fillStyle = '#F43F5E';
          ctx.strokeStyle = '#BE123C';
          ctx.lineWidth = 1.5;
          for (let petal = 0; petal < 5; petal++) {
            const angle = (petal / 5) * Math.PI * 2;
            const px = flowerX + Math.cos(angle) * 14;
            const py = flowerY + Math.sin(angle) * 14;
            ctx.beginPath();
            ctx.arc(px, py, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          // Flower Gold Core
          ctx.fillStyle = '#FDE047';
          ctx.beginPath();
          ctx.arc(flowerX, flowerY, 6, 0, Math.PI * 2);
          ctx.fill();

          // 2. Chic Retro Summer Sunglasses across eyes (Y: -22)
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.strokeStyle = '#F43F5E';
          ctx.lineWidth = 3;
          // Left Lens
          ctx.beginPath();
          ctx.roundRect(-52, -26, 34, 28, 8);
          ctx.fill();
          ctx.stroke();
          // Right Lens
          ctx.beginPath();
          ctx.roundRect(18, -26, 34, 28, 8);
          ctx.fill();
          ctx.stroke();
          // Frame Bridge
          ctx.beginPath();
          ctx.moveTo(-18, -12);
          ctx.lineTo(18, -12);
          ctx.stroke();

          // Lens Glint Reflection
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-45, -20);
          ctx.lineTo(-30, -6);
          ctx.moveTo(25, -20);
          ctx.lineTo(40, -6);
          ctx.stroke();

          // 3. Cute Tropical Beach Bikini Top with Ribbon Bow (Y: +38)
          ctx.fillStyle = '#EC4899';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          // Left Bikini Cup
          ctx.beginPath();
          ctx.arc(-22, 38, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Right Bikini Cup
          ctx.beginPath();
          ctx.arc(22, 38, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Center Ribbon Bow
          ctx.fillStyle = '#FDE047';
          ctx.beginPath();
          ctx.arc(0, 38, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      };
    }
    // B. Coffee Programmer (咖啡程序员)
    else if (/coffee|咖啡|程序员|geek|码农|写代码|code/i.test(p)) {
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
          // Geek Glasses
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 4;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.beginPath();
          ctx.roundRect(-52, -26, 32, 28, 6);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.roundRect(20, -26, 32, 28, 6);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-20, -12);
          ctx.lineTo(20, -12);
          ctx.stroke();

          // Steaming Coffee Mug
          const mugX = 48;
          const mugY = 32;
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(mugX, mugY, 26, 30, 4);
          ctx.fill();
          ctx.stroke();
          // Handle
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(mugX + 28, mugY + 14, 7, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();

          // Steam
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
    }
    // C. Cyber Hacker (赛博黑客)
    else if (/hacker|黑客|赛博|cyber/i.test(p)) {
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
    }
    // D. Ramen Chef (拉面大厨)
    else if (/chef|厨师|拉面|food|cook/i.test(p)) {
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
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.roundRect(-42, -74, 84, 12, 3);
          ctx.fill();
          ctx.restore();
        }
      };
    }
    // E. Astronaut (太空宇航员)
    else if (/astronaut|宇航员|太空|space/i.test(p)) {
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
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 4;
          ctx.fillStyle = 'rgba(147, 197, 253, 0.18)';
          ctx.beginPath();
          ctx.arc(0, 0, 94, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(-20, -30, 60, -Math.PI * 0.7, -Math.PI * 0.3);
          ctx.stroke();
          ctx.restore();
        }
      };
    }
    // F. General Creative Theme
    else {
      exp = {
        id: 'CREATIVE_STAR',
        nameZh: '创意之星',
        nameEn: 'Creative Star',
        emoji: '✨',
        category: 'Special',
        body: { colorStart: '#6D28D9', colorEnd: '#EC4899', glowColor: 'rgba(236, 72, 153, 0.45)', glowBlur: 22 },
        eyes: { style: 'STAR', color: '#FDF4FF', width: 22, height: 36, spacing: 72, tilt: 0 },
        rings: { enabled: true, color1: '#C084FC', color2: '#F472B6' },
        particles: { enabled: true, type: 'SPARKLE', count: 15, color: '#F472B6' },
        drawAccessory: (ctx, t) => {
          ctx.save();
          // Sparkling Golden Crown / Tiara
          ctx.fillStyle = '#FDE047';
          ctx.strokeStyle = '#CA8A04';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-36, -72);
          ctx.lineTo(-44, -100);
          ctx.lineTo(-18, -84);
          ctx.lineTo(0, -108 + Math.sin(t * 3) * 3);
          ctx.lineTo(18, -84);
          ctx.lineTo(44, -100);
          ctx.lineTo(36, -72);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      };
    }

    // Merge LLM styling if returned
    if (llmResult) {
      if (llmResult.nameZh) exp.nameZh = llmResult.nameZh;
      if (llmResult.nameEn) exp.nameEn = llmResult.nameEn;
      if (llmResult.emoji) exp.emoji = llmResult.emoji;
      if (llmResult.body) exp.body = { ...exp.body, ...llmResult.body };
      if (llmResult.eyes) exp.eyes = { ...exp.eyes, ...llmResult.eyes };
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
