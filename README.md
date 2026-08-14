# 🖤 KuroBlob AI — Living 3D Procedural Jelly Avatar & Multimodal Companion

> **A high-performance 60 FPS HTML5 Canvas procedural jelly avatar engine powered by 16-point Bezier spring physics, Web VTuber face tracking, BYOK/Ollama multimodal LLM dialogue, and an AI Expression Creator Studio powered by Agent Skills.**

<p align="center">
  <img src="KuroBlob_AI_Promo.gif" alt="KuroBlob AI Demo Showcase" width="750" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);" />
</p>

<p align="center">
  <a href="#english">English</a> | <a href="#简体中文">简体中文</a> | <a href="RELEASE_NOTES.md">Release Notes (v0.2.0)</a>
</p>

---

<a name="english"></a>
## 🌟 English Overview

**KuroBlob AI** (`黑呆萌`) is an interactive, web-native procedural avatar engine designed to bring dynamic 3D-like liquid mercury characters to life. Featuring a strict **Pure-Black (#0A0A0C) Brand Identity**, **16-Point Bezier Spring Physics Engine**, **Web VTuber (Camera Face Tracking & Mic Audio Lip-Sync)**, **Cute Anime Web Speech TTS Voice Synthesis**, **Expression Vault & LocalStorage Persistence**, **3-Second Animated 60 FPS WebM Exporter**, **OBS Chroma Green Screen Mode**, **BYOK Real LLM (Ollama & OpenAI-compatible) Streaming**, and the **AI Expression Creator Studio** powered by the `kuroblob-expression-creator` Agent Skill.

### ✨ Key Features (v0.2.0)

- **🖤 Iconic Pure-Black Brand Identity**: 100% pure black `#0A0A0C` body silhouette across all 60+ emotions to preserve character identity, accented by vibrant procedural accessories.
- **💧 16-Point Bezier Spring Physics Morphing**: 100% organic, continuous liquid jelly spring physics interpolation (`stiffness = 0.12`, `damping = 0.82`) between any two body silhouettes (Cloud, Tornado, UFO, Cat, Bunny, Panda, Triangle, Robot, etc.) at 60 FPS without discrete frame snapping.
- **🗣️ Cute Anime Web Speech TTS & Organic Lip-Sync**: High-pitched cute robot/anime voice synthesis synchronized with real-time typewriter dialogue and 3~6 Hz organic mouth opening movements.
- **💾 Expression Vault & LocalStorage Persistence**: Save AI-generated and custom-designed expressions directly to your local pack; dynamically injects them into the manual testing grid with custom glowing badges.
- **🎬 3-Second 60 FPS Animated WebM Exporter**: Record high-fps physics movement directly from Canvas and export dynamic sticker animations with one click.
- **🟩 OBS Chroma Green Screen Mode**: One-click toggle switching canvas background to pure chroma green `#00FF00` for live streaming overlay in OBS Studio.
- **🫳 Physical Pinch Overload & Dizzy Reaction**: Rapid, high-displacement stretching triggers mechanical overload protection with dizzy spiral eyes (`DIZZY` 😵) and speech bubbles.
- **📹 60 FPS Web VTuber Mode (Zero Dependencies)**: Instant camera head roll & yaw tracking with optical centroid differential and 3D spherical head-eye parallax coupling.
- **🤖 Multimodal AI Companion (BYOK & Ollama)**: Connect local Ollama models (Gemma 4, Llama 3, Qwen) or cloud APIs (DeepSeek, OpenAI) via SSE streaming with real-time `[EMOTION:XYZ]` dynamic mood tagging.
- **🪄 AI Expression Creator Studio**: Input any natural language prompt (e.g., *"Cyberpunk hacker"*, *"Beach bikini show"*, *"Cute cat drinking coffee with rubber duck"*). The AI compiles and mounts dynamic Canvas 2D vector drawing code in real time!

---

## 🚀 Quick Start

### Prerequisites
Node.js 18+ (or any modern web browser).

### Running Locally
```bash
# 1. Clone repository
git clone https://github.com/eykicuihb/KuroBlob-AI.git
cd KuroBlob-AI/avatar-dialogue-app

# 2. Start Zero-CORS development server
npm start
# Server will run at http://localhost:3000

# 3. Run automated feature tests
node test-v020-full.js
```

Open `http://localhost:3000` in your web browser.

---

## 🏗️ Architecture

```
avatar-dialogue-app/
├── index.html                   # Application entry & responsive 3-tab layout
├── style.css                    # Glassmorphism CSS design system
├── server.js                    # Zero-CORS static server with /api/ollama proxy
├── package.json                 # Project manifest & scripts (v0.2.0)
├── RELEASE_NOTES.md             # Detailed release notes (v0.2.0 & v0.1.0)
├── js/
│   ├── app.js                   # Main application controller & event bus
│   ├── avatar-renderer.js       # 16-point Bezier spring physics Canvas renderer & OBS mode
│   ├── speech-synthesizer.js    # Cute Anime Web Speech TTS & organic lip-sync engine
│   ├── expression-vault.js      # LocalStorage custom expression pack manager
│   ├── animation-recorder.js    # 60 FPS WebM animation sticker recorder
│   ├── face-tracker.js          # Web VTuber camera tracking & audio lip-sync
│   ├── llm-provider.js          # Ollama & OpenAI-compatible BYOK client
│   ├── expression-generator.js  # Dynamic Canvas 2D procedural compiler
│   ├── dialogue-engine.js       # Typewriter streaming dialogue & intent matcher
│   ├── sentiment-analyzer.js    # Rule-based NLP sentiment classifier
│   ├── sound-fx.js              # Web Audio API procedural synthesizer
│   └── i18n.js                  # Pure bilingual dictionary & switcher
└── skills/
    └── kuroblob-expression-creator/ # Official Agent Skill specification & validator
```

---

<a name="简体中文"></a>
## 🌟 简体中文 简介

**KuroBlob AI (黑呆萌)** 是一款基于原生 HTML5 Canvas 开发的高保真程序化 3D 液态动态表情引擎与全模态交互伴侣。在 `v0.2.0` 中，全面集成了 **萌系 Web Speech TTS 语音合成**、**AI 表情专属收藏库**、**3 秒 60 FPS 动态 WebM 动图表情包导出**、**OBS 演播绿幕抠像** 以及 **捏脸过载眩晕物理互动**。

### ✨ 核心亮点 (v0.2.0)

- **🖤 纯黑品牌 IP 一致性**: 无论表情与形态如何变幻，角色主体严格保持 `#0A0A0C` 纯黑水银质感，搭配多彩外置配饰，展现独特极简萌系风格。
- **💧 16 点贝塞尔物理弹力连续形变**: 在云朵、龙卷风、UFO 飞碟、猫耳、兔耳、熊猫耳、机器人等 60+ 表情形态间切换时，实现 100% 顺滑水银流体弹簧形变。
- **🗣️ 萌系 TTS 语音合成与对口型联动**: 基于 Web Speech API 定制动漫高音调声线（Pitch: 1.35），在对话吐字时以 3~6 Hz 节奏自然驱动果冻嘴形张合。
- **💾 AI 表情专属收藏库 (Expression Vault)**: 生成表情一键点击“💾 收藏到表情包”，自动持久化至 LocalStorage 并注入底部测试网格，带有专属紫色光晕徽章。
- **🎬 3 秒 60 FPS 动态表情包录制导出**: 捕获 Canvas 60 FPS 物理流，一键生成用于微信/飞书/Discord 的动态表情包。
- **🟩 OBS 演播绿幕模式**: 一键将背景切换为纯色绿幕 `#00FF00`，主播可直接在 OBS Studio 中添加色度键抠像。
- **🫳 疯狂拉扯物理过载与眩晕互动**: 高速大幅度揉捏果冻时触发过载反馈，进入蚊香眼 (`DIZZY` 😵) 状态并弹出求饶气泡。
- **📹 60 FPS 零延迟 Web VTuber 面捕**: 原生 Chrome FaceDetector + 高敏光学质心差分算法，零延迟追踪头部转动与倾斜，配合 Web Audio RMS 麦克风对口型。
- **🤖 多模态大模型实时伴侣 (BYOK & Ollama)**: 原生支持本地 Ollama（Gemma 4、Llama 3、Qwen）与 OpenAI / DeepSeek API，SSE 逐字打字机流式输出与情绪标签驱动。
- **🪄 AI 一键表情创造工坊 (Agent Skill 驱动)**: 输入任意自然语言创意，大模型与混合矢量编译器现场编写并执行 Canvas 2D 绘图代码，左侧舞台 60 FPS 实时上身！

---

## 🛠️ 快速上手

```bash
# 1. 克隆代码库
git clone https://github.com/eykicuihb/KuroBlob-AI.git
cd KuroBlob-AI/avatar-dialogue-app

# 2. 启动本地服务
npm start
# 浏览器访问 http://localhost:3000

# 3. 运行自动化全功能测试
node test-v020-full.js
```

---

## 📄 License

MIT License © 2026 KuroBlob AI Team
