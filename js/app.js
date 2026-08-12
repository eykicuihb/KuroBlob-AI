/**
 * App Main Controller
 * Connects UI inputs, canvas avatar renderer, sentiment classifier, and dialogue engine.
 */

import { AvatarRenderer } from './avatar-renderer.js';
import { DialogueEngine } from './dialogue-engine.js';
import { I18nManager } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
  const i18n = new I18nManager();
  i18n.applyTranslations();

  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      i18n.toggleLanguage();
    });
  }

  const canvas = document.getElementById('avatarCanvas');
  const avatar = new AvatarRenderer(canvas);

  // Emoji dictionary per emotion (50 Procedural Emotions)
  const emotionEmojis = {
    IDLE: '👁️',
    THINKING: '🌀',
    WRITING: '✍️',
    ANGRY: '😡',
    HAPPY: '😄',
    SURPRISED: '😲',
    CONFUSED: '🤔',
    SLEEPING: '😴',
    LOVE: '❤️',
    LAUGHING: '🤣',
    SAD: '🥺',
    SHOCKED: '😱',
    SMUG: '😏',
    FOCUSED: '🎯',
    DIZZY: '💫',
    SHY: '😳',
    EVIL: '😈',
    HYPED: '🔥',
    BORED: '🙄',
    WINK: '😜',
    COOL: '😎',
    NERVOUS: '😰',
    PARTY: '🎉',
    DISGUSTED: '🤢',
    ROBOT: '🤖',
    BOBA: '🥺',
    CAT: '🐱',
    GHOST: '👻',
    RABBIT: '🐰',
    ANGEL: '😇',
    DEVIL: '👿',
    BOUNCY: '🍮',
    YAWN: '🥱',
    PUFF: '😤',
    STAR: '🤩',
    PIRATE: '🏴‍☠️',
    SUPERHERO: '🦸',
    PANDA: '🐼',
    MUSIC: '🎵',
    FOODIE: '😋',
    SNOW: '🥶',
    FIRE: '🔥',
    ALIEN: '👽',
    MAGIC: '🪄',
    NINJA: '🥷',
    MARSHMALLOW: '☁️',
    PIXEL: '👾',
    COSMIC: '🪐',
    ZEN: '🧘',
    CELEBRITY: '✨',
    SUNNY: '☀️',
    RAIN: '🌧️',
    THUNDER: '🌩️',
    SNOWY: '❄️',
    WINDY: '🌬️',
    FOGGY: '🌫️',
    RAINBOW: '🌈',
    HAIL: '☄️',
    TORNADO: '🌪️'
  };

  // UI Elements
  const activeEmotionPill = document.getElementById('activeEmotionPill');
  const emotionEmoji = document.getElementById('emotionEmoji');
  const emotionName = document.getElementById('emotionName');
  const sentimentLabel = document.getElementById('sentimentLabel');
  const confidenceFill = document.getElementById('confidenceFill');
  const confidenceText = document.getElementById('confidenceText');
  const chatHistory = document.getElementById('chatHistory');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');
  const exportCodeBtn = document.getElementById('exportCodeBtn');
  const codeModal = document.getElementById('codeModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const emotionButtons = document.querySelectorAll('.btn-emotion');
  const presetChips = document.querySelectorAll('.preset-chip');

  // Initialize Dialogue Engine
  const dialogueEngine = new DialogueEngine(avatar, (history, analysis) => {
    renderChatHistory(history);
    updateSentimentUI(analysis);
  });

  // Update Emotion UI Indicator
  const updateEmotionBadge = (emotion) => {
    emotionName.textContent = emotion;
    emotionEmoji.textContent = emotionEmojis[emotion] || '👁️';

    // Update manual buttons active state
    emotionButtons.forEach(btn => {
      if (btn.dataset.emotion === emotion) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  // Listen for avatar state changes to keep UI pill synced
  const checkEmotionSync = () => {
    updateEmotionBadge(avatar.targetEmotion);
    requestAnimationFrame(checkEmotionSync);
  };
  checkEmotionSync();

  // Manual Emotion Switching
  emotionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isTouring) stopTour();
      const emotion = btn.dataset.emotion;
      avatar.setEmotion(emotion);
      updateEmotionBadge(emotion);
    });
  });

  // Auto Tour / Expression Showcase Animation Engine
  const btnTourToggle = document.getElementById('btnTourToggle');
  let tourInterval = null;
  let isTouring = false;

  const tourSequence = [
    'IDLE', 'HAPPY', 'NINJA', 'SUNNY', 'UFO', 'RAIN', 'THUNDER', 'SNOWY', 
    'TORNADO', 'RAINBOW', 'SUPERHERO', 'PANDA', 'CAT', 'RABBIT', 'BOUNCY', 
    'FIRE', 'STAR', 'ANGEL', 'DEVIL', 'PARTY', 'ROBOT', 'PIXEL', 'COSMIC', 'ZEN'
  ];
  let tourIndex = 0;

  const startTour = () => {
    isTouring = true;
    btnTourToggle.classList.add('playing');
    btnTourToggle.textContent = '⏹️ 停止巡演动画 (Pause Tour)';
    
    tourInterval = setInterval(() => {
      tourIndex = (tourIndex + 1) % tourSequence.length;
      const nextEmotion = tourSequence[tourIndex];
      avatar.setEmotion(nextEmotion);
      updateEmotionBadge(nextEmotion);

      // Scroll active button smoothly into view
      const activeBtn = document.querySelector(`.btn-emotion[data-emotion="${nextEmotion}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 1800);
  };

  const stopTour = () => {
    isTouring = false;
    btnTourToggle.classList.remove('playing');
    btnTourToggle.textContent = '✨ 播放 60+ 表情自然形变动画 (Auto Tour)';
    if (tourInterval) {
      clearInterval(tourInterval);
      tourInterval = null;
    }
  };

  btnTourToggle.addEventListener('click', () => {
    if (isTouring) {
      stopTour();
    } else {
      startTour();
    }
  });

  // Render Chat History
  const renderChatHistory = (history) => {
    chatHistory.innerHTML = '';
    history.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${msg.sender}`;
      
      const emoji = emotionEmojis[msg.emotion] || '💬';
      
      bubble.innerHTML = `
        <div>${escapeHtml(msg.text)}</div>
        <div class="bubble-meta">
          <span>${msg.sender === 'user' ? '用户' : 'AI 动态表情包'} (${emoji} ${msg.emotion})</span>
          <span>${msg.time}</span>
        </div>
      `;
      chatHistory.appendChild(bubble);
    });
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };

  // Update Sentiment Classifier UI
  const updateSentimentUI = (analysis) => {
    if (!analysis) return;
    sentimentLabel.textContent = `${analysis.emotion} (${emotionEmojis[analysis.emotion] || ''})`;
    const pct = Math.round(analysis.confidence * 100);
    confidenceFill.style.width = `${pct}%`;
    confidenceText.textContent = `${pct}%`;
  };

  // Chat Form Submission
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    dialogueEngine.processUserMessage(text);
  });

  // Preset Chips Clicking
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      chatInput.value = prompt;
      dialogueEngine.processUserMessage(prompt);
    });
  });

  // Dark / Light Theme Toggle
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    avatar.setTheme(newTheme);

    if (newTheme === 'dark') {
      themeIcon.textContent = '☀️';
      themeText.textContent = 'Light Mode';
    } else {
      themeIcon.textContent = '🌙';
      themeText.textContent = 'Dark Mode';
    }
  });

  // Export Code Modal
  exportCodeBtn.addEventListener('click', () => {
    codeModal.classList.add('active');
  });

  closeModalBtn.addEventListener('click', () => {
    codeModal.classList.remove('active');
  });

  // Navigation Mode Tab Switching
  const tabChat = document.getElementById('tabChat');
  const tabStudio = document.getElementById('tabStudio');
  const dialoguePanel = document.getElementById('dialoguePanel');
  const studioPanel = document.getElementById('studioPanel');

  tabChat.addEventListener('click', () => {
    tabChat.classList.add('active');
    tabStudio.classList.remove('active');
    dialoguePanel.classList.remove('hidden');
    studioPanel.classList.add('hidden');
    avatar.setStudioMode(false);
  });

  tabStudio.addEventListener('click', () => {
    if (isTouring) stopTour();
    tabStudio.classList.add('active');
    tabChat.classList.remove('active');
    studioPanel.classList.remove('hidden');
    dialoguePanel.classList.add('hidden');
    avatar.setStudioMode(true);
  });

  // Avatar Studio Control Event Listeners
  const studioChips = document.querySelectorAll('.studio-chip');
  const studioEyeChips = document.querySelectorAll('.studio-eye-chip');
  const sliderStiffness = document.getElementById('sliderStiffness');
  const valStiffness = document.getElementById('valStiffness');
  const sliderEyeW = document.getElementById('sliderEyeW');
  const valEyeW = document.getElementById('valEyeW');
  const sliderEyeH = document.getElementById('sliderEyeH');
  const valEyeH = document.getElementById('valEyeH');
  const sliderEyeSpacing = document.getElementById('sliderEyeSpacing');
  const valEyeSpacing = document.getElementById('valEyeSpacing');
  const sliderEyeTilt = document.getElementById('sliderEyeTilt');
  const valEyeTilt = document.getElementById('valEyeTilt');
  const selectHeadAcc = document.getElementById('selectHeadAcc');
  const selectAuraAcc = document.getElementById('selectAuraAcc');
  const chkCheeks = document.getElementById('chkCheeks');
  const chkRings = document.getElementById('chkRings');
  const chkParticles = document.getElementById('chkParticles');
  const btnStudioExportPNG = document.getElementById('btnStudioExportPNG');
  const btnStudioCopyJSON = document.getElementById('btnStudioCopyJSON');

  // Shape Chips
  studioChips.forEach(chip => {
    chip.addEventListener('click', () => {
      studioChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const shape = chip.dataset.shape;
      avatar.updateStudioConfig({ shape });
      avatar.setEmotion(shape === 'CLOUD' ? 'MARSHMALLOW' : shape);
    });
  });

  // Eye Style Chips
  studioEyeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      studioEyeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const eyeStyle = chip.dataset.eyestyle;
      avatar.updateStudioConfig({ eyeStyle });
    });
  });

  // Stiffness Slider
  sliderStiffness.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    valStiffness.textContent = val.toFixed(2);
    avatar.springStiffness = val;
  });

  // Eye Sliders
  sliderEyeW.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    valEyeW.textContent = `${val}px`;
    avatar.updateStudioConfig({ eyeWidth: val });
  });

  sliderEyeH.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    valEyeH.textContent = `${val}px`;
    avatar.updateStudioConfig({ eyeHeight: val });
  });

  sliderEyeSpacing.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    valEyeSpacing.textContent = `${val}px`;
    avatar.updateStudioConfig({ eyeSpacing: val });
  });

  sliderEyeTilt.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    valEyeTilt.textContent = `${val}°`;
    avatar.updateStudioConfig({ eyeTilt: val });
  });

  // Both Eyes Parallel Rotation Slider
  const sliderEyeRot = document.getElementById('sliderEyeRot');
  const valEyeRot = document.getElementById('valEyeRot');
  if (sliderEyeRot) {
    sliderEyeRot.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      valEyeRot.textContent = `${val}°`;
      avatar.updateStudioConfig({ eyeRotation: val });
    });
  }

  // Eye Position Sliders (3D Spherical Surface Movement)
  const sliderEyePosX = document.getElementById('sliderEyePosX');
  const valEyePosX = document.getElementById('valEyePosX');
  const sliderEyePosY = document.getElementById('sliderEyePosY');
  const valEyePosY = document.getElementById('valEyePosY');
  const inputCustomEmoji = document.getElementById('inputCustomEmoji');
  const inputCustomName = document.getElementById('inputCustomName');
  const btnSaveCustomEmotion = document.getElementById('btnSaveCustomEmotion');
  const emotionButtonsContainer = document.querySelector('.emotion-buttons');

  sliderEyePosX.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    valEyePosX.textContent = `${val}px`;
    avatar.updateStudioConfig({ eyePosX: val });
  });

  sliderEyePosY.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    valEyePosY.textContent = `${val}px`;
    avatar.updateStudioConfig({ eyePosY: val });
  });

  // Save to My Custom Emotion Pack Engine (LocalStorage + Dynamic Grid Integration)
  const savedEmotions = JSON.parse(localStorage.getItem('MY_CUSTOM_EMOTIONS') || '[]');

  const bindCustomEmotionBtn = (btn, emotionId) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-emotion').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      avatar.setEmotion(emotionId);
    });
  };

  const renderCustomEmotionBtn = (customItem) => {
    emotionEmojis[customItem.id] = customItem.emoji;
    avatar.registerCustomPreset(customItem.id, customItem.config);

    const btn = document.createElement('button');
    btn.className = 'btn-emotion custom';
    btn.dataset.emotion = customItem.id;
    btn.textContent = `${customItem.emoji} ${customItem.name}`;
    emotionButtonsContainer.prepend(btn);
    bindCustomEmotionBtn(btn, customItem.id);
  };

  // Load Saved Custom Emotions on startup
  savedEmotions.forEach(item => renderCustomEmotionBtn(item));

  btnSaveCustomEmotion.addEventListener('click', () => {
    const name = inputCustomName.value.trim() || '自定义黑萌系';
    const emoji = inputCustomEmoji.value.trim() || '🎨';
    const id = `CUSTOM_${Date.now()}`;
    const customConfigCopy = { ...avatar.customConfig };

    const newItem = { id, name, emoji, config: customConfigCopy };
    savedEmotions.push(newItem);
    localStorage.setItem('MY_CUSTOM_EMOTIONS', JSON.stringify(savedEmotions));

    renderCustomEmotionBtn(newItem);

    btnSaveCustomEmotion.textContent = '✅ 已保存到表情包！';
    setTimeout(() => {
      btnSaveCustomEmotion.textContent = '💾 保存至表情包';
    }, 2000);
  });

  // Selects & Toggles
  selectHeadAcc.addEventListener('change', (e) => {
    avatar.updateStudioConfig({ headAccessory: e.target.value });
  });

  selectAuraAcc.addEventListener('change', (e) => {
    avatar.updateStudioConfig({ auraAccessory: e.target.value });
  });

  chkCheeks.addEventListener('change', (e) => {
    avatar.updateStudioConfig({ showCheeks: e.target.checked });
  });

  chkRings.addEventListener('change', (e) => {
    avatar.updateStudioConfig({ showRings: e.target.checked });
  });

  chkParticles.addEventListener('change', (e) => {
    avatar.updateStudioConfig({ showParticles: e.target.checked });
  });

  // Export Actions
  btnStudioExportPNG.addEventListener('click', () => {
    const dataUrl = avatar.exportPNG();
    const link = document.createElement('a');
    link.download = `custom-avatar-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  });

  btnStudioCopyJSON.addEventListener('click', () => {
    const jsonStr = JSON.stringify(avatar.customConfig, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      btnStudioCopyJSON.textContent = '✅ 已复制配置 JSON！';
      setTimeout(() => {
        btnStudioCopyJSON.textContent = '📋 复制配置 JSON';
      }, 2000);
    });
  });

  codeModal.addEventListener('click', (e) => {
    if (e.target === codeModal) {
      codeModal.classList.remove('active');
    }
  });

  // Helper escape HTML
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }
});
