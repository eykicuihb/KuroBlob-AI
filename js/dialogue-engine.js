/**
 * DialogueEngine - Natural Language Conversation & State Controller
 * Manages the dialogue stream and coordinates real-time avatar expression transitions.
 */

import { SentimentAnalyzer } from './sentiment-analyzer.js';

export class DialogueEngine {
  constructor(avatarRenderer, onMessageUpdate) {
    this.avatar = avatarRenderer;
    this.analyzer = new SentimentAnalyzer();
    this.onMessageUpdate = onMessageUpdate; // Callback to update UI
    this.history = [];
    this.isGenerating = false;

    // AI Response Templates per Emotion (Each text contains explicit sentiment)
    this.responses = {
      THINKING: [
        '这是一个深度问题。正在为您从原理、公式和逻辑三个层面上深入分析思考...',
        '正在分析上下文数据建模... 根据动态计算结果，核心算法模型推导完成！'
      ],
      WRITING: [
        '为您生成了对应的 JS 实现模块，包含 3D 轨道彩虹环与萌系双胶囊眼！',
        '已为您构架完整的代码流程，在文本流输出过程中，Avatar 会保持 WRITING 粒子律动。'
      ],
      ANGRY: [
        '怎么又出错误了？这太让人生气了！生气讨厌！我立刻重新检查代码！',
        '非常抱歉！这确实太差劲了！我非常生气重写并修正这个问题！'
      ],
      HAPPY: [
        '太棒啦！收到您的夸奖好开心呀！哈哈，真的非常高兴能帮到您！',
        '哈哈！太棒了！谢谢您的肯定，今天心情太好啦！'
      ],
      LOVE: [
        '哇... 听到你这么说我好心动心跳啊！太可爱了，我也超级喜欢你！',
        '表白成功！心动粉色红晕升起，我真的太爱这种感觉啦！'
      ],
      SHY: [
        '哎呀... 害羞脸红不好意思啦 😳 捂脸腼腆，谢谢你的夸奖...',
        '有点害羞脸红... 被你夸得不好意思了呢。'
      ],
      LAUGHING: [
        '哈哈哈哈笑死我了太逗了！爆笑根本停不下来，简直太搞笑了！',
        '笑死我了！太逗了，哈哈哈哈！'
      ],
      SAD: [
        '太难过了... 听到这个消息我感到好伤心好遗憾失望，想哭 🥺',
        '真的好遗憾伤心难过... 抱抱你，希望一切都会好起来。'
      ],
      SHOCKED: [
        '天啊！好害怕发抖吓人！恐慌震惊中... 怎么会这样！',
        '吓死我了！太恐怖害怕发抖了！'
      ],
      SMUG: [
        '不愧是我！轻松搞定，得意傲娇自豪，这对我来说简直小菜一碟！',
        '哼哼！得意自豪，完美解决！'
      ],
      FOCUSED: [
        '进入深度专注调试状态，精确扫描每一个数据节点与逻辑细节！',
        '高度专注，全神贯注处理当前任务！'
      ],
      DIZZY: [
        '哎呀好晕啊！眼花转圈圈，头晕目眩乱七八糟中...',
        '转圈转得好晕，眼花缭乱啦！'
      ],
      SURPRISED: [
        '哇！天啊！难以置信！竟然真的能完美呈现，太令人震惊了！',
        '哇塞！这也太神奇了吧！太令人惊喜震惊了！'
      ],
      CONFUSED: [
        '嗯？感到非常疑惑不懂... 请问您具体是什么意思呢？（歪头）',
        '不明白疑惑中... 能否稍微说明一下具体参数？'
      ],
      SLEEPING: [
        '呼... 累啦晚安！进入睡觉休息模式，准备晚安睡了 zZZ...',
        '晚安！祝你有一个好梦，休息去啦。'
      ],
      CAT: [
        '喵喵～ 猫咪吐舌萌萌哒！可爱猫猫在线为你服务～ 🐱',
        '喵呜～ 变成小猫咪啦！'
      ],
      DEVIL: [
        '嘿嘿！小恶魔红角模式启动！坏笑准备搞个恶作剧 👿',
        '坏笑！小恶魔来啦！'
      ],
      ANGEL: [
        '天使圣光金光闪耀！愿光环守护你的代码与每一天 😇',
        '圣光庇佑，天使祈福！'
      ],
      HYPED: [
        '太燃了！狂热极度兴奋！我已经完全燃起来了！🔥',
        '超嗨狂热！激情爆表！'
      ],
      BORED: [
        '太无聊了... 没什么意思翻白眼，感觉好乏味无趣 🙄',
        '无聊无趣翻白眼... 有什么有意思的事吗？'
      ],
      COOL: [
        '看我戴墨镜大佬装逼，酷吧！Cool & Swag 😎',
        '帅气大佬登场，保持酷感！'
      ],
      ROBOT: [
        '系统模式已启动，矩阵硬核指令正在执行！🤖',
        '机器人硬核系统模式，逻辑校验完毕！'
      ],
      IDLE: [
        '我是您的 AI 动态表情助手，随时准备聆听您的指令！'
      ]
    };
  }

  /**
   * Process a user message end-to-end
   */
  async processUserMessage(userText) {
    if (this.isGenerating || !userText.trim()) return;

    this.isGenerating = true;

    // 1. Analyze User Input Sentiment
    const userAnalysis = this.analyzer.analyze(userText);
    
    // Push user message to history
    this.history.push({
      sender: 'user',
      text: userText,
      emotion: userAnalysis.emotion,
      confidence: userAnalysis.confidence,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    if (this.onMessageUpdate) this.onMessageUpdate(this.history, userAnalysis);

    // 2. Avatar enters THINKING state (3D Orbital Rings spin)
    this.avatar.setEmotion('THINKING');
    await this.sleep(1200);

    // 3. Pick AI Response Text based on intent
    const pool = this.responses[userAnalysis.emotion] || this.responses.IDLE;
    const responseText = pool[Math.floor(Math.random() * pool.length)];

    // 4. Analyze AI Response Text Sentiment (Strict Alignment with Fallback)
    const aiAnalysis = this.analyzer.analyze(responseText);
    const finalAIEmotion = (aiAnalysis.confidence > 0.4 && aiAnalysis.emotion !== 'IDLE')
      ? aiAnalysis.emotion
      : userAnalysis.emotion;

    // During text streaming, set to WRITING particles if generating code, otherwise set to target emotion
    const isWritingTask = userAnalysis.emotion === 'WRITING';
    if (isWritingTask) {
      this.avatar.setEmotion('WRITING');
    } else {
      this.avatar.setEmotion(finalAIEmotion);
    }

    // 5. Stream response text character by character
    const aiMessage = {
      sender: 'ai',
      text: '',
      emotion: finalAIEmotion,
      confidence: aiAnalysis.confidence > 0.4 ? aiAnalysis.confidence : userAnalysis.confidence,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.history.push(aiMessage);

    for (let i = 0; i < responseText.length; i++) {
      aiMessage.text += responseText[i];
      if (this.onMessageUpdate) this.onMessageUpdate(this.history, aiAnalysis);
      await this.sleep(30);
    }

    // 6. Response Stream Finished: Set Avatar Emotion strictly to match AI Response Text!
    await this.sleep(300);
    this.avatar.setEmotion(finalAIEmotion);

    if (this.onMessageUpdate) this.onMessageUpdate(this.history, aiAnalysis);

    this.isGenerating = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
