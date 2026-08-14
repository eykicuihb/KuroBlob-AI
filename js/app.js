/**
 * App Main Controller
 * Connects UI inputs, canvas avatar renderer, sentiment classifier, dialogue engine,
 * procedural Web Audio SoundFX, webcam FaceTracker, and BYOK real LLM provider.
 */

import { AvatarRenderer } from './avatar-renderer.js';
import { DialogueEngine } from './dialogue-engine.js';
import { I18nManager } from './i18n.js';
import { soundFx } from './sound-fx.js';
import { llmProvider } from './llm-provider.js';
import { FaceTracker } from './face-tracker.js';

document.addEventListener('DOMContentLoaded', () => {
  const i18n = new I18nManager();
  i18n.applyTranslations();

  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      soundFx.pop(900, 0.05);
      i18n.toggleLanguage();
      updateSoundUI();
      updateVTuberUI();
    });
  }

  const canvas = document.getElementById('avatarCanvas');
  const avatar = new AvatarRenderer(canvas);
  const faceTracker = new FaceTracker(avatar);

  // 🔊 Sound FX Toggle & Persistence
  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const soundText = document.getElementById('soundText');

  const updateSoundUI = () => {
    if (soundIcon && soundText) {
      if (soundFx.muted) {
        soundIcon.textContent = '🔇';
        soundText.textContent = i18n.t('soundOff');
        soundToggle?.classList.remove('active');
      } else {
        soundIcon.textContent = '🔊';
        soundText.textContent = i18n.t('soundOn');
        soundToggle?.classList.add('active');
      }
    }
  };
  updateSoundUI();

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      soundFx.toggleMute();
      if (!soundFx.muted) soundFx.pop(800, 0.08);
      updateSoundUI();
    });
  }

  // 📹 Web VTuber Face Tracking Toggle
  const vtuberToggle = document.getElementById('vtuberToggle');
  const vtuberIcon = document.getElementById('vtuberIcon');
  const vtuberText = document.getElementById('vtuberText');
  const vtuberPreview = document.getElementById('vtuberPreview');

  const updateVTuberUI = () => {
    if (vtuberIcon && vtuberText) {
      if (faceTracker.isRunning) {
        vtuberIcon.textContent = '⏹️';
        vtuberText.textContent = i18n.t('vtuberStop');
        vtuberToggle?.classList.add('active');
        vtuberPreview?.classList.remove('hidden');
      } else {
        vtuberIcon.textContent = '📹';
        vtuberText.textContent = i18n.t('vtuberMode');
        vtuberToggle?.classList.remove('active');
        vtuberPreview?.classList.add('hidden');
      }
    }
  };

  if (vtuberToggle) {
    vtuberToggle.addEventListener('click', async () => {
      soundFx.pop(750, 0.06);
      if (faceTracker.isRunning) {
        faceTracker.stop();
        updateVTuberUI();
      } else {
        try {
          await faceTracker.start(vtuberPreview);
          updateVTuberUI();
        } catch (err) {
          alert(i18n.lang === 'zh-CN' ? '无法访问摄像头，请检查浏览器权限设置。' : 'Cannot access webcam. Please check browser permissions.');
          updateVTuberUI();
        }
      }
    });
  }

  // 🤖 AI Settings Modal & BYOK Configuration
  const aiSettingsBtn = document.getElementById('aiSettingsBtn');
  const aiSettingsModal = document.getElementById('aiSettingsModal');
  const closeAIModalBtn = document.getElementById('closeAIModalBtn');
  const btnCancelAIModal = document.getElementById('btnCancelAIModal');
  const btnSaveAIModal = document.getElementById('btnSaveAIModal');

  const chkEnableLLM = document.getElementById('chkEnableLLM');
  const selectAIProvider = document.getElementById('selectAIProvider');
  const inputAIBaseUrl = document.getElementById('inputAIBaseUrl');
  const inputAIApiKey = document.getElementById('inputAIApiKey');
  const inputAIModel = document.getElementById('inputAIModel');

  const providerPresets = {
    deepseek: { baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
    openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
    gemini: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/', model: 'gemini-2.0-flash' },
    ollama: { baseUrl: 'http://localhost:11434/v1', model: 'llama3' },
    custom: { baseUrl: 'https://api.openai.com/v1', model: 'custom-model' }
  };

  const openAIModal = () => {
    soundFx.pop(850, 0.06);
    if (chkEnableLLM) chkEnableLLM.checked = llmProvider.config.enabled;
    if (selectAIProvider) selectAIProvider.value = llmProvider.config.provider;
    if (inputAIBaseUrl) inputAIBaseUrl.value = llmProvider.config.baseUrl;
    if (inputAIApiKey) inputAIApiKey.value = llmProvider.config.apiKey;
    if (inputAIModel) inputAIModel.value = llmProvider.config.model;
    aiSettingsModal?.classList.add('active');
  };

  const closeAIModal = () => {
    soundFx.pop(600, 0.05);
    aiSettingsModal?.classList.remove('active');
  };

  if (aiSettingsBtn) aiSettingsBtn.addEventListener('click', openAIModal);
  if (closeAIModalBtn) closeAIModalBtn.addEventListener('click', closeAIModal);
  if (btnCancelAIModal) btnCancelAIModal.addEventListener('click', closeAIModal);

  if (selectAIProvider) {
    selectAIProvider.addEventListener('change', (e) => {
      const preset = providerPresets[e.target.value];
      if (preset) {
        if (inputAIBaseUrl) inputAIBaseUrl.value = preset.baseUrl;
        if (inputAIModel) inputAIModel.value = preset.model;
      }
    });
  }

  if (btnSaveAIModal) {
    btnSaveAIModal.addEventListener('click', () => {
      llmProvider.saveConfig({
        enabled: chkEnableLLM.checked,
        provider: selectAIProvider.value,
        baseUrl: inputAIBaseUrl.value.trim(),
        apiKey: inputAIApiKey.value.trim(),
        model: inputAIModel.value.trim()
      });
      soundFx.pop(1000, 0.08);
      btnSaveAIModal.textContent = i18n.t('aiSavedSuccess');
      setTimeout(() => {
        btnSaveAIModal.textContent = i18n.t('btnSaveAI');
        closeAIModal();
      }, 1000);
    });
  }

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
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const codeSnippet = document.getElementById('codeSnippet');
  const emotionButtons = document.querySelectorAll('.btn-emotion');
  const presetChips = document.querySelectorAll('.preset-chip');

  // Update Emotion UI Indicator
  const updateEmotionBadge = (emotion) => {
    if (emotionName) emotionName.textContent = emotion;
    if (emotionEmoji) emotionEmoji.textContent = emotionEmojis[emotion] || '👁️';

    emotionButtons.forEach(btn => {
      if (btn.dataset.emotion === emotion) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  // Sync state transitions
  const originalSetEmotion = avatar.setEmotion.bind(avatar);
  avatar.setEmotion = (emotion) => {
    originalSetEmotion(emotion);
    updateEmotionBadge(emotion);
  };

  // Render Chat History
  const renderChatHistory = (history) => {
    if (!chatHistory) return;
    chatHistory.innerHTML = '';
    history.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${msg.sender}`;
      const emoji = emotionEmojis[msg.emotion] || '💬';
      
      bubble.innerHTML = `
        <div>${escapeHtml(msg.text)}</div>
        <div class="bubble-meta">
          <span>${msg.sender === 'user' ? (i18n.lang === 'zh-CN' ? '用户' : 'User') : 'KuroBlob AI'} (${emoji} ${msg.emotion})</span>
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
    if (sentimentLabel) sentimentLabel.textContent = `${analysis.emotion} (${emotionEmojis[analysis.emotion] || ''})`;
    const pct = Math.round(analysis.confidence * 100);
    if (confidenceFill) confidenceFill.style.width = `${pct}%`;
    if (confidenceText) confidenceText.textContent = `${pct}%`;
  };

  // Initialize Dialogue Engine
  const dialogueEngine = new DialogueEngine(avatar, (history, analysis) => {
    renderChatHistory(history);
    updateSentimentUI(analysis);
  });

  // Chat Form Submission
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      soundFx.pop(650, 0.05);
      chatInput.value = '';
      dialogueEngine.processUserMessage(text);
    });
  }

  // Preset Chips Clicking
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      soundFx.pop(750, 0.05);
      const prompt = chip.dataset.prompt;
      if (prompt) {
        if (chatInput) chatInput.value = prompt;
        dialogueEngine.processUserMessage(prompt);
      }
    });
  });

  // Manual Emotion Testing Grid Click
  emotionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isTouring) stopTour();
      soundFx.pop(800, 0.06);
      emotionButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const emotion = btn.dataset.emotion;
      avatar.setEmotion(emotion);
      updateEmotionBadge(emotion);
    });
  });

  // Auto Tour Animation Engine
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
    btnTourToggle?.classList.add('playing');
    if (btnTourToggle) btnTourToggle.textContent = i18n.t('btnTourStop');
    
    tourInterval = setInterval(() => {
      tourIndex = (tourIndex + 1) % tourSequence.length;
      const nextEmotion = tourSequence[tourIndex];
      avatar.setEmotion(nextEmotion);
      updateEmotionBadge(nextEmotion);

      const activeBtn = document.querySelector(`.btn-emotion[data-emotion="${nextEmotion}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 1800);
  };

  const stopTour = () => {
    isTouring = false;
    btnTourToggle?.classList.remove('playing');
    if (btnTourToggle) btnTourToggle.textContent = i18n.t('btnTourStart');
    if (tourInterval) {
      clearInterval(tourInterval);
      tourInterval = null;
    }
  };

  if (btnTourToggle) {
    btnTourToggle.addEventListener('click', () => {
      soundFx.pop(900, 0.08);
      if (isTouring) stopTour();
      else startTour();
    });
  }

  // Dark / Light Theme Toggle
  const root = document.documentElement;
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      soundFx.pop(700, 0.06);
      const currentTheme = root.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', newTheme);
      avatar.setTheme(newTheme);

      if (themeIcon) themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      if (themeText) themeText.textContent = newTheme === 'dark' ? i18n.t('themeLight') : i18n.t('themeDark');
    });
  }

  // Export Code Modal
  if (exportCodeBtn) {
    exportCodeBtn.addEventListener('click', () => {
      soundFx.pop(800, 0.06);
      const code = `<!-- 1. HTML Canvas Container -->
<canvas id="kuroBlobCanvas" width="400" height="400"></canvas>

<!-- 2. Import & Initialize KuroBlob 24-Point Bezier Spring Engine -->
<script type="module">
  import { AvatarRenderer } from './js/avatar-renderer.js';
  
  const canvas = document.getElementById('kuroBlobCanvas');
  const avatar = new AvatarRenderer(canvas);
  
  // Set any of the 60+ continuous liquid mercury spring morphing emotions:
  avatar.setEmotion('HAPPY'); // 'THINKING', 'WRITING', 'CAT', 'ANGEL', 'SUNNY', 'RAINBOW'
</script>`;

      if (codeSnippet) codeSnippet.textContent = code;
      codeModal?.classList.add('active');
    });
  }

  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
      soundFx.pop(900, 0.08);
      navigator.clipboard.writeText(codeSnippet.textContent).then(() => {
        copyCodeBtn.textContent = '✅ 已复制到剪贴板！';
        setTimeout(() => {
          copyCodeBtn.textContent = '📋 复制代码到剪贴板';
        }, 2000);
      });
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      codeModal?.classList.remove('active');
    });
  }

  // Navigation Mode Tab Switching
  const tabChat = document.getElementById('tabChat');
  const tabStudio = document.getElementById('tabStudio');
  const dialoguePanel = document.getElementById('dialoguePanel');
  const studioPanel = document.getElementById('studioPanel');

  if (tabChat) {
    tabChat.addEventListener('click', () => {
      soundFx.pop(750, 0.05);
      tabChat.classList.add('active');
      tabStudio?.classList.remove('active');
      dialoguePanel?.classList.remove('hidden');
      studioPanel?.classList.add('hidden');
      avatar.setStudioMode(false);
    });
  }

  if (tabStudio) {
    tabStudio.addEventListener('click', () => {
      if (isTouring) stopTour();
      soundFx.pop(750, 0.05);
      tabStudio.classList.add('active');
      tabChat?.classList.remove('active');
      studioPanel?.classList.remove('hidden');
      dialoguePanel?.classList.add('hidden');
      avatar.setStudioMode(true);
    });
  }

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

  // Direct Canvas Eye Drag -> Studio Sliders Real-time Sync
  const sliderEyePosX = document.getElementById('sliderEyePosX');
  const valEyePosX = document.getElementById('valEyePosX');
  const sliderEyePosY = document.getElementById('sliderEyePosY');
  const valEyePosY = document.getElementById('valEyePosY');

  avatar.onEyePositionChange = (x, y) => {
    if (sliderEyePosX) sliderEyePosX.value = x;
    if (valEyePosX) valEyePosX.textContent = `${x}px`;
    if (sliderEyePosY) sliderEyePosY.value = y;
    if (valEyePosY) valEyePosY.textContent = `${y}px`;
  };

  // Shape Chips
  studioChips.forEach(chip => {
    chip.addEventListener('click', () => {
      soundFx.pop(800, 0.05);
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
      soundFx.pop(850, 0.05);
      studioEyeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const eyeStyle = chip.dataset.eyestyle;
      avatar.updateStudioConfig({ eyeStyle });
    });
  });

  // Stiffness Slider
  if (sliderStiffness) {
    sliderStiffness.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (valStiffness) valStiffness.textContent = val.toFixed(2);
      avatar.springStiffness = val;
    });
  }

  // Eye Sliders
  if (sliderEyeW) {
    sliderEyeW.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (valEyeW) valEyeW.textContent = `${val}px`;
      avatar.updateStudioConfig({ eyeWidth: val });
    });
  }

  if (sliderEyeH) {
    sliderEyeH.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (valEyeH) valEyeH.textContent = `${val}px`;
      avatar.updateStudioConfig({ eyeHeight: val });
    });
  }

  if (sliderEyeSpacing) {
    sliderEyeSpacing.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (valEyeSpacing) valEyeSpacing.textContent = `${val}px`;
      avatar.updateStudioConfig({ eyeSpacing: val });
    });
  }

  if (sliderEyeTilt) {
    sliderEyeTilt.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (valEyeTilt) valEyeTilt.textContent = `${val}°`;
      avatar.updateStudioConfig({ eyeTilt: val });
    });
  }

  // Both Eyes Parallel Rotation Slider
  const sliderEyeRot = document.getElementById('sliderEyeRot');
  const valEyeRot = document.getElementById('valEyeRot');
  if (sliderEyeRot) {
    sliderEyeRot.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (valEyeRot) valEyeRot.textContent = `${val}°`;
      avatar.updateStudioConfig({ eyeRotation: val });
    });
  }

  // Eye Position Sliders (3D Spherical Surface Movement)
  const inputCustomEmoji = document.getElementById('inputCustomEmoji');
  const inputCustomName = document.getElementById('inputCustomName');
  const btnSaveCustomEmotion = document.getElementById('btnSaveCustomEmotion');
  const emotionButtonsContainer = document.querySelector('.emotion-buttons');

  if (sliderEyePosX) {
    sliderEyePosX.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (valEyePosX) valEyePosX.textContent = `${val}px`;
      avatar.updateStudioConfig({ eyePosX: val });
    });
  }

  if (sliderEyePosY) {
    sliderEyePosY.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (valEyePosY) valEyePosY.textContent = `${val}px`;
      avatar.updateStudioConfig({ eyePosY: val });
    });
  }

  // Save to My Custom Emotion Pack Engine (LocalStorage + Dynamic Grid Integration)
  const savedEmotions = JSON.parse(localStorage.getItem('MY_CUSTOM_EMOTIONS') || '[]');

  const bindCustomEmotionBtn = (btn, emotionId) => {
    btn.addEventListener('click', () => {
      soundFx.pop(800, 0.05);
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
    emotionButtonsContainer?.prepend(btn);
    bindCustomEmotionBtn(btn, customItem.id);
  };

  savedEmotions.forEach(item => renderCustomEmotionBtn(item));

  if (btnSaveCustomEmotion) {
    btnSaveCustomEmotion.addEventListener('click', () => {
      soundFx.pop(900, 0.08);
      const name = inputCustomName?.value.trim() || (i18n.lang === 'zh-CN' ? '自定义黑萌系' : 'Custom KuroBlob');
      const emoji = inputCustomEmoji?.value.trim() || '🎨';
      const id = `CUSTOM_${Date.now()}`;
      const customConfigCopy = { ...avatar.customConfig };

      const newItem = { id, name, emoji, config: customConfigCopy };
      savedEmotions.push(newItem);
      localStorage.setItem('MY_CUSTOM_EMOTIONS', JSON.stringify(savedEmotions));

      renderCustomEmotionBtn(newItem);

      btnSaveCustomEmotion.textContent = i18n.t('savedSuccess');
      setTimeout(() => {
        btnSaveCustomEmotion.textContent = i18n.t('btnSaveCustom');
      }, 2000);
    });
  }

  // Selects & Toggles
  if (selectHeadAcc) {
    selectHeadAcc.addEventListener('change', (e) => {
      soundFx.pop(700, 0.04);
      avatar.updateStudioConfig({ headAccessory: e.target.value });
    });
  }

  if (selectAuraAcc) {
    selectAuraAcc.addEventListener('change', (e) => {
      soundFx.pop(700, 0.04);
      avatar.updateStudioConfig({ auraAccessory: e.target.value });
    });
  }

  if (chkCheeks) {
    chkCheeks.addEventListener('change', (e) => {
      soundFx.pop(750, 0.04);
      avatar.updateStudioConfig({ showCheeks: e.target.checked });
    });
  }

  if (chkRings) {
    chkRings.addEventListener('change', (e) => {
      soundFx.pop(750, 0.04);
      avatar.updateStudioConfig({ showRings: e.target.checked });
    });
  }

  if (chkParticles) {
    chkParticles.addEventListener('change', (e) => {
      soundFx.pop(750, 0.04);
      avatar.updateStudioConfig({ showParticles: e.target.checked });
    });
  }

  // Export Actions
  if (btnStudioExportPNG) {
    btnStudioExportPNG.addEventListener('click', () => {
      soundFx.pop(900, 0.08);
      const dataUrl = avatar.exportPNG();
      const link = document.createElement('a');
      link.download = `custom-avatar-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    });
  }

  if (btnStudioCopyJSON) {
    btnStudioCopyJSON.addEventListener('click', () => {
      soundFx.pop(900, 0.08);
      const jsonStr = JSON.stringify(avatar.customConfig, null, 2);
      navigator.clipboard.writeText(jsonStr).then(() => {
        btnStudioCopyJSON.textContent = i18n.t('copiedSuccess');
        setTimeout(() => {
          btnStudioCopyJSON.textContent = i18n.t('btnCopyJSON');
        }, 2000);
      });
    });
  }

  if (codeModal) {
    codeModal.addEventListener('click', (e) => {
      if (e.target === codeModal) {
        codeModal.classList.remove('active');
      }
    });
  }

  if (aiSettingsModal) {
    aiSettingsModal.addEventListener('click', (e) => {
      if (e.target === aiSettingsModal) {
        closeAIModal();
      }
    });
  }

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
