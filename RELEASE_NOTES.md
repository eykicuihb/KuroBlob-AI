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
- **实时上身与代码导出**：输入任意自然语言（如*“海边比基尼秀”*、*“戴小黄鸭喝咖啡的可爱小猫”*），左侧舞台实时 60 FPS 动态换装，支持一键复制代码与导出标准 JS 模块。

### 5. 🎨 萌系自定义设计工坊与纯净双语 (Studio & i18n)
- **可视化参数微调**：弹性系数、眼宽、眼高、倾角、球面坐标实时滑块控制。
- **纯净中英文切换**：全局 i18n 引擎，零中英混杂。
- **Web Audio 程序化音效**：纯数学合成 Pop 气泡音、打字机嘀嗒音。

---

## 📦 What's Changed / 详细更新日志

- **feat(engine)**: 实现了 16 点贝塞尔果冻弹簧物理引擎与 60+ 款程序生成表情
- **feat(vtuber)**: 引入基于 FaceDetector + 光学质心的 60 FPS 摄像头面捕与 3D 头眼联动
- **feat(llm)**: 接入 Ollama 本地模型与 OpenAI 兼容 API，支持流式对话与情感标签驱动
- **feat(skill)**: 正式交付 `kuroblob-expression-creator` Agent Skill 及自动化 Mock Canvas 验证工具
- **feat(creator-ui)**: 上线前端【🪄 AI 一键表情创造工坊】，支持自然语言即时生成 2D 矢量表情并实时上身
- **fix(cors)**: 提供零跨域 Node 静态开发服务器与 Ollama 逆向代理
- **fix(cache)**: 注入 `?v=2.3` 强制版本穿透，防止浏览器 ES Module 强缓存

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
