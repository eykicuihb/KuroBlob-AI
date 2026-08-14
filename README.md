# 🖤 KuroBlob AI — Living 3D Procedural Jelly Avatar & Multimodal Companion

> **A high-performance 60 FPS HTML5 Canvas procedural jelly avatar engine powered by 16-point Bezier spring physics, Web VTuber face tracking, BYOK/Ollama multimodal LLM dialogue, and an AI Expression Creator Studio powered by Agent Skills.**

<p align="center">
  <img src="KuroBlob_AI_Promo.gif" alt="KuroBlob AI Demo Showcase" width="750" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);" />
</p>

<p align="center">
  <a href="#english">English</a> | <a href="#简体中文">简体中文</a> | <a href="https://github.com/eykicuihb/KuroBlob-AI/releases/tag/v0.1.0">Release Notes (v0.1.0)</a>
</p>

---

<a name="english"></a>
## 🌟 English Overview

**KuroBlob AI** (`黑呆萌`) is an interactive, web-native procedural avatar engine designed to bring dynamic 3D-like liquid mercury characters to life. Featuring a strict **Pure-Black (#0A0A0C) Brand Identity**, **16-Point Bezier Spring Physics Engine**, **Web VTuber (Camera Face Tracking & Mic Audio Lip-Sync)**, **BYOK Real LLM (Ollama & OpenAI-compatible) Streaming**, and the **AI Expression Creator Studio** powered by the `kuroblob-expression-creator` Agent Skill.

### ✨ Key Features

- **🖤 Iconic Pure-Black Brand Identity**: 100% pure black `#0A0A0C` body silhouette across all 60+ emotions to preserve character identity, accented by vibrant procedural accessories.
- **💧 16-Point Bezier Spring Physics Morphing**: 100% organic, continuous liquid jelly spring physics interpolation (`stiffness = 0.12`, `damping = 0.82`) between any two body silhouettes (Cloud, Tornado, UFO, Cat, Bunny, Panda, Triangle, Robot, etc.) at 60 FPS without discrete frame snapping.
- **📹 60 FPS Web VTuber Mode (Zero Dependencies)**: Instant camera head roll & yaw tracking with optical centroid differential and 3D spherical head-eye parallax coupling. Features real-time microphone RMS audio lip-sync mouth opening.
- **🤖 Multimodal AI Companion (BYOK & Ollama)**: Connect local Ollama models (Gemma 4, Llama 3, Qwen) or cloud APIs (DeepSeek, OpenAI) via SSE streaming with real-time `[EMOTION:XYZ]` dynamic mood tagging and typewriter sound synthesis.
- **🪄 AI Expression Creator Studio**: Input any natural language prompt (e.g., *"Cyberpunk hacker with neon visor"*, *"Beach bikini show with sunglasses"*, *"Cute cat drinking coffee with rubber duck"*). The AI compiles and mounts dynamic Canvas 2D vector drawing code in real time!
- **🎨 Custom Avatar Studio**: Fine-tune body elasticity, eye width/height/spacing/tilt, 3D spherical positions, halo, devil horns, ninja mask, and orbital aura rings.
- **🌐 Pure Bilingual i18n & Zero-CORS Server**: One-click English/Chinese switching and built-in Node server with `/api/ollama/*` transparent proxying.

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

# 3. (Optional) Run Agent Skill automated validator
npm run test:skill
```

Open `http://localhost:3000` in your web browser.

---

## 🏗️ Architecture

```
avatar-dialogue-app/
├── index.html                   # Application entry & responsive 3-tab layout
├── style.css                    # Glassmorphism CSS design system
├── server.js                    # Zero-CORS static server with /api/ollama proxy
├── package.json                 # Project manifest & scripts
├── RELEASE_NOTES.md             # Detailed v0.1.0 release notes
├── js/
│   ├── app.js                   # Main application controller & event bus
│   ├── avatar-renderer.js       # 16-point Bezier spring physics Canvas renderer
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

**KuroBlob AI (黑呆萌)** 是一款基于原生 HTML5 Canvas 开发的高保真程序化 3D 液态动态表情引擎与全模态交互伴侣。项目采用 **纯黑 (#0A0A0C) 角色 IP 标识**、**16 点贝塞尔弹簧物理流体形变引擎**、**Web VTuber 摄像头面捕与音频对口型**、**BYOK / 本地 Ollama 大模型实时流式对话** 以及 **搭载 Agent Skill 的 🪄 AI 一键表情创造工坊**。

### ✨ 核心亮点

- **🖤 纯黑品牌 IP 一致性**: 无论表情与形态如何变幻，角色主体严格保持 `#0A0A0C` 纯黑水银质感，搭配多彩外置配饰，展现独特极简萌系风格。
- **💧 16 点贝塞尔物理弹力连续形变**: 在云朵、龙卷风、UFO 飞碟、猫耳、兔耳、熊猫耳、机器人、思考三角等 60+ 表情形态间切换时，实现 100% 顺滑水银流体弹簧形变。
- **📹 60 FPS 零延迟 Web VTuber 面捕**: 原生 Chrome FaceDetector + 高敏光学质心差分算法，零延迟追踪头部转动（Yaw）与倾斜（Roll），双眼呈现 3D 球面近大远小视差；配合 Web Audio RMS 能量实时驱动果冻对口型张嘴。
- **🤖 多模态大模型实时伴侣 (BYOK & Ollama)**: 原生支持本地 Ollama（Gemma 4、Llama 3、Qwen）与 OpenAI / DeepSeek API，SSE 逐字打字机流式输出，自动解析回复中的 `[EMOTION:XYZ]` 标签实时切变表情。
- **🪄 AI 一键表情创造工坊 (Agent Skill 驱动)**: 输入任意自然语言创意（如*“海边比基尼秀”*、*“戴小黄鸭喝咖啡的可爱小猫”*、*“赛博黑客”*），大模型与混合矢量编译器现场编写并执行 Canvas 2D 绘图代码，左侧舞台 60 FPS 实时上身！
- **🎨 Avatar 萌系自定义设计工坊**: 参数化微调物理弹性、眼宽/高/倾角/间距、3D 球面坐标、恶魔角、天使光环、忍者面罩与环境流光。
- **🌐 零跨域开发服务与纯净双语**: 内置 Node 静态服务器与 `/api/ollama/*` 透明反向代理，配合一键中英文无缝切换与纯数学合成音效。

---

## 🛠️ 快速上手

```bash
# 1. 克隆代码库
git clone https://github.com/eykicuihb/KuroBlob-AI.git
cd KuroBlob-AI/avatar-dialogue-app

# 2. 启动本地服务
npm start
# 浏览器访问 http://localhost:3000

# 3. 验证 Agent Skill
npm run test:skill
```

---

## 📄 License

MIT License © 2026 KuroBlob AI Team
