/**
 * App Main Controller
 * Connects UI inputs, canvas avatar renderer, sentiment classifier, dialogue engine,
 * procedural Web Audio SoundFX, webcam FaceTracker, and BYOK real LLM provider.
 */

import { AvatarRenderer } from './avatar-renderer.js?v=2.4';
import { DialogueEngine } from './dialogue-engine.js?v=2.4';
import { I18nManager } from './i18n.js?v=2.4';
import { soundFx } from './sound-fx.js?v=2.4';
import { llmProvider } from './llm-provider.js?v=2.4';
import { FaceTracker } from './face-tracker.js?v=2.4';
import { ExpressionGenerator } from './expression-generator.js?v=2.4';
import { ExpressionVault } from './expression-vault.js?v=2.4';
import { AnimationRecorder } from './animation-recorder.js?v=2.4';

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



  // 🟩 OBS Chroma Green Screen Mode Toggle
  const obsToggle = document.getElementById('obsToggle');
  const obsIcon = document.getElementById('obsIcon');
  const obsText = document.getElementById('obsText');
  let isGreenScreen = false;

  const updateOBSUI = () => {
    if (obsIcon && obsText) {
      if (isGreenScreen) {
        obsIcon.textContent = '🟩';
        obsText.textContent = i18n.t('obsOn');
        obsToggle?.classList.add('active');
      } else {
        obsIcon.textContent = '🟩';
        obsText.textContent = i18n.t('obsOff');
        obsToggle?.classList.remove('active');
      }
    }
  };
  updateOBSUI();

  if (obsToggle) {
    obsToggle.addEventListener('click', () => {
      isGreenScreen = !isGreenScreen;
      avatar.setGreenScreen(isGreenScreen);
      soundFx.pop(800, 0.05);
      updateOBSUI();
    });
  }

  // 🫳 Physical Pinch Overload Reaction
  avatar.onPhysicalOverload = () => {
    soundFx.boing(1.8);
    avatar.setEmotion('DIZZY');
    const emojiEl = document.getElementById('emotionEmoji');
    const nameEl = document.getElementById('emotionName');
    if (emojiEl) emojiEl.textContent = '😵';
    if (nameEl) nameEl.textContent = 'DIZZY';
    const bubble = i18n.t('dizzyReaction');
    dialogueEngine.appendSystemMessage(bubble, 'DIZZY');
  };

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

  const btnFetchModels = document.getElementById('btnFetchModels');
  const modelSelectContainer = document.getElementById('modelSelectContainer');
  const selectAIModelList = document.getElementById('selectAIModelList');
  const lblModelFetchStatus = document.getElementById('lblModelFetchStatus');

  const providerPresets = {
    deepseek: { baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
    openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
    gemini: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/', model: 'gemini-2.0-flash' },
    ollama: { baseUrl: 'http://127.0.0.1:11434/v1', model: 'llama3' },
    custom: { baseUrl: 'https://api.openai.com/v1', model: 'custom-model' }
  };

  const openAIModal = () => {
    soundFx.pop(850, 0.06);
    if (chkEnableLLM) chkEnableLLM.checked = llmProvider.config.enabled;
    if (selectAIProvider) selectAIProvider.value = llmProvider.config.provider;
    if (inputAIBaseUrl) inputAIBaseUrl.value = llmProvider.config.baseUrl;
    if (inputAIApiKey) inputAIApiKey.value = llmProvider.config.apiKey;
    if (inputAIModel) inputAIModel.value = llmProvider.config.model;
    if (lblModelFetchStatus) lblModelFetchStatus.textContent = '';
    aiSettingsModal?.classList.add('active');

    if (selectAIProvider?.value === 'ollama') {
      doFetchModels(true);
    }
  };

  const closeAIModal = () => {
    soundFx.pop(600, 0.05);
    aiSettingsModal?.classList.remove('active');
  };

  const doFetchModels = async (silent = false) => {
    if (!btnFetchModels) return;
    btnFetchModels.disabled = true;
    btnFetchModels.textContent = i18n.t('btnFetchLoading');
    if (lblModelFetchStatus) {
      lblModelFetchStatus.textContent = i18n.t('btnFetchLoading');
      lblModelFetchStatus.style.color = 'var(--text-muted)';
    }

    try {
      const baseUrl = inputAIBaseUrl?.value?.trim() || '';
      const apiKey = inputAIApiKey?.value?.trim() || '';
      const result = await llmProvider.fetchModels(baseUrl, apiKey);

      if (result.success && result.models.length > 0) {
        // If current model is empty or not in list, auto-fill with detected chat model
        if (!inputAIModel.value || !result.models.includes(inputAIModel.value)) {
          if (result.primaryChatModel) {
            inputAIModel.value = result.primaryChatModel;
          }
        }

        if (selectAIModelList) {
          selectAIModelList.innerHTML = `<option value="">${i18n.t('selectModelPlaceholder')}</option>`;
          result.models.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            const isEmbed = m.includes('embed') || m.includes('rerank');
            opt.textContent = `${isEmbed ? '🔍' : '💬'} ${m}`;
            if (m === inputAIModel.value) opt.selected = true;
            selectAIModelList.appendChild(opt);
          });
        }
        modelSelectContainer?.classList.remove('hidden');
        if (lblModelFetchStatus) {
          lblModelFetchStatus.textContent = i18n.t('modelsFetchedSuccess', { count: result.models.length, source: result.source });
          lblModelFetchStatus.style.color = '#34C759';
        }
        if (!silent) soundFx.pop(950, 0.08);
      } else {
        if (lblModelFetchStatus) {
          lblModelFetchStatus.textContent = result.error || i18n.t('modelsFetchFailed');
          lblModelFetchStatus.style.color = '#FF9500';
        }
      }
    } catch (e) {
      if (lblModelFetchStatus) {
        lblModelFetchStatus.textContent = i18n.t('modelsFetchFailed');
        lblModelFetchStatus.style.color = '#FF9500';
      }
    } finally {
      btnFetchModels.disabled = false;
      btnFetchModels.textContent = i18n.t('btnFetchModels');
    }
  };

  if (btnFetchModels) {
    btnFetchModels.addEventListener('click', () => doFetchModels(false));
  }

  if (selectAIModelList) {
    selectAIModelList.addEventListener('change', (e) => {
      if (e.target.value) {
        soundFx.pop(800, 0.05);
        if (inputAIModel) inputAIModel.value = e.target.value;
        if (chkEnableLLM) chkEnableLLM.checked = true;
      }
    });
  }

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
      if (e.target.value === 'ollama') {
        doFetchModels(false);
      }
    });
  }

  if (btnSaveAIModal) {
    btnSaveAIModal.addEventListener('click', () => {
      const modelName = inputAIModel.value.trim();
      const isOllama = selectAIProvider.value === 'ollama';
      const shouldEnable = chkEnableLLM.checked || (isOllama && !!modelName);

      llmProvider.saveConfig({
        enabled: shouldEnable,
        provider: selectAIProvider.value,
        baseUrl: inputAIBaseUrl.value.trim(),
        apiKey: inputAIApiKey.value.trim(),
        model: modelName
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

  // Navigation Mode Tab Switching (3-Way: Chat / Studio / AI Creator)
  const tabChat = document.getElementById('tabChat');
  const tabStudio = document.getElementById('tabStudio');
  const tabCreator = document.getElementById('tabCreator');
  const dialoguePanel = document.getElementById('dialoguePanel');
  const studioPanel = document.getElementById('studioPanel');
  const creatorPanel = document.getElementById('creatorPanel');

  const switchTab = (activeTab) => {
    soundFx.pop(750, 0.05);
    if (isTouring) stopTour();

    tabChat?.classList.toggle('active', activeTab === 'chat');
    tabStudio?.classList.toggle('active', activeTab === 'studio');
    tabCreator?.classList.toggle('active', activeTab === 'creator');

    dialoguePanel?.classList.toggle('hidden', activeTab !== 'chat');
    studioPanel?.classList.toggle('hidden', activeTab !== 'studio');
    creatorPanel?.classList.toggle('hidden', activeTab !== 'creator');

    if (activeTab === 'chat') {
      avatar.setStudioMode(false);
    } else {
      avatar.setStudioMode(true);
    }
  };

  if (tabChat) tabChat.addEventListener('click', () => switchTab('chat'));
  if (tabStudio) tabStudio.addEventListener('click', () => switchTab('studio'));
  if (tabCreator) tabCreator.addEventListener('click', () => switchTab('creator'));

  // 🪄 AI Expression Creator Studio Engine (Powered by kuroblob-expression-creator Skill)
  const expressionGenerator = new ExpressionGenerator(llmProvider);
  const inputCreatorPrompt = document.getElementById('inputCreatorPrompt');
  const btnGenerateExpression = document.getElementById('btnGenerateExpression');
  const lblBtnGenerateText = document.getElementById('lblBtnGenerateText');
  const lblCreatorStatus = document.getElementById('lblCreatorStatus');
  const creatorResultBox = document.getElementById('creatorResultBox');
  const txtGeneratedCode = document.getElementById('txtGeneratedCode');
  const btnCopyGeneratedCode = document.getElementById('btnCopyGeneratedCode');
  const btnApplyGeneratedExp = document.getElementById('btnApplyGeneratedExp');
  const creatorChips = document.querySelectorAll('.btn-creator-chip');

  let currentGeneratedExp = null;

  const doGenerateExpression = async () => {
    const prompt = inputCreatorPrompt?.value?.trim() || '赛博朋克黑客';
    if (btnGenerateExpression) btnGenerateExpression.disabled = true;
    if (lblBtnGenerateText) lblBtnGenerateText.textContent = i18n.t('btnGeneratingExp');
    if (lblCreatorStatus) {
      lblCreatorStatus.textContent = i18n.t('btnGeneratingExp');
      lblCreatorStatus.style.color = 'var(--text-muted)';
    }

    try {
      soundFx.pop(600, 0.08);
      const exp = await expressionGenerator.generate(prompt);
      currentGeneratedExp = exp;

      // Apply dynamically to live Canvas
      avatar.applyGeneratedExpression(exp);
      soundFx.pop(1000, 0.1);

      if (txtGeneratedCode) txtGeneratedCode.textContent = exp.code;
      
      const hasAcc = typeof exp.drawAccessory === 'function' || !!exp.drawAccessoryCode;
      const hasRings = !!(exp.rings && exp.rings.enabled);
      const hasParticles = !!(exp.particles && exp.particles.enabled);
      const hasCheeks = !!exp.showCheeks;

      if (chkCreatorShowAccessory) chkCreatorShowAccessory.checked = hasAcc;
      if (chkCreatorShowRings) chkCreatorShowRings.checked = hasRings;
      if (chkCreatorShowParticles) chkCreatorShowParticles.checked = hasParticles;
      if (chkCreatorShowCheeks) chkCreatorShowCheeks.checked = hasCheeks;

      avatar.setShowCustomAccessory(hasAcc);
      updateAccessoryBadge();
      creatorResultBox?.classList.remove('hidden');

      if (lblCreatorStatus) {
        const isLlmActive = llmProvider && llmProvider.isConfigured();
        const hint = isLlmActive 
          ? `(🤖 来源: ${llmProvider.config.provider} / ${llmProvider.config.model})`
          : `(💡 提示: 已使用内置技能引擎生成；点击右上角【🤖 AI 设置】可接入实时大模型)`;
        lblCreatorStatus.textContent = `${i18n.t('expGeneratedSuccess')} [${exp.nameZh} / ${exp.nameEn}] ${hint}`;
        lblCreatorStatus.style.color = '#34C759';
      }
    } catch (err) {
      console.error('Expression generation failed:', err);
      if (lblCreatorStatus) {
        lblCreatorStatus.textContent = `❌ 生成失败: ${err.message}`;
        lblCreatorStatus.style.color = '#FF3B30';
      }
    } finally {
      if (btnGenerateExpression) btnGenerateExpression.disabled = false;
      if (lblBtnGenerateText) lblBtnGenerateText.textContent = i18n.t('btnGenerateExp');
    }
  };

  if (btnGenerateExpression) {
    btnGenerateExpression.addEventListener('click', doGenerateExpression);
  }

  creatorChips.forEach(chip => {
    chip.addEventListener('click', () => {
      soundFx.pop(750, 0.05);
      const prompt = chip.dataset.prompt;
      if (prompt && inputCreatorPrompt) {
        inputCreatorPrompt.value = prompt;
        doGenerateExpression();
      }
    });
  });

  // 💾 Expression Vault & Animation Recorder Setup
  const expressionVault = new ExpressionVault();
  const animationRecorder = new AnimationRecorder();
  const customEmotionsContainer = document.getElementById('customEmotionsContainer');
  const btnSaveCreatorToVault = document.getElementById('btnSaveCreatorToVault');
  const btnExportCreatorVideo = document.getElementById('btnExportCreatorVideo');
  const btnStudioExportVideo = document.getElementById('btnStudioExportVideo');

  const renderVaultGrid = () => {
    expressionVault.renderToGrid(
      customEmotionsContainer,
      (selectedExp) => {
        soundFx.pop(850, 0.06);
        avatar.applyGeneratedExpression(selectedExp);
        const emojiEl = document.getElementById('emotionEmoji');
        const nameEl = document.getElementById('emotionName');
        if (emojiEl) emojiEl.textContent = selectedExp.emoji || '🎨';
        if (nameEl) nameEl.textContent = selectedExp.nameZh || selectedExp.id;
      },
      () => {
        soundFx.pop(400, 0.05);
      }
    );
  };
  renderVaultGrid();

  if (btnSaveCreatorToVault) {
    btnSaveCreatorToVault.addEventListener('click', () => {
      if (currentGeneratedExp) {
        const expToSave = {
          ...currentGeneratedExp,
          rings: { enabled: chkCreatorShowRings ? chkCreatorShowRings.checked : (currentGeneratedExp.rings?.enabled || false) },
          particles: { enabled: chkCreatorShowParticles ? chkCreatorShowParticles.checked : (currentGeneratedExp.particles?.enabled || false) },
          showCheeks: chkCreatorShowCheeks ? chkCreatorShowCheeks.checked : (currentGeneratedExp.showCheeks || false),
          drawAccessoryCode: (chkCreatorShowAccessory && !chkCreatorShowAccessory.checked) ? null : currentGeneratedExp.drawAccessoryCode
        };
        expressionVault.saveExpression(expToSave);
        soundFx.pop(1100, 0.1);
        renderVaultGrid();
        btnSaveCreatorToVault.textContent = '✅ 已收藏入库!';
        setTimeout(() => {
          btnSaveCreatorToVault.textContent = i18n.t('btnSaveToVault');
        }, 1500);
      }
    });
  }

  // 📤 Expression Vault JSON Export / Import
  const btnExportVaultJson = document.getElementById('btnExportVaultJson');
  const btnImportVaultJson = document.getElementById('btnImportVaultJson');
  const inputImportVaultFile = document.getElementById('inputImportVaultFile');

  if (btnExportVaultJson) {
    btnExportVaultJson.addEventListener('click', () => {
      soundFx.pop(1000, 0.08);
      expressionVault.exportVaultAsJson();
    });
  }

  if (btnImportVaultJson && inputImportVaultFile) {
    btnImportVaultJson.addEventListener('click', () => {
      soundFx.pop(850, 0.06);
      inputImportVaultFile.click();
    });

    inputImportVaultFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const res = expressionVault.importVaultFromJson(evt.target.result);
        if (res.success) {
          soundFx.pop(1100, 0.1);
          renderVaultGrid();
          btnImportVaultJson.textContent = `✅ 导入 ${res.count} 个!`;
          setTimeout(() => {
            btnImportVaultJson.textContent = i18n.t('btnImportVault');
          }, 2000);
        } else {
          soundFx.pop(300, 0.1);
          btnImportVaultJson.textContent = '❌ 导入失败';
          setTimeout(() => {
            btnImportVaultJson.textContent = i18n.t('btnImportVault');
          }, 2000);
        }
        inputImportVaultFile.value = '';
      };
      reader.readAsText(file);
    });
  }

  const handleVideoExport = async (btn) => {
    if (animationRecorder.isRecording) return;
    soundFx.pop(700, 0.08);
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ 正在录制 60 FPS 动图...';

    // Set background during video capture so transparent canvas doesn't encode to pure black:
    // Light mode uses #FFFFFF (white) so black body is distinct; dark mode uses #0F172A
    const currentTheme = root.getAttribute('data-theme') || avatar.theme || 'dark';
    if (!avatar.greenScreen) {
      avatar.setRecordingBackground(currentTheme === 'light' ? '#FFFFFF' : '#0F172A');
    }

    try {
      const result = await animationRecorder.record(canvas, 3, (progress) => {
        btn.textContent = `⏳ 录制中 ${Math.round(progress * 100)}%`;
      }, 'auto');
      soundFx.pop(1200, 0.12);
      const extName = result?.ext ? result.ext.toUpperCase() : 'MP4';
      btn.textContent = `✅ 已导出 ${extName}!`;
    } catch (err) {
      console.error('Video recording failed:', err);
      btn.textContent = '❌ 导出失败';
    } finally {
      avatar.setRecordingBackground(null);
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = origText;
      }, 1800);
    }
  };

  if (btnExportCreatorVideo) {
    btnExportCreatorVideo.addEventListener('click', () => handleVideoExport(btnExportCreatorVideo));
  }

  if (btnStudioExportVideo) {
    btnStudioExportVideo.addEventListener('click', () => handleVideoExport(btnStudioExportVideo));
  }

  if (btnCopyGeneratedCode) {
    btnCopyGeneratedCode.addEventListener('click', () => {
      if (txtGeneratedCode) {
        navigator.clipboard.writeText(txtGeneratedCode.textContent);
        soundFx.pop(900, 0.06);
        btnCopyGeneratedCode.textContent = '✅ 已复制!';
        setTimeout(() => {
          btnCopyGeneratedCode.textContent = i18n.t('btnCopyCode');
        }, 1200);
      }
    });
  }

  // 🎀 Dynamic Multi-Layer & Effect Visibility Controls (Accessory, Rings, Particles, Cheeks)
  const chkCreatorShowAccessory = document.getElementById('chkCreatorShowAccessory');
  const chkCreatorShowRings = document.getElementById('chkCreatorShowRings');
  const chkCreatorShowParticles = document.getElementById('chkCreatorShowParticles');
  const chkCreatorShowCheeks = document.getElementById('chkCreatorShowCheeks');
  const badgeAccessoryStatus = document.getElementById('badgeAccessoryStatus');

  const updateAccessoryBadge = () => {
    if (!badgeAccessoryStatus) return;
    const hasAcc = chkCreatorShowAccessory ? chkCreatorShowAccessory.checked : true;
    const hasRings = chkCreatorShowRings ? chkCreatorShowRings.checked : false;
    const hasParticles = chkCreatorShowParticles ? chkCreatorShowParticles.checked : false;

    if (hasAcc && (hasRings || hasParticles)) {
      badgeAccessoryStatus.textContent = i18n.t('badgeAccessoryEquipped');
      badgeAccessoryStatus.style.color = '#34C759';
      badgeAccessoryStatus.style.background = 'rgba(52, 199, 89, 0.12)';
    } else if (!hasAcc && !hasRings && !hasParticles) {
      badgeAccessoryStatus.textContent = i18n.t('badgeAccessoryHidden');
      badgeAccessoryStatus.style.color = '#8E8E93';
      badgeAccessoryStatus.style.background = 'rgba(142, 142, 147, 0.12)';
    } else {
      badgeAccessoryStatus.textContent = i18n.lang === 'zh-CN' ? '自定义图层' : 'Custom Layers';
      badgeAccessoryStatus.style.color = '#A855F7';
      badgeAccessoryStatus.style.background = 'rgba(168, 85, 247, 0.12)';
    }
  };

  if (chkCreatorShowAccessory) {
    chkCreatorShowAccessory.addEventListener('change', (e) => {
      soundFx.pop(750, 0.05);
      avatar.setShowCustomAccessory(e.target.checked);
      updateAccessoryBadge();
    });
  }

  if (chkCreatorShowRings) {
    chkCreatorShowRings.addEventListener('change', (e) => {
      soundFx.pop(780, 0.05);
      avatar.updateStudioConfig({ showRings: e.target.checked });
      updateAccessoryBadge();
    });
  }

  if (chkCreatorShowParticles) {
    chkCreatorShowParticles.addEventListener('change', (e) => {
      soundFx.pop(800, 0.05);
      avatar.updateStudioConfig({ showParticles: e.target.checked });
      updateAccessoryBadge();
    });
  }

  if (chkCreatorShowCheeks) {
    chkCreatorShowCheeks.addEventListener('change', (e) => {
      soundFx.pop(820, 0.05);
      avatar.updateStudioConfig({ showCheeks: e.target.checked });
      updateAccessoryBadge();
    });
  }

  if (btnApplyGeneratedExp) {
    btnApplyGeneratedExp.addEventListener('click', () => {
      if (currentGeneratedExp) {
        soundFx.pop(950, 0.08);
        avatar.applyGeneratedExpression(currentGeneratedExp);
        const isShowAcc = chkCreatorShowAccessory ? chkCreatorShowAccessory.checked : true;
        const isShowRings = chkCreatorShowRings ? chkCreatorShowRings.checked : false;
        const isShowParticles = chkCreatorShowParticles ? chkCreatorShowParticles.checked : false;
        const isShowCheeks = chkCreatorShowCheeks ? chkCreatorShowCheeks.checked : false;

        avatar.setShowCustomAccessory(isShowAcc);
        avatar.updateStudioConfig({
          showRings: isShowRings,
          showParticles: isShowParticles,
          showCheeks: isShowCheeks
        });
        updateAccessoryBadge();
      }
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

  // ↺ Studio Reset to Baseline Defaults
  const btnStudioResetDefaults = document.getElementById('btnStudioResetDefaults');
  if (btnStudioResetDefaults) {
    btnStudioResetDefaults.addEventListener('click', () => {
      soundFx.pop(750, 0.08);
      // Reset chips
      studioChips.forEach(c => c.classList.toggle('active', c.dataset.shape === 'BLOB'));
      studioEyeChips.forEach(c => c.classList.toggle('active', c.dataset.eyestyle === 'PILL'));

      // Reset values
      if (sliderStiffness) { sliderStiffness.value = 0.12; if (valStiffness) valStiffness.textContent = '0.12'; avatar.springStiffness = 0.12; }
      if (sliderEyeW) { sliderEyeW.value = 16; if (valEyeW) valEyeW.textContent = '16px'; }
      if (sliderEyeH) { sliderEyeH.value = 38; if (valEyeH) valEyeH.textContent = '38px'; }
      if (sliderEyeSpacing) { sliderEyeSpacing.value = 28; if (valEyeSpacing) valEyeSpacing.textContent = '28px'; }
      if (sliderEyeTilt) { sliderEyeTilt.value = 0; if (valEyeTilt) valEyeTilt.textContent = '0°'; }
      if (sliderEyePosX) { sliderEyePosX.value = 0; if (valEyePosX) valEyePosX.textContent = '0px'; }
      if (sliderEyePosY) { sliderEyePosY.value = 0; if (valEyePosY) valEyePosY.textContent = '0px'; }
      if (selectHeadAcc) selectHeadAcc.value = 'NONE';
      if (selectAuraAcc) selectAuraAcc.value = 'NONE';
      if (chkCheeks) chkCheeks.checked = false;
      if (chkRings) chkRings.checked = false;
      if (chkParticles) chkParticles.checked = false;

      avatar.updateStudioConfig({
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
        showParticles: false
      });
      avatar.setEmotion('BLOB');
      btnStudioResetDefaults.textContent = '✅ 已重置!';
      setTimeout(() => {
        btnStudioResetDefaults.textContent = i18n.t('btnResetDefaults');
      }, 1500);
    });
  }

  // Export Actions
  if (btnStudioExportPNG) {
    btnStudioExportPNG.addEventListener('click', () => {
      soundFx.pop(900, 0.08);
      const currentTheme = root.getAttribute('data-theme') || avatar.theme || 'dark';
      const dataUrl = avatar.exportPNG(currentTheme);
      const link = document.createElement('a');
      link.download = `kuroblob-avatar-${Date.now()}.png`;
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

  // 🧩 60+ Expressions State Board Modal (#planche)
  const btnStateBoard = document.getElementById('btnStateBoard');
  const stateBoardModal = document.getElementById('stateBoardModal');
  const closeStateBoardBtn = document.getElementById('closeStateBoardBtn');
  const stateBoardGrid = document.getElementById('stateBoardGrid');

  const openStateBoard = () => {
    soundFx.pop(800, 0.06);
    if (stateBoardGrid && stateBoardGrid.children.length === 0) {
      // Collect all standard emotion buttons
      const emotionBtns = document.querySelectorAll('.manual-controls .btn-emotion:not(.btn-vault-custom)');
      emotionBtns.forEach(btn => {
        const emoId = btn.dataset.emotion;
        const text = btn.textContent.trim();
        const card = document.createElement('button');
        card.className = 'state-board-card';
        card.style.cssText = `
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 12px 8px; border-radius: 12px; border: 1px solid var(--bg-card-border);
          background: var(--bg-hover); cursor: pointer; transition: all 0.2s ease;
          gap: 6px; text-align: center;
        `;
        card.innerHTML = `
          <span style="font-size: 1.6rem; pointer-events: none;">${text.split(' ')[0]}</span>
          <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-primary); pointer-events: none;">${text.split(' ').slice(1).join(' ')}</span>
          <span style="font-size: 0.68rem; color: var(--text-muted); font-family: monospace; pointer-events: none;">${emoId}</span>
        `;
        card.addEventListener('mouseenter', () => {
          card.style.borderColor = 'var(--accent-color)';
          card.style.transform = 'translateY(-2px)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.borderColor = 'var(--bg-card-border)';
          card.style.transform = 'translateY(0)';
        });
        card.addEventListener('click', () => {
          soundFx.pop(950, 0.08);
          avatar.setEmotion(emoId);
          const emojiEl = document.getElementById('emotionEmoji');
          const nameEl = document.getElementById('emotionName');
          if (emojiEl) emojiEl.textContent = text.split(' ')[0];
          if (nameEl) nameEl.textContent = emoId;
          stateBoardModal?.classList.remove('active');
        });
        stateBoardGrid.appendChild(card);
      });
    }
    stateBoardModal?.classList.add('active');
  };

  const closeStateBoard = () => {
    soundFx.pop(600, 0.05);
    stateBoardModal?.classList.remove('active');
    if (window.location.hash === '#planche') {
      history.replaceState(null, '', window.location.pathname);
    }
  };

  if (btnStateBoard) btnStateBoard.addEventListener('click', openStateBoard);
  if (closeStateBoardBtn) closeStateBoardBtn.addEventListener('click', closeStateBoard);
  if (stateBoardModal) {
    stateBoardModal.addEventListener('click', (e) => {
      if (e.target === stateBoardModal) closeStateBoard();
    });
  }

  if (window.location.hash === '#planche') {
    openStateBoard();
  }
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#planche') openStateBoard();
  });

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
