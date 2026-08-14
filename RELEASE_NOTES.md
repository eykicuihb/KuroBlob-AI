# 🚀 KuroBlob AI v0.2.0 Release Notes

> **"Interactive Voice, Expression Vault & Motion Exporter"**  
> 灵动软萌的物理级 2D/3D 果冻 AI 伴侣迎来 `v0.2.0` 重大交互升级！新增萌系 TTS 语音合成、AI 表情专属收藏库、3 秒动态 WebM 动图表情包导出、OBS 演播绿幕抠像与疯狂拉扯物理眩晕反应！

---

## 🌟 What's New in v0.2.0 / 核心新特性

### 1. 🔊 萌系 Web Speech TTS 语音合成与对口型联动 (Cute Anime Voice TTS)
- **可爱动漫高音调合成**：基于浏览器原生 Web Speech API，定制萌系声线（Pitch: 1.35, Rate: 1.05），支持中英双语。
- **有机嘴形同步 (Organic Speech Lip-Sync)**：在打字机对话吐字与朗读时，自动驱动果冻嘴形以 3~6 Hz 节奏有机开合，读毕自动闭合。
- **一键静音/开启**：顶部导航栏专属 `🗣️ 语音已开 / 🔇 语音已关` 开关。

### 2. 💾 AI 表情专属收藏库与 LocalStorage 持久化 (Expression Vault)
- **一键收藏入库**：在【🪄 AI 一键表情创造工坊】生成任意满意表情后，点击 **“💾 收藏到我的专属表情包”**。
- **动态测试网格自动注入**：收藏的表情包自动沉淀至舞台下方专属收藏区，带炫酷紫色发光边框，随时一键点击调用形变与删除管理。

### 3. 🎬 3 秒循环 60 FPS 动态表情包录制导出 (Animated WebM Exporter)
- **高帧率 Canvas 流捕获**：利用 `HTMLCanvasElement.captureStream(60)` 与 `MediaRecorder`，高保真录制 3 秒 60 FPS 动态形变。
- **一键自动下载**：支持在 AI 工坊与设计工坊一键导出 `.webm` 动图，轻松制作微信/飞书/Discord 动态表情包。

### 4. 🟩 OBS 演播绿幕抠像模式 (OBS Chroma Green Screen)
- **直播级色度键抠像**：舞台顶部一键切换 **“🟩 OBS 绿幕”** 模式，Canvas 背景瞬间切换为纯正色度绿 `#00FF00`，主播可直接在 OBS Studio 中添加窗口采集并过滤绿幕！

### 5. 🫳 疯狂拉扯物理过载与眩晕互动 (Physical Pinch Overload & Dizzy Reaction)
- **力学过载反馈**：当用户以大幅度或高频率高速揉捏拉扯果冻躯体时，化身将触发力学过载保护，进入眩晕蚊香眼 (`DIZZY` 😵) 状态并弹出求饶对话气泡：*“哎呀别拉啦，果冻要被扯变形了~ 😵”*。

---

# 🚀 KuroBlob AI v0.1.0 Release Notes

> **"A Living 3D Procedural Jelly Avatar & Multimodal AI Companion Engine"**  
> 灵动软萌的物理级 2D/3D 果冻 AI 伴侣与全模态交互引擎正式发布首个版本 `v0.1.0`！

---

## 🌟 Highlights / 核心亮点

### 1. 🧪 60 FPS 物理质感果冻化身引擎 (Physics Jelly Avatar Engine)
- **16点贝塞尔弹性形变**：基于阻尼质量弹簧模型，真实模拟水滴与液态果冻的受力拉伸、挤压与回弹。
- **60+ 种萌系程序化表情**：包含快乐、傲娇、害羞、黑客、宇航员、恐龙等全套自研矢量表情与动态配饰。
- **3D 视差球面胶囊双眼**：支持瞳距、角度、倾斜与 3D 头部旋转视差联动。
- **动态环境气场**：3D 轨道彩虹环、星尘流光粒子系统、闪电天气与烈焰微粒。

### 2. 📹 纯前端 60 FPS 零延迟面捕与音频对口型 (Web VTuber Mode)
- **零依赖头部追踪**：利用原生 Chrome FaceDetector + 高敏光学质心差分算法，零延迟追踪头部偏航（Yaw）与倾斜（Roll）。
- **3D 头眼空间耦合**：头部转动时光线与眼神产生真实 3D 透视形变，近眼放大远眼压缩。
- **麦克风对口型 (Audio Lip-Sync)**：Web Audio API 实时提取语音 RMS 能量，精确驱动果冻嘴形张合。

### 3. 🤖 多模态大模型智能伴侣 (Multimodal AI Companion & BYOK)
- **本地 + 云端双模支持**：原生支持本地 Ollama（Gemma 4、Llama 3、Qwen 等）与 OpenAI / DeepSeek API。
- **实时 SSE 流式对话打字机**：流式返回逐字打字机动效，配合合成音效。
- **智能情感标签解析**：自动解析 LLM 回复中的 `[EMOTION:XYZ]` 标签，实时驱动化身表情无缝切变。
- **内置 Zero-CORS 代理服务**：Node 开发服务自带透明 Ollama 反向代理，彻底解决浏览器跨域与缓存痛点。

### 4. 🪄 AI 一键表情创造工坊 (AI Expression Creator Studio)
- **搭载专属 Agent Skill** (`.agents/skills/kuroblob-expression-creator`)：规范 6 大解剖图层与 Canvas 2D 安全准则。
- **双轨混合矢量生成架构**：
  - 支持大模型现场编写标准 Canvas 2D 绘图代码并动态编译。
  - 支持小模型语义特征提取与本地组合式矢量编译器（Composable Vector Synthesizer）。
- **实时上身与代码导出**：输入任意自然语言，左侧舞台实时 60 FPS 动态换装，支持一键复制代码与导出标准 JS 模块。

### 5. 🎨 萌系自定义设计工坊与纯净双语 (Studio & i18n)
- **可视化参数微调**：弹性系数、眼宽、眼高、倾角、球面坐标实时滑块控制。
- **纯净中英文切换**：全局 i18n 引擎，零中英混杂。
- **Web Audio 程序化音效**：纯数学合成 Pop 气泡音、打字机嘀嗒音。

---

## 🛠️ Quick Start / 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/eykicuihb/KuroBlob-AI.git
cd KuroBlob-AI/avatar-dialogue-app

# 2. 启动服务
npm start
# 服务将运行于 http://localhost:3000

# 3. 验证 Agent Skill
npm run test:skill
```

---

## 📄 License

MIT © 2026 KuroBlob AI Team
