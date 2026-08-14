/**
 * 🤖 LLMProvider — Bring Your Own Key (BYOK) Real AI Integration for KuroBlob AI
 * Supports OpenAI, DeepSeek, Gemini, Ollama, Groq, and custom OpenAI-compatible endpoints.
 * Streams response in real-time, extracts [EMOTION:...] tags, and drives KuroBlob live.
 */

import { soundFx } from './sound-fx.js';

export class LLMProvider {
  constructor() {
    this.loadConfig();
  }

  loadConfig() {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('kuroblob_llm_config') : null;
    let saved = {};
    try {
      if (raw) saved = JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse LLM config:', e);
    }

    this.config = {
      enabled: saved.enabled || false,
      provider: saved.provider || 'deepseek',
      baseUrl: saved.baseUrl || 'https://api.deepseek.com/v1',
      apiKey: saved.apiKey || '',
      model: saved.model || 'deepseek-chat',
      temperature: saved.temperature ?? 0.7,
      systemPrompt: saved.systemPrompt || this.getDefaultSystemPrompt()
    };
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('kuroblob_llm_config', JSON.stringify(this.config));
    }
  }

  getDefaultSystemPrompt() {
    return `You are KuroBlob (黑呆萌), a lively, expressive, and intelligent 3D procedural liquid mercury avatar companion.
You express emotions dynamically. In your response, whenever your mood changes, naturally include an emotion tag like [EMOTION:NAME].
Supported emotions: HAPPY, ANGRY, LOVE, SHY, LAUGHING, SAD, SURPRISED, CONFUSED, SLEEPING, CAT, DEVIL, ANGEL, COOL, SMUG, THINKING, PARTY, FIRE, SNOW, SUNNY, RAINBOW, ROBOT, BOBA, NINJA, SUPERHERO, ALIEN.
Keep responses engaging, concise, and helpful.`;
  }

  isConfigured() {
    return this.config.enabled && (Boolean(this.config.apiKey) || this.config.provider === 'ollama');
  }

  /**
   * Stream chat completion from OpenAI-compatible API
   */
  async streamChat(history, onChunk, onEmotion) {
    let endpoint = this.config.baseUrl.trim();
    if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1);
    if (!endpoint.endsWith('/chat/completions')) {
      endpoint = `${endpoint}/chat/completions`;
    }

    const messages = [
      { role: 'system', content: this.config.systemPrompt },
      ...history.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
    ];

    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey.trim()}`;
    }

    const body = {
      model: this.config.model.trim(),
      messages,
      temperature: this.config.temperature,
      stream: true
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = `API Request failed with status ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error && errJson.error.message) {
          errorMsg = errJson.error.message;
        }
      } catch (e) {
        errorMsg = errText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let fullText = '';
    let tokenCounter = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta = data.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              tokenCounter++;
              if (tokenCounter % 3 === 0) {
                soundFx.typingBlip();
              }

              // Extract any [EMOTION:NAME] tags
              const emotionMatch = fullText.match(/\[EMOTION:([A-Z_]+)\]/i);
              if (emotionMatch) {
                const emotion = emotionMatch[1].toUpperCase();
                if (onEmotion) onEmotion(emotion);
              }

              // Clean visible text by stripping tags
              const cleanedText = fullText.replace(/\[EMOTION:[A-Z_]+\]/gi, '').trimStart();
              if (onChunk) onChunk(cleanedText);
            }
          } catch (e) {
            // Ignore parse errors on partial chunks
          }
        }
      }
    }

    // Final clean text
    const finalCleanText = fullText.replace(/\[EMOTION:[A-Z_]+\]/gi, '').trim();
    return finalCleanText;
  }

  /**
   * Fetch available models from Ollama / OpenAI-compatible API
   */
  async fetchModels(customBaseUrl, customApiKey) {
    let baseUrl = (customBaseUrl || this.config.baseUrl || '').trim();
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    const apiKey = customApiKey !== undefined ? customApiKey : this.config.apiKey;

    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const models = new Set();

    // 1. Try Ollama native tags endpoint (/api/tags)
    try {
      const ollamaTagsUrl = baseUrl.replace(/\/v1\/?$/, '') + '/api/tags';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(ollamaTagsUrl, { method: 'GET', headers, signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
          data.models.forEach(m => {
            if (m.name) models.add(m.name);
            else if (m.model) models.add(m.model);
          });
          if (models.size > 0) {
            return { success: true, source: 'Ollama', models: Array.from(models) };
          }
        }
      }
    } catch (e) {
      // Continue to OpenAI /models
    }

    // 2. Try Standard OpenAI /v1/models endpoint
    try {
      let modelsUrl = baseUrl;
      if (!modelsUrl.endsWith('/models')) {
        modelsUrl = modelsUrl.endsWith('/v1') ? `${modelsUrl}/models` : `${modelsUrl}/v1/models`;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(modelsUrl, { method: 'GET', headers, signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.data) ? data.data : (Array.isArray(data.models) ? data.models : []);
        list.forEach(m => {
          const id = m.id || m.name || m.model;
          if (id) models.add(id);
        });
        if (models.size > 0) {
          return { success: true, source: 'OpenAI-Compatible', models: Array.from(models) };
        }
      }
    } catch (e) {
      // Failed to reach
    }

    return {
      success: false,
      error: '无法获取模型列表。如果使用本地 Ollama，请确认已在终端执行 `ollama serve`；或直接在下方手动输入模型名称。',
      models: []
    };
  }
}

export const llmProvider = new LLMProvider();
