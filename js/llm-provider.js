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

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
    } catch (fetchErr) {
      // If direct localhost fetch was blocked by browser CORS, retry through same-origin proxy
      if (endpoint.includes('11434') || endpoint.includes('localhost') || endpoint.includes('127.0.0.1')) {
        const proxyEndpoint = '/api/ollama/v1/chat/completions';
        response = await fetch(proxyEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
      } else {
        throw fetchErr;
      }
    }

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
   * Supports automatic protocol fixing, dual IPv4/IPv6 localhost resolution, and CORS-friendly requests.
   */
  async fetchModels(customBaseUrl, customApiKey) {
    let rawUrl = (customBaseUrl || this.config.baseUrl || '').trim();
    if (!rawUrl) rawUrl = 'http://127.0.0.1:11434';
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      rawUrl = `http://${rawUrl}`;
    }
    if (rawUrl.endsWith('/')) rawUrl = rawUrl.slice(0, -1);

    const apiKey = customApiKey !== undefined ? customApiKey : this.config.apiKey;
    const headers = {};
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const modelsSet = new Set();
    const candidateEndpoints = [];

    // 1. Ollama native endpoints (Direct + Local Proxy Fallback)
    const baseWithoutV1 = rawUrl.replace(/\/v1\/?$/, '');
    candidateEndpoints.push({ url: 'http://127.0.0.1:11434/api/tags', type: 'ollama' });
    candidateEndpoints.push({ url: '/api/ollama/api/tags', type: 'ollama' });
    candidateEndpoints.push({ url: 'http://localhost:11434/api/tags', type: 'ollama' });
    candidateEndpoints.push({ url: `${baseWithoutV1}/api/tags`, type: 'ollama' });

    // 2. OpenAI-compatible /v1/models endpoints (Direct + Local Proxy Fallback)
    let openaiUrl = rawUrl;
    if (!openaiUrl.endsWith('/models')) {
      openaiUrl = openaiUrl.endsWith('/v1') ? `${openaiUrl}/models` : `${openaiUrl}/v1/models`;
    }
    candidateEndpoints.push({ url: openaiUrl, type: 'openai' });
    candidateEndpoints.push({ url: '/api/ollama/v1/models', type: 'openai' });
    candidateEndpoints.push({ url: 'http://127.0.0.1:11434/v1/models', type: 'openai' });
    candidateEndpoints.push({ url: 'http://localhost:11434/v1/models', type: 'openai' });

    let detectedSource = 'Ollama';

    for (const item of candidateEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(item.url, {
          method: 'GET',
          headers,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (item.type === 'ollama' && Array.isArray(data.models)) {
            data.models.forEach(m => {
              const name = m.name || m.model;
              if (name) modelsSet.add(name);
            });
            if (modelsSet.size > 0) {
              detectedSource = 'Ollama';
              break;
            }
          } else if (Array.isArray(data.data) || Array.isArray(data.models)) {
            const list = Array.isArray(data.data) ? data.data : data.models;
            list.forEach(m => {
              const name = m.id || m.name || m.model;
              if (name) modelsSet.add(name);
            });
            if (modelsSet.size > 0) {
              detectedSource = 'OpenAI-Compatible';
              break;
            }
          }
        }
      } catch (e) {
        // Try next candidate endpoint
      }
    }

    if (modelsSet.size > 0) {
      const allModels = Array.from(modelsSet);
      // Sort chat models first
      const chatModels = allModels.filter(m => !m.includes('embed') && !m.includes('rerank'));
      const otherModels = allModels.filter(m => m.includes('embed') || m.includes('rerank'));
      const sortedModels = [...chatModels, ...otherModels];

      return {
        success: true,
        source: detectedSource,
        models: sortedModels,
        primaryChatModel: chatModels[0] || sortedModels[0]
      };
    }

    return {
      success: false,
      error: '无法连接到模型列表。如果使用本地 Ollama，请确认已在终端执行 `ollama serve`；或直接在下方手动输入模型名称。',
      models: []
    };
  }

  /**
   * Test API connectivity & latency
   */
  async testConnection(customBaseUrl, customApiKey, customModel) {
    const startTime = Date.now();
    try {
      let endpoint = (customBaseUrl || this.config.baseUrl || '').trim();
      if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
        endpoint = `http://${endpoint}`;
      }
      if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1);
      if (!endpoint.endsWith('/chat/completions')) {
        endpoint = `${endpoint}/chat/completions`;
      }

      const apiKey = customApiKey !== undefined ? customApiKey : this.config.apiKey;
      const model = customModel || this.config.model || 'llama3';

      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const latency = Date.now() - startTime;
      if (res.ok) {
        return { success: true, latency };
      } else {
        const text = await res.text();
        return { success: false, error: `HTTP ${res.status}: ${text.slice(0, 100)}`, latency };
      }
    } catch (e) {
      return { success: false, error: e.message, latency: Date.now() - startTime };
    }
  }
}

export const llmProvider = new LLMProvider();
