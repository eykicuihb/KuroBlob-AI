# 🖤 KuroBlob AI — Living 3D Procedural Jelly Avatar & Multimodal Companion

> **A high-performance 60 FPS HTML5 Canvas procedural jelly avatar engine powered by 16-point Bezier spring physics, Animation Timeline Sequencer, Blink-Masked Morphing, Web VTuber face tracking, BYOK/Ollama multimodal LLM dialogue, and an AI Expression Creator Studio powered by Agent Skills.**

<p align="center">
  <img src="KuroBlob_AI_Promo.gif" alt="KuroBlob AI Demo Showcase" width="750" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);" />
</p>

<p align="center">
  <a href="#english">English</a> | <a href="#简体中文">简体中文</a> | <a href="RELEASE_NOTES.md">Release Notes (v0.3.0)</a>
</p>

---

<a name="english"></a>
## 🌟 English Overview

**KuroBlob AI** (`黑呆萌`) is an interactive, web-native procedural avatar engine designed to bring dynamic 3D-like liquid mercury characters to life. Featuring a strict **Pure-Black (#0A0A0C) Brand Identity**, **16-Point Bezier Spring Physics Engine**, **Animation Timeline & Montage Story Sequencer**, **Blink-Masked Shape Morphing**, **0.69x Spherical Depth Parallax**, **Expression State Board (`#planche`)**, **Native MP4 Social Video Exporter**, **Web VTuber (Camera Face Tracking & Mic Audio Lip-Sync)**, **Mood-Driven Mascot Vocal Chatter & Haptic Feedback**, **Expression Vault & JSON Pack Sharing**, **OBS Chroma Green Screen Mode**, **BYOK Real LLM (Ollama & OpenAI-compatible) Streaming**, and the **AI Expression Creator Studio** powered by the `kuroblob-expression-creator` Agent Skill.

### ✨ Key Features (v0.3.0)

- **🎞️ Animation Timeline & Montage Story Sequencer**: A full-fledged 4th workspace dedicated to narrative choreography! Chain any of the 60+ emotions, adjust individual clip durations (`0.4s ~ 6.0s`), observe live total duration calculation, and enjoy automated loop playback with active neon cursor tracking. Includes 4 built-in story presets:
  - 💡 **Insight**: `IDLE` ➔ `THINKING` ➔ `STAR` ➔ `HAPPY`
  - 💘 **Romance**: `COOL` ➔ `WINK` ➔ `SHY` ➔ `LOVE`
  - 💻 **Hacker**: `ROBOT` ➔ `FOCUSED` ➔ `FIRE` ➔ `PARTY`
  - 🌈 **Weather**: `SUNNY` ➔ `WINDY` ➔ `RAIN` ➔ `THUNDER` ➔ `RAINBOW`
- **🎬 Native MP4 Video Export (Twitter/X & Social Media Ready)**: One-click export of single clips or entire timeline sequences directly to H.264 MP4 without requiring external transcoding tools.
- **👁️ Blink-Masked Morphing Transition (x.ai-Inspired Dynamics)**: Seamlessly masks geometric discontinuities between distinct silhouettes and accessories with a natural `0.18s` blink animation.
- **📐 0.69x Spherical Orthographic Depth Factor**: Aligns vertical pitch and gaze tracking with spherical orthographic projection formula `ey = sin(pitch) * 0.69 * R`, delivering lifelike 3D spatial depth.
- **🧩 Expression State Board Gallery (`#planche`)**: Modal exhibition gallery displaying all 60+ procedural emotions in a sleek 6-column grid with live click-to-preview.
- **📳 Mobile Touch-Action & Dual-Mode Haptic Vibration**: Zero page scroll interference during canvas interaction (`touch-action: none`), dynamic `ResizeObserver` DPR scaling, and physical hardware vibration on spring bounce & dizzy overload.
- **🎵 Mood-Driven Procedural Mascot Vocal Chatter**: Web Audio API synthesizer dynamically modulated across 5 emotional scales (Happy, Romantic, Melancholy, Furious, Contemplative) with organic lip-sync.
- **💾 Expression Vault JSON Export/Import & Reset Defaults**: One-click `.json` configuration download and restore for community sharing, accompanied by an instant "↺ Reset Defaults" button in the workshop.
- **🔒 Dynamic Canvas Code Security Sandbox**: AST and token blacklist sanitizer preventing malicious non-drawing code execution.
- **🖤 Iconic Pure-Black Brand Identity**: 100% pure black `#0A0A0C` body silhouette across all 60+ emotions, accented by vibrant procedural accessories.
- **📹 60 FPS Web VTuber Mode**: Instant camera head roll & yaw tracking with optical centroid differential and 3D spherical head-eye parallax coupling.
- **🤖 Multimodal AI Companion (BYOK & Ollama)**: Connect local Ollama models (Gemma 4, Llama 3, Qwen) or cloud APIs (DeepSeek, OpenAI) via SSE streaming with real-time `[EMOTION:XYZ]` dynamic mood tagging.
- **🪄 AI Expression Creator Studio**: Input any natural language prompt (e.g., *"Cyberpunk hacker"*, *"Beach party"*, *"Ninja in thunderstorm"*). The AI compiles and mounts dynamic Canvas 2D vector drawing code in real time!

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
node test-timeline-sequencer.js
```

Open `http://localhost:3000` in your web browser.
- Visit `http://localhost:3000/#timeline` to directly access the Animation Timeline Sequencer.
- Visit `http://localhost:3000/#planche` to view the 60+ Expression State Board.

---

## 🏗️ Architecture

```
avatar-dialogue-app/
├── index.html                   # Application entry & responsive 4-tab layout
├── style.css                    # Glassmorphism CSS design system with responsive grid
├── server.js                    # Zero-CORS static server with /api/ollama proxy
├── package.json                 # Project manifest & scripts (v0.3.0)
├── RELEASE_NOTES.md             # Comprehensive release notes (v0.3.0, v0.2.0, v0.1.0)
├── js/
│   ├── app.js                   # Main application controller & event bus
│   ├── avatar-renderer.js       # 16-point Bezier spring physics Canvas renderer & weather fx
│   ├── timeline-sequencer.js    # Multi-clip animation timeline & story montage engine
│   ├── sound-fx.js              # Web Audio API procedural synthesizer & mood-driven chatter
│   ├── expression-vault.js      # LocalStorage custom expression pack manager & JSON export/import
│   ├── animation-recorder.js    # Native MP4/WebM 60 FPS high-frame video recorder
│   ├── face-tracker.js          # Web VTuber camera tracking & audio lip-sync
│   ├── llm-provider.js          # Ollama & OpenAI-compatible BYOK client
│   ├── expression-generator.js  # Dynamic Canvas 2D procedural compiler with AST sandbox
│   ├── dialogue-engine.js       # Typewriter streaming dialogue & intent matcher
│   ├── sentiment-analyzer.js    # Rule-based NLP sentiment classifier
│   └── i18n.js                  # Bilingual dictionary (zh-CN & en)
└── skills/
    └── kuroblob-expression-creator/ # Official Agent Skill specification & validator
```

---

<a name="简体中文"></a>
## 🌟 简体中文 简介

**KuroBlob AI (黑呆萌)** 是一款基于原生 HTML5 Canvas 开发的高保真程序化 3D 液态动态表情引擎与全模态交互伴侣。在 `v0.3.0` 中，重磅推出 **【🎞️ 动画时间线与剧情编排工作台】**、**闭眼遮罩无缝形变过渡**、**0.69x 正交球面深度投影**、**60+ 全表情全景状态展板 (`#planche`)**、**全平台通用的智能 MP4 视频直接导出**、**移动端触觉震动马达反馈（Haptics）**、**多情绪动森语调调制** 以及 **自定义表情包一键 JSON 导入导出与代码安全沙箱**。

### ✨ 核心亮点 (v0.3.0)

- **🎞️ 动画时间线与剧情编排工作台**: 第四大主工作区！支持从 60+ 个内置与 AI 自创表情中自由挑选组装剧情，支持每卡片独立时长微调（`0.4s ~ 6.0s`）、总时长实时汇总计算、顺序调整与一键循环播放。自带 4 大叙事预设模板（💡 沉思到顿悟、💘 酷帅到心动、💻 极客黑客狂欢、🌈 阴晴雨雪彩虹）。
- **🎬 原生探测 MP4 导出 (Twitter/X & 微信视频直接兼容)**: 采用原生 AVC1 / MP4 探针直接录制并编码为标准 MP4，无需任何外部转码工具，一键录制整条时间线或单帧表情直接分享社交媒体。
- **👁️ 闭眼遮罩形变过渡 (Blink-Masked Transition)**: 参考业界领先的形态突变遮掩机制，表情切换时自动触发 `0.18s` 自然闭眼动画遮罩，彻底消除不同五官与外置配饰跳帧的生硬感。
- **📐 0.69x 球面正交深度矩阵**: 视线与头部倾仰基于三维球面投影公式 `ey = sin(pitch) * 0.69 * R`，头部与眼神在空间转动时展现出更具立体感的真实 3D 纵深。
- **🧩 60+ 种全量表情状态全景展板 (`#planche`)**: 顶部导航新增“🧩 全景展板”，以 6 列网格展示全部 60+ 个程序化内置与自创动作，点击即可在背景即时上身预览。
- **📳 移动端防滚与触觉震动马达反馈**: 画布严格注入 `touch-action: none` 与 `ResizeObserver`，捏脸拉伸回弹（`boing`）与物理过载眩晕（`dizzy`）支持调用真实手机硬件马达震动。
- **🎵 多情绪动森风语调调制**: 基于纯数学 Web Audio 合成器，根据化身情绪动态调制 5 种不同音阶调式与波形，吐字时以 3~6 Hz 节奏自然驱动果冻嘴形张合。
- **💾 表情包专属收藏库 JSON 备份与恢复默认**: 支持表情包一键导出与导入 `.json` 配置文件，设计工坊支持一键“↺ 恢复默认”还原出厂基准参数。
- **🔒 Canvas 动态代码执行安全沙箱**: 加入 AST 静态检测黑名单，阻止非绘图危险代码执行。
- **🖤 纯黑品牌 IP 一致性**: 无论表情如何变幻，主体严格保持 `#0A0A0C` 纯黑水银质感，搭配多彩外置配饰。
- **📹 60 FPS 零延迟 Web VTuber 面捕**: 原生 Chrome FaceDetector + 高敏光学质心差分算法，零延迟追踪头部转动与倾斜，配合麦克风对口型。
- **🤖 多模态大模型实时伴侣 (BYOK & Ollama)**: 原生支持本地 Ollama（Gemma 4、Llama 3、Qwen）与 OpenAI / DeepSeek API。
- **🪄 AI 一键表情创造工坊 (Agent Skill 驱动)**: 输入任意自然语言创意，现场动态编写并执行 Canvas 2D 绘图代码，左侧舞台 60 FPS 实时上身！

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
node test-timeline-sequencer.js
```

- 访问 `http://localhost:3000/#timeline` 直接进入动画时间线工作台；
- 访问 `http://localhost:3000/#planche` 打开 60+ 全表情全景展板。

---

## 📄 License

MIT License © 2026 KuroBlob AI Team
