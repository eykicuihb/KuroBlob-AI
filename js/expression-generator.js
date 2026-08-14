/**
 * KuroBlob AI Dynamic Expression Generator Engine
 * Generates custom procedural expressions & live Canvas 2D drawAccessory(ctx, t) code
 * directly from natural language prompts using LLMs or the dynamic procedural compiler.
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

    // 1. If Real LLM is active & configured, ask LLM
    if (this.llmProvider && this.llmProvider.isConfigured()) {
      try {
        const sysPrompt = `You are the KuroBlob Procedural Expression Creator Skill for a living 2D/3D Canvas avatar.
Coordinates: Origin (0,0) is center. Body radius is 80px. Top of head is (0, -80). Eyes are at (-36, -12) and (36, -12).
Write standard JavaScript Canvas2D drawing commands in 'drawAccessoryCode' using 'ctx' and time 't' (e.g. ctx.save(); ctx.fillStyle = '#...'; ctx.beginPath(); ctx.arc(...); ctx.fill(); ctx.restore();).

Return ONLY a JSON object:
{
  "id": "UPPERCASE_ID",
  "nameZh": "中文名称",
  "nameEn": "English Name",
  "emoji": "emoji",
  "props": ["list", "of", "visual", "elements"],
  "body": { "colorStart": "#HEX", "colorEnd": "#HEX", "glowColor": "rgba(...)", "glowBlur": 22 },
  "eyes": { "style": "PILL" | "CRESCENT" | "STERN" | "CIRCLE" | "STAR", "color": "#HEX", "width": 20, "height": 34, "spacing": 72, "tilt": 0.0 },
  "rings": { "enabled": true, "color1": "#HEX", "color2": "#HEX" },
  "particles": { "enabled": true, "type": "SPARKLE" | "FLAME" | "MATRIX_CODE", "count": 14, "color": "#HEX" },
  "drawAccessoryCode": "ctx.save(); ctx.fillStyle = '#FF4081'; ctx.beginPath(); ctx.arc(0, -85, 12, 0, Math.PI*2); ctx.fill(); ctx.restore();"
}`;

        const rawText = await this.llmProvider.generateJson(sysPrompt, `Create KuroBlob expression for: "${prompt}"`);
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            llmResult = JSON.parse(match[0]);
          } catch (e) {
            try {
              // Loose JSON parse fallback
              llmResult = new Function(`return (${match[0]})`)();
            } catch (e2) {}
          }
        }
      } catch (e) {
        console.warn('LLM synthesis fallback to dynamic procedural vector compiler:', e);
      }
    }

    // 2. If LLM provided real, valid Canvas2D code (containing ctx. operations), test and use it
    if (llmResult && typeof llmResult.drawAccessoryCode === 'string' && llmResult.drawAccessoryCode.includes('ctx.')) {
      try {
        const drawFn = new Function('ctx', 't', llmResult.drawAccessoryCode);
        drawFn({
          save(){}, restore(){}, beginPath(){}, closePath(){},
          moveTo(){}, lineTo(){}, arc(){}, fill(){}, stroke(){},
          quadraticCurveTo(){}, bezierCurveTo(){}, roundRect(){},
          fillStyle:'', strokeStyle:'', lineWidth:1, shadowColor:'', shadowBlur:0
        }, 1.0);

        return {
          id: llmResult.id || 'CUSTOM_EXP',
          nameZh: llmResult.nameZh || prompt,
          nameEn: llmResult.nameEn || 'Custom Expression',
          emoji: llmResult.emoji || '✨',
          category: llmResult.category || 'Special',
          body: llmResult.body || { colorStart: '#4F46E5', colorEnd: '#06B6D4', glowColor: 'rgba(6, 182, 212, 0.4)', glowBlur: 20 },
          eyes: llmResult.eyes || { style: 'PILL', color: '#FFFFFF', width: 20, height: 34, spacing: 72, tilt: 0 },
          rings: llmResult.rings || { enabled: true, color1: '#00F2FE', color2: '#4FACFE' },
          particles: llmResult.particles || { enabled: true, type: 'SPARKLE', count: 12, color: '#00F2FE' },
          drawAccessory: drawFn,
          code: `// Generated via LLM by KuroBlob Expression Creator Skill\nexport const ${llmResult.id || 'CUSTOM'}_EXPRESSION = {\n  id: '${llmResult.id}',\n  nameZh: '${llmResult.nameZh}',\n  nameEn: '${llmResult.nameEn}',\n  emoji: '${llmResult.emoji}',\n  body: ${JSON.stringify(llmResult.body, null, 2)},\n  eyes: ${JSON.stringify(llmResult.eyes, null, 2)},\n  rings: ${JSON.stringify(llmResult.rings, null, 2)},\n  drawAccessory: function(ctx, t) {\n${llmResult.drawAccessoryCode}\n  }\n};`
        };
      } catch (err) {
        console.warn('LLM drawAccessoryCode was not valid executable Canvas2D, using hybrid vector synthesis:', err);
      }
    }

    // 3. Dynamic Hybrid Procedural Vector Synthesizer (Generates unique Canvas2D code from prompt + LLM semantic output)
    return this.synthesizeDynamicProceduralExpression(p, llmResult);
  }

  /**
   * Dynamic procedural vector code compiler that generates custom Canvas 2D code from prompt keywords
   */
  synthesizeDynamicProceduralExpression(p, llmResult = null) {
    const drawingSteps = [];
    
    // Combine keywords from user prompt + any LLM extracted semantic tokens
    let combinedText = p;
    if (llmResult) {
      if (typeof llmResult.nameZh === 'string') combinedText += ' ' + llmResult.nameZh;
      if (typeof llmResult.nameEn === 'string') combinedText += ' ' + llmResult.nameEn;
      if (Array.isArray(llmResult.props)) combinedText += ' ' + llmResult.props.join(' ');
      if (Array.isArray(llmResult.accessories)) combinedText += ' ' + llmResult.accessories.join(' ');
      if (typeof llmResult.attire === 'string') combinedText += ' ' + llmResult.attire;
    }
    const ct = combinedText.toLowerCase();

    let id = llmResult?.id || 'CUSTOM_EXP';
    let nameZh = llmResult?.nameZh || '自定义创意表情';
    let nameEn = llmResult?.nameEn || 'Custom Expression';
    let emoji = llmResult?.emoji || '✨';
    let colorStart = llmResult?.body?.colorStart || '#4F46E5';
    let colorEnd = llmResult?.body?.colorEnd || '#06B6D4';
    let glowColor = llmResult?.body?.glowColor || 'rgba(6, 182, 212, 0.4)';
    let eyeStyle = llmResult?.eyes?.style || 'PILL';
    let eyeColor = llmResult?.eyes?.color || '#FFFFFF';
    let particleType = llmResult?.particles?.type || 'SPARKLE';
    let particleColor = llmResult?.particles?.color || '#00F2FE';

    // A. Headgear & Ear Accessories
    if (/duck|鸭|小黄鸭/i.test(ct)) {
      emoji = '🐥';
      drawingSteps.push(`
  // --- Cute Rubber Duck on Head ---
  const duckY = -86 + Math.sin(t * 3) * 3;
  ctx.fillStyle = '#FBBF24';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, duckY, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#F97316';
  ctx.beginPath();
  ctx.moveTo(10, duckY - 2);
  ctx.lineTo(22, duckY + 1);
  ctx.lineTo(10, duckY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(4, duckY - 4, 2, 0, Math.PI * 2);
  ctx.fill();`);
    }

    if (/cat|neko|猫|喵/i.test(ct)) {
      emoji = '🐱';
      if (!llmResult) {
        colorStart = '#1E1B4B';
        colorEnd = '#4338CA';
        glowColor = 'rgba(99, 102, 241, 0.4)';
      }
      drawingSteps.push(`
  // --- Cute Neko Cat Ears ---
  ctx.fillStyle = '#4338CA';
  ctx.strokeStyle = '#6366F1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-60, -55);
  ctx.lineTo(-75, -105);
  ctx.lineTo(-30, -78);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#F472B6';
  ctx.beginPath();
  ctx.moveTo(-58, -60);
  ctx.lineTo(-68, -95);
  ctx.lineTo(-38, -75);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#4338CA';
  ctx.beginPath();
  ctx.moveTo(60, -55);
  ctx.lineTo(75, -105);
  ctx.lineTo(30, -78);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#F472B6';
  ctx.beginPath();
  ctx.moveTo(58, -60);
  ctx.lineTo(68, -95);
  ctx.lineTo(38, -75);
  ctx.closePath();
  ctx.fill();`);
    }

    if (/crown|皇冠|国王|queen|king|王冠|贵族/i.test(ct)) {
      emoji = '👑';
      if (!llmResult) {
        colorStart = '#7C2D12';
        colorEnd = '#F59E0B';
        glowColor = 'rgba(245, 158, 11, 0.45)';
      }
      drawingSteps.push(`
  // --- Royal Golden Crown ---
  ctx.fillStyle = '#FDE047';
  ctx.strokeStyle = '#CA8A04';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-45, -72);
  ctx.lineTo(-55, -105);
  ctx.lineTo(-20, -88);
  ctx.lineTo(0, -115 + Math.sin(t * 3) * 3);
  ctx.lineTo(20, -88);
  ctx.lineTo(55, -105);
  ctx.lineTo(45, -72);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(0, -80, 5, 0, Math.PI * 2);
  ctx.fill();`);
    }

    if (/chef|厨师|拉面|煮|料理|cook/i.test(ct)) {
      emoji = '🍜';
      if (!llmResult) {
        colorStart = '#EA580C';
        colorEnd = '#FBBF24';
        glowColor = 'rgba(251, 191, 36, 0.45)';
        eyeStyle = 'CRESCENT';
      }
      drawingSteps.push(`
  // --- Chef Hat ---
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
  ctx.fill();`);
    }

    if (/astronaut|宇航员|太空|space|helmet/i.test(ct)) {
      emoji = '🚀';
      if (!llmResult) {
        colorStart = '#1E293B';
        colorEnd = '#3B82F6';
        glowColor = 'rgba(59, 130, 246, 0.4)';
        eyeStyle = 'STAR';
      }
      drawingSteps.push(`
  // --- Space Helmet Bubble ---
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 4;
  ctx.fillStyle = 'rgba(147, 197, 253, 0.18)';
  ctx.beginPath();
  ctx.arc(0, 0, 94, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();`);
    }

    if (/wizard|magic|巫师|魔法/i.test(ct)) {
      emoji = '🧙';
      if (!llmResult) {
        colorStart = '#6D28D9';
        colorEnd = '#EC4899';
        glowColor = 'rgba(236, 72, 153, 0.45)';
        eyeStyle = 'STAR';
      }
      drawingSteps.push(`
  // --- Pointed Wizard Hat ---
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
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(25 + Math.sin(t * 2) * 5, -145, 6, 0, Math.PI * 2);
  ctx.fill();`);
    }

    if (/dragon|dinosaur|恐龙|龙|flame/i.test(ct)) {
      emoji = '🐉';
      if (!llmResult) {
        colorStart = '#DC2626';
        colorEnd = '#F97316';
        glowColor = 'rgba(239, 68, 68, 0.5)';
        eyeStyle = 'STERN';
        particleType = 'FLAME';
        particleColor = '#EF4444';
      }
      drawingSteps.push(`
  // --- Dragon Horns ---
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-45, -60);
  ctx.quadraticCurveTo(-70, -100, -55, -115);
  ctx.quadraticCurveTo(-40, -95, -30, -68);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(45, -60);
  ctx.quadraticCurveTo(70, -100, 55, -115);
  ctx.quadraticCurveTo(40, -95, 30, -68);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();`);
    }

    // B. Eyewear & Face Props
    if (/glasses|黑框|眼镜/i.test(ct) || (/geek|programmer|程序员|码农/i.test(ct) && !/hacker|黑客/i.test(ct))) {
      drawingSteps.push(`
  // --- Geek Glasses ---
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
  ctx.stroke();`);
    }

    if (/hacker|黑客|赛博|cyber|visor/i.test(ct)) {
      emoji = '🕶️';
      eyeStyle = 'PILL';
      eyeColor = '#38BDF8';
      particleType = 'MATRIX_CODE';
      particleColor = '#38BDF8';
      drawingSteps.push(`
  // --- Cyberpunk Neon Visor ---
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
  ctx.stroke();`);
    }

    if (/bikini|比基尼|海边|沙滩|夏日|泳装|度假|beach|summer|ocean/i.test(ct)) {
      emoji = '👙';
      if (!llmResult) {
        colorStart = '#0284C7';
        colorEnd = '#F43F5E';
        glowColor = 'rgba(244, 63, 94, 0.45)';
        particleColor = '#38BDF8';
      }
      drawingSteps.push(`
  // --- Tropical Hibiscus Flower ---
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
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(flowerX, flowerY, 6, 0, Math.PI * 2);
  ctx.fill();

  // --- Chic Sunglasses ---
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.strokeStyle = '#F43F5E';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-52, -26, 34, 28, 8);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(18, -26, 34, 28, 8);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-18, -12);
  ctx.lineTo(18, -12);
  ctx.stroke();

  // --- Tropical Bikini Top ---
  ctx.fillStyle = '#EC4899';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-22, 38, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(22, 38, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(0, 38, 5, 0, Math.PI * 2);
  ctx.fill();`);
    }

    // C. Handheld / Props
    if (/coffee|咖啡|mug/i.test(ct)) {
      emoji = '☕';
      drawingSteps.push(`
  // --- Steaming Coffee Mug ---
  const mugX = 48;
  const mugY = 32;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(mugX, mugY, 26, 30, 4);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(mugX + 28, mugY + 14, 7, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  for (let s = 0; s < 3; s++) {
    const steamT = (t * 2 + s * 0.8) % 3;
    const steamY = mugY - 4 - steamT * 12;
    const steamX = mugX + 13 + Math.sin(t * 4 + s) * 4;
    const alpha = Math.max(0, 1 - steamT / 3);
    ctx.strokeStyle = \`rgba(255, 255, 255, \${alpha * 0.7})\`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(steamX, steamY, 4, 0, Math.PI);
    ctx.stroke();
  }`);
    }

    // Fallback if no specific props matched
    if (drawingSteps.length === 0) {
      drawingSteps.push(`
  // --- Sparkling Floating Star Accessory ---
  ctx.fillStyle = '#FDE047';
  ctx.strokeStyle = '#CA8A04';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, -82 + Math.sin(t * 3) * 4, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();`);
    }

    const drawAccessoryCode = `ctx.save();\n${drawingSteps.join('\n')}\nctx.restore();`;
    const drawFn = new Function('ctx', 't', drawAccessoryCode);

    return {
      id,
      nameZh,
      nameEn,
      emoji,
      category: 'Character',
      body: { colorStart, colorEnd, glowColor, glowBlur: 22 },
      eyes: { style: eyeStyle, color: eyeColor, width: 20, height: 34, spacing: 72, tilt: 0 },
      rings: { enabled: true, color1: colorStart, color2: colorEnd },
      particles: { enabled: true, type: particleType, count: 14, color: particleColor },
      drawAccessory: drawFn,
      code: `// Generated dynamically by KuroBlob Expression Creator Skill\nexport const ${id}_EXPRESSION = {\n  id: '${id}',\n  nameZh: '${nameZh}',\n  nameEn: '${nameEn}',\n  emoji: '${emoji}',\n  body: {\n    colorStart: '${colorStart}',\n    colorEnd: '${colorEnd}',\n    glowColor: '${glowColor}',\n    glowBlur: 22\n  },\n  eyes: {\n    style: '${eyeStyle}',\n    color: '${eyeColor}',\n    width: 20,\n    height: 34,\n    spacing: 72,\n    tilt: 0.0\n  },\n  drawAccessory: function(ctx, t) {\n${drawAccessoryCode}\n  }\n};`
    };
  }
}
