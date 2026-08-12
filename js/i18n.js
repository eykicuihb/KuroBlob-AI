/**
 * KuroBlob AI - Internationalization (i18n) Dictionary & Engine
 * Supports Chinese (zh-CN) & English (en)
 */

export const translations = {
  'zh-CN': {
    brandTitle: 'KuroBlob AI 动态表情引擎',
    canvasStatus: 'Canvas 60 FPS 物理引擎',
    themeDark: 'Dark Mode',
    themeLight: 'Light Mode',
    exportCode: '⚡ 导出 JS 嵌入代码',
    tabChat: '💬 AI 智能对话灵动表情模式',
    tabStudio: '🎨 Avatar 萌系自定义设计工坊 (Creator Studio)',
    stageLabel: 'Avatar Canvas Stage 舞台',
    manualLabel: '手动测试 60+ 萌系程序生成表情',
    btnTourStart: '✨ 播放 60+ 表情自然形变动画 (Auto Tour)',
    btnTourStop: '⏹️ 停止巡演动画 (Pause Tour)',
    nlpLabel: '自然语言情感判定 (NLP Classifier)',
    confidence: '置信度',
    systemMsg: '你好！我是 KuroBlob AI。在下方输入任何话语，我将通过 NLP 自动分析对话情感并切变对应的 3D 动态表情！',
    inputPlaceholder: '输入对话内容，测试表情判别与交互...',
    btnSend: '发送',
    
    // Studio Translations
    studioTitle: '🎨 Avatar 萌系自定义设计工坊',
    studioSubtitle: '自定义属于你的 3D 动态萌宠角色',
    group1: '1. 主体廓形 (Body Shape)',
    group2: '2. 胶囊双眼 & 眼神 (Capsule Eyes)',
    group3: '3. 多彩外置配饰 (Accessories & Aura)',
    group4: '4. 保存至我的表情包 & 导出 (Save & Export)',
    
    stiffness: '物理弹性 (Spring Stiffness)',
    eyeW: '眼睛宽度',
    eyeH: '眼睛高度',
    eyeSpacing: '眼睛间距',
    eyeTilt: '对称倾角 (\\ /)',
    eyeRot: '🔄 双眼整体倾斜 (/ /)',
    eyePosX: '🌐 3D 球面位置 X',
    eyePosY: '🌐 3D 球面位置 Y',
    
    headAcc: '头部饰品:',
    auraAcc: '环境气场配饰:',
    chkCheeks: '🌸 粉嫩腮红',
    chkRings: '🪐 3D 轨道彩虹环',
    chkParticles: '💫 宇宙星尘流光',
    
    saveToPack: '💾 保存至表情包',
    exportPNG: '📸 导出高清 PNG',
    copyJSON: '📋 复制配置 JSON',
    
    savedSuccess: '✅ 已保存到表情包！',
    copiedSuccess: '✅ 已复制配置 JSON！'
  },
  'en': {
    brandTitle: 'KuroBlob AI Expression Engine',
    canvasStatus: 'Canvas 60 FPS Physics',
    themeDark: 'Dark Mode',
    themeLight: 'Light Mode',
    exportCode: '⚡ Export JS Code',
    tabChat: '💬 AI Dialogue & Emotion Mode',
    tabStudio: '🎨 Avatar Creator Studio',
    stageLabel: 'Avatar Canvas Stage',
    manualLabel: 'Manual Test 60+ Procedural Expressions',
    btnTourStart: '✨ Auto Tour 60+ Expressions Morphing',
    btnTourStop: '⏹️ Pause Tour',
    nlpLabel: 'NLP Sentiment Classifier',
    confidence: 'Confidence',
    systemMsg: 'Hello! I am KuroBlob AI. Type anything below, and I will analyze sentiment & morph into procedural 3D expressions!',
    inputPlaceholder: 'Type a message to test AI sentiment classifier...',
    btnSend: 'Send',
    
    // Studio Translations
    studioTitle: '🎨 Avatar Creator Studio',
    studioSubtitle: 'Design your custom 3D liquid mercury procedural avatar',
    group1: '1. Body Shape & Elasticity',
    group2: '2. Capsule Eyes & Expressions',
    group3: '3. Accessories & Aura',
    group4: '4. Save & Export',
    
    stiffness: 'Spring Stiffness',
    eyeW: 'Eye Width',
    eyeH: 'Eye Height',
    eyeSpacing: 'Eye Spacing',
    eyeTilt: 'Symmetric Slant (\\ /)',
    eyeRot: '🔄 Both Eyes Parallel Tilt (/ /)',
    eyePosX: '🌐 3D Sphere Position X',
    eyePosY: '🌐 3D Sphere Position Y',
    
    headAcc: 'Head Accessory:',
    auraAcc: 'Aura / World Accessory:',
    chkCheeks: '🌸 Soft Pink Cheeks',
    chkRings: '🪐 3D Orbital Rings',
    chkParticles: '💫 Cosmic Particles',
    
    saveToPack: '💾 Save to Pack',
    exportPNG: '📸 Export High-Res PNG',
    copyJSON: '📋 Copy Config JSON',
    
    savedSuccess: '✅ Saved to Pack!',
    copiedSuccess: '✅ Config JSON Copied!'
  }
};

export class I18nManager {
  constructor() {
    this.lang = localStorage.getItem('KUROBLOB_LANG') || 'zh-CN';
  }

  setLanguage(lang) {
    this.lang = lang;
    localStorage.setItem('KUROBLOB_LANG', lang);
    this.applyTranslations();
  }

  toggleLanguage() {
    this.setLanguage(this.lang === 'zh-CN' ? 'en' : 'zh-CN');
    return this.lang;
  }

  t(key) {
    return translations[this.lang]?.[key] || translations['zh-CN']?.[key] || key;
  }

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (this.t(key)) {
        el.textContent = this.t(key);
      }
    });

    const langText = document.getElementById('langText');
    if (langText) {
      langText.textContent = this.lang === 'zh-CN' ? 'English' : '中文';
    }
  }
}
