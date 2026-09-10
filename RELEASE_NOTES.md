# 🚀 KuroBlob AI v0.3.0 Release Notes

> **"Animation Timeline Sequencer, Blink-Masked Morphing, Native MP4 Export & State Board"**  
> 灵动软萌的物理级 2D/3D 果冻 AI 伴侣迎来 `v0.3.0` 重大架构与功能升级！新增第四大核心工作区【🎞️ 动画时间线与剧情编排工作台】（Animation Timeline & Montage Sequencer）、闭眼遮罩形变平滑过渡（Blink-Masked Transition）、0.69x 正交深度投影矩阵、60+ 全表情全景状态展板（State Board `#planche`）、全平台通用的智能 MP4 视频直接导出、移动端触觉震动马达反馈（Haptics）、多情绪动森语调调制，以及自定义表情包一键 JSON 导入导出与代码执行安全沙箱！

---

## 🌟 What's New in v0.3.0 / 核心新特性

### 1. 🎞️ 动画时间线与剧情编排工作台 (Animation Timeline Sequencer)
- **多动作自由拼装与微调**：支持从 60+ 内置动作与 AI 自创表情中自由挑选，编排成连贯的动作剧情；每张片段卡片配备 `0.4s ~ 6.0s` 独立停留时长滑块，顶部实时汇总整轨总播放时长。
- **4 大叙事剧情预设模板**：
  - 💡 **沉思到顿悟 (Insight)**：`IDLE` (1.2s) ➔ `THINKING` (2.0s) ➔ `STAR` (1.5s) ➔ `HAPPY` (2.0s)
  - 💘 **酷帅到心动 (Romance)**：`COOL` (1.5s) ➔ `WINK` (1.0s) ➔ `SHY` (1.8s) ➔ `LOVE` (2.2s)
  - 💻 **极客黑客狂欢 (Hacker)**：`ROBOT` (1.5s) ➔ `FOCUSED` (2.0s) ➔ `FIRE` (1.5s) ➔ `PARTY` (2.5s)
  - 🌈 **阴晴雨雪彩虹 (Weather)**：`SUNNY` ➔ `WINDY` ➔ `RAIN` ➔ `THUNDER` ➔ `RAINBOW`
- **循环播放与游标高亮追踪**：一键播放时间线，正在表演的动作卡片带有紫色霓虹光晕放大高亮，并自动平滑横向居中滚动跟随。
- **🎬 一键整轨导出 MP4 剧情**：一键将整条时间线的动作序列高帧率录制并编码导出为标准的 MP4 视频，适配 Twitter/X 与微信直接发布！

### 2. 👁️ 闭眼遮罩形变过渡 (Blink-Masked Transition / x.ai 架构优化)
- **自然闭眼掩盖几何突变**：参考业界先进设计，在化身进行任何大幅度表情切换瞬间，自动触发 `0.18s` 的自然闭眼动画遮罩，视觉上彻底消除不同五官与外置配饰瞬间跳帧的生硬感。
- **0.69x 正交球面深度投影**：将垂直注视俯仰角映射对齐为真实三维球面投影公式 `ey = sin(pitch) * 0.69 * R`，头部与眼神在空间转动时更具实体 3D 纵深感。

### 3. 🧩 60+ 种全量表情状态全景展板 (State Board `#planche`)
- **全状态极速画廊**：导航栏新增 **“🧩 全景展板”** 按钮（支持深度链接 `http://localhost:3000/#planche`），弹窗展示全部 60+ 个内置与自定义动作的卡片式状态网格，点击任意卡片即可在背景即时预览切换。

### 4. 🎬 原生探测 MP4 导出 (Twitter/X & 社交媒体兼容)
- **智能格式探针**：`AnimationRecorder` 优先探测 `video/mp4;codecs=avc1.42E01E,mp4a.40.2` 与 `video/mp4`，支持现代浏览器原生直录 `.mp4`；在仅支持 WebM 的环境下平滑回退至 `video/webm`，彻底解决社交平台格式兼容痛点。

### 5. 📱 移动端防滚与触觉震动马达反馈 (Haptic Vibration)
- **精准防滚保护**：画布注入 `touch-action: none` 与 `ResizeObserver` 动态重算机制，彻底告别移动端揉捏果冻引发的页面滚动或画面模糊。
- **双模触觉马达**：捏脸拉伸回弹（`boing`）与物理过载眩晕（`dizzy`）支持调用真实手机硬件震动马达。

### 6. 🎵 多情绪动森语调调制 (Mood-Driven Vocal Chatter)
- **情绪化音阶调制**：将程序化 Web Audio 语聊根据化身情绪动态调制为 5 种不同波形和调式（开心高八度、心动柔和调、悲伤下潜音、暴走锯齿波、专注石英音），带来更加活泼生动的互动陪伴体验。

### 7. 📤 表情包专属收藏库 JSON 备份分享与重置默认
- **一键分享自创果冻**：表情包收藏库支持 **“📤 导出配置”**（下载 `.json` 文件）与 **“📥 导入配置”**（合并外部配置），方便社区二次创作与分享。
- **工坊一键“↺ 恢复默认”**：一键将工坊形变滑块、双眼倾角与三维参数还原为官方出厂基准配置。
- **Canvas 代码安全沙箱**：加入 AST 黑名单检测，阻止非绘图危险代码执行。

---

# 🚀 KuroBlob AI v0.2.0 Release Notes

### 1. 🎵 萌系程序化语聊音效与嘴形同步 (Procedural Mascot Chatter & Lip-Sync)
- **动森风程序化语调合成**：告别生硬机械的传统 TTS，采用 100% 纯数学 Web Audio API 程序化合成器，将文字逐字映射至灵动悦耳的五声音阶（Pentatonic Synth Chirp）。
- **自然有机嘴形联动**：在打字机对话吐字时，自动驱动果冻嘴形以 3~6 Hz 节奏自然开合（Organic Mouth Lip-Sync），吐字完毕自动闭合。
- **全局一键静音/开启**：顶部导航栏专属 `🔊 音效已开 / 🔇 音效已关` 开关，支持 LocalStorage 记忆。

### 2. 💾 AI 表情专属收藏库与 LocalStorage 持久化 (Expression Vault)
- **一键收藏入库**：在【🪄 AI 一键表情创造工坊】生成任意满意表情后，点击 **“💾 收藏到我的专属表情包”**。
- **动态测试网格自动注入**：收藏的表情包自动沉淀至舞台下方专属收藏区，带炫酷紫色发光边框，随时一键点击调用形变与删除管理。

### 3. 🎬 3 秒循环 60 FPS 动态表情包录制导出 (Animated WebM Exporter)
- **高帧率 Canvas 流捕获**：利用 `HTMLCanvasElement.captureStream(60)` 与 `MediaRecorder`，高保真录制 3 秒 60 FPS 动态形变。
- **一键自动下载**：支持在 AI 工坊与设计工坊一键导出 `.webm` 动图，轻松制作微信/飞书/Discord 动态表情包。

### 4. ☀️ Light 浅色模式高保真白底导出 (Light Mode White Background Export)
- **告别黑底遮盖**：解决 WebM 透明编码默认黑底导致的黑人黑夜遮盖问题。浅色模式导出视频与 PNG 时自动渲染纯白底色（`#FFFFFF`），让纯黑果冻身体与多彩配饰边界分明、极具立体质感。

### 5. 🎛️ AI 生成全图层独立自选控制面板 (Multi-Layer Layer Toggles)
- **多图层自由拆装**：3D 轨道星环（Rings）、宇宙星尘微粒（Particles）、外置道具（Accessories）、粉嫩腮红（Cheeks）4 大图层支持独立勾选与即时上身，状态胶囊动态指示 `已装配` / `自定义图层` / `已精简`。

### 6. 🟩 OBS 演播绿幕抠像模式 (OBS Chroma Green Screen)
- **直播级色度键抠像**：舞台顶部一键切换 **“🟩 OBS 绿幕”** 模式，Canvas 背景瞬间切换为纯正色度绿 `#00FF00`，主播可直接在 OBS Studio 中添加窗口采集并过滤绿幕！

### 7. 🫳 疯狂拉扯物理过载与眩晕互动 (Physical Pinch Overload & Dizzy Reaction)
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
