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
          fillRect(){}, strokeRect(){}, ellipse(){}, clip(){},
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

    // A. Headgear & Role Helmets
    if (/uncle sam|山姆大叔|山姆|星条旗|usa|america/i.test(ct)) {
      emoji = '🎩';
      colorStart = '#1E3A8A';
      colorEnd = '#DC2626';
      glowColor = 'rgba(220, 38, 38, 0.45)';
      nameZh = '山姆大叔';
      nameEn = 'Uncle Sam';
      drawingSteps.push(`
  // --- Uncle Sam Patriotic Top Hat & Bowtie ---
  const hatY = -72;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, hatY, 62, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  ctx.rect(-34, hatY - 70, 68, 70);
  ctx.clip();
  for (let s = 0; s < 7; s++) {
    ctx.fillStyle = s % 2 === 0 ? '#EF4444' : '#FFFFFF';
    ctx.fillRect(-34 + s * (68 / 7), hatY - 70, 68 / 7 + 0.5, 70);
  }
  ctx.restore();
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 2;
  ctx.strokeRect(-34, hatY - 70, 68, 70);
  ctx.fillStyle = '#1D4ED8';
  ctx.fillRect(-35, hatY - 24, 70, 22);
  ctx.fillStyle = '#FFFFFF';
  for (let star = -22; star <= 22; star += 11) {
    ctx.beginPath();
    ctx.arc(star, hatY - 13, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Red Bowtie
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.moveTo(-16, 44);
  ctx.lineTo(-28, 36);
  ctx.lineTo(-28, 52);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(16, 44);
  ctx.lineTo(28, 36);
  ctx.lineTo(28, 52);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 44, 5, 0, Math.PI * 2);
  ctx.fill();`);
    }

    if (/delivery|courier|外卖|送外卖|快递|美团|饿了么|骑手/i.test(ct)) {
      emoji = '🛵';
      colorStart = '#F59E0B';
      colorEnd = '#D97706';
      glowColor = 'rgba(245, 158, 11, 0.45)';
      nameZh = '送外卖员';
      nameEn = 'Delivery Rider';
      drawingSteps.push(`
  // --- Delivery Rider Safety Helmet ---
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -58, 50, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.beginPath();
  ctx.roundRect(-40, -56, 80, 16, 5);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-30, -74, 60, 5);`);
    }

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

    if (/police|officer|cop|警察|警官|阿sir/i.test(ct)) {
      emoji = '👮';
      drawingSteps.push(`
  // --- Police Peaked Cap ---
  ctx.fillStyle = '#1E3A8A';
  ctx.beginPath();
  ctx.moveTo(-48, -62);
  ctx.lineTo(-44, -92);
  ctx.lineTo(44, -92);
  ctx.lineTo(48, -62);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.ellipse(0, -60, 46, 8, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(0, -78, 6, 0, Math.PI * 2);
  ctx.fill();`);
    }

    if (/graduate|student|professor|doctorate|学士|硕士|博士|毕业/i.test(ct)) {
      emoji = '🎓';
      drawingSteps.push(`
  // --- Academic Mortarboard ---
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -102);
  ctx.lineTo(60, -82);
  ctx.lineTo(0, -62);
  ctx.lineTo(-60, -82);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, -82);
  ctx.lineTo(42, -58 + Math.sin(t * 3) * 4);
  ctx.stroke();`);
    }

    if (/headphone|dj|music|耳机|听歌|摇滚/i.test(ct)) {
      emoji = '🎧';
      drawingSteps.push(`
  // --- Glowing DJ Headphones ---
  ctx.strokeStyle = '#6366F1';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, -22, 60, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = '#1E1B4B';
  ctx.strokeStyle = '#A855F7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-66, -38, 16, 36, 8);
  ctx.roundRect(50, -38, 16, 36, 8);
  ctx.fill();
  ctx.stroke();`);
    }

    // B. Eyewear & Face Props
    if (/white sunglasses|白.*墨镜|白色.*墨镜|白.*太阳镜|白色.*太阳镜/i.test(ct)) {
      emoji = '🕶️';
      drawingSteps.push(`
  // --- Trendy White Frame Sunglasses ---
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-54, -28, 38, 32, 10);
  ctx.roundRect(16, -28, 38, 32, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillRect(-18, -16, 36, 6);
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(-49, -23, 28, 22, 6);
  ctx.roundRect(21, -23, 28, 22, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.moveTo(-45, -20);
  ctx.lineTo(-32, -6);
  ctx.lineTo(-36, -6);
  ctx.lineTo(-49, -20);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(25, -20);
  ctx.lineTo(38, -6);
  ctx.lineTo(34, -6);
  ctx.lineTo(21, -20);
  ctx.fill();`);
    } else if (/sunglasses|墨镜|太阳镜|shades/i.test(ct)) {
      emoji = '🕶️';
      drawingSteps.push(`
  // --- Classic Black Sunglasses ---
  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-52, -26, 34, 28, 8);
  ctx.roundRect(18, -26, 34, 28, 8);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-18, -12);
  ctx.lineTo(18, -12);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.moveTo(-44, -20);
  ctx.lineTo(-30, -6);
  ctx.lineTo(-34, -6);
  ctx.lineTo(-48, -20);
  ctx.fill();`);
    } else if (/glasses|黑框|眼镜/i.test(ct) || (/geek|programmer|程序员|码农/i.test(ct) && !/hacker|黑客/i.test(ct))) {
      drawingSteps.push(`
  // --- Geek Glasses ---
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 4;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.roundRect(-52, -26, 32, 28, 6);
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

    // C. Vehicle & Driving Controls
    if (/motorcycle|motorbike|biker|摩托|机车|电动车|骑车/i.test(ct)) {
      emoji = '🏍️';
      drawingSteps.push(`
  // --- Motorcycle Handlebars & Mirror ---
  const bikeY = 50 + Math.sin(t * 8) * 1.5;
  ctx.fillStyle = '#3B82F6';
  ctx.strokeStyle = '#1D4ED8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-45, bikeY + 22);
  ctx.lineTo(-26, bikeY - 12);
  ctx.lineTo(26, bikeY - 12);
  ctx.lineTo(45, bikeY + 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-72, bikeY - 4);
  ctx.lineTo(72, bikeY - 4);
  ctx.stroke();
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(-78, bikeY - 8, 14, 8);
  ctx.fillRect(64, bikeY - 8, 14, 8);
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-62, bikeY - 20, 8, 0, Math.PI * 2);
  ctx.arc(62, bikeY - 20, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();`);
    } else if (/car|drive|driver|steering|车|汽车|开车|驾驶|司机|方向盘/i.test(ct)) {
      emoji = '🚗';
      drawingSteps.push(`
  // --- Driving Sports Steering Wheel ---
  const wheelY = 46;
  const wheelRot = Math.sin(t * 2.5) * 0.22;
  ctx.save();
  ctx.translate(0, wheelY);
  ctx.rotate(wheelRot);
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(0, 0, 40, -Math.PI * 0.8, -Math.PI * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 40, -Math.PI * 0.5, -Math.PI * 0.2);
  ctx.stroke();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-38, 0);
  ctx.lineTo(38, 0);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 38);
  ctx.stroke();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();`);
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

    // D. Handheld Props
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
