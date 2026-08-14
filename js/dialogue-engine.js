import { SentimentAnalyzer } from './sentiment-analyzer.js';
import { llmProvider } from './llm-provider.js';
import { soundFx } from './sound-fx.js';

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
      SUNNY: [
        '今天外面的天气怎么样呢？无论是晴空万里还是微风细雨，KuroBlob 的头顶都已经为你撑起一弯彩虹啦！☀️🌈',
        '晴空万里大太阳！心情也跟着暖洋洋起来啦！☀️'
      ],
      IDLE: [
        '哈喽！我是您的 KuroBlob AI 萌宠伴侣，随时准备聆听您的指令或为您展现 50 种生动表情！✨'
      ]
    };
  }

  /**
   * Process a user message end-to-end (Real LLM or Local NLP Engine)
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

    // Branch A: Real BYOK LLM is configured and enabled!
    if (llmProvider.isConfigured()) {
      const aiMessage = {
        sender: 'ai',
        text: '',
        emotion: 'THINKING',
        confidence: 0.95,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRealLLM: true
      };
      this.history.push(aiMessage);

      try {
        let currentEmotion = 'HAPPY';
        const finalCleanText = await llmProvider.streamChat(
          this.history.slice(0, -1),
          (chunkText) => {
            aiMessage.text = chunkText;
            if (this.onMessageUpdate) this.onMessageUpdate(this.history, { emotion: currentEmotion, confidence: 0.95 });
          },
          (detectedEmotion) => {
            currentEmotion = detectedEmotion;
            aiMessage.emotion = detectedEmotion;
            this.avatar.setEmotion(detectedEmotion);
          }
        );

        aiMessage.text = finalCleanText;
        if (aiMessage.emotion === 'THINKING') {
          // Fallback inference if no explicit tag was returned
          const finalAnalysis = this.analyzer.analyze(finalCleanText);
          const mood = finalAnalysis.emotion !== 'IDLE' ? finalAnalysis.emotion : 'HAPPY';
          aiMessage.emotion = mood;
          this.avatar.setEmotion(mood);
        }
      } catch (err) {
        console.error('Real LLM streaming failed:', err);
        aiMessage.text = `⚠️ AI 请求异常: ${err.message || '请检查 API Key 和网络配置'}`;
        aiMessage.emotion = 'CONFUSED';
        this.avatar.setEmotion('CONFUSED');
      }

      if (this.onMessageUpdate) this.onMessageUpdate(this.history, { emotion: aiMessage.emotion, confidence: 0.95 });
      if (this.onMessageComplete) this.onMessageComplete(aiMessage.text, aiMessage.emotion);
      this.isGenerating = false;
      return;
    }

    // Branch B: Built-in local NLP rule-based engine
    await this.sleep(800);

    // High Priority Specific Query Matchers
    const lower = userText.toLowerCase().trim();
    let responseText = null;
    let finalAIEmotion = userAnalysis.emotion;

    if (/joke|笑话|讲个笑话|说个笑话|来个笑话|逗我/i.test(lower)) {
      const jokes = [
        '给你讲个冷笑话：一只皮卡丘走在路上摔了一跤，结果变成了什么？……变成了“皮卡乒乓球”！哈哈哈哈！🤣',
        '有一天，0 看到 8 说：“哟，胖就胖呗，还系什么皮带呀！” 哈哈哈！😂',
        '小明去买西瓜问老板：“这西瓜甜吗？” 老板说：“不甜不要钱！” 小明说：“太好了，那给我来两个不甜的！” 哈哈哈！'
      ];
      responseText = jokes[Math.floor(Math.random() * jokes.length)];
      finalAIEmotion = 'LAUGHING';
    } else if (/hello|hi|你好|哈喽|在吗|早上好|下午好|晚上好/i.test(lower)) {
      const hellos = [
        '哈喽呀！我是你的 AI 萌宠表情伴侣 KuroBlob！今天想和我聊点什么呢？随时可以问我问题或让我换个表情哦！✨',
        '嗨！很高兴见到你！今天心情怎么样呀？快看我充满活力的果冻跳跃～ 😄'
      ];
      responseText = hellos[Math.floor(Math.random() * hellos.length)];
      finalAIEmotion = 'HAPPY';
    } else if (/笑一个|笑一笑|开心点|笑一下/i.test(lower)) {
      const smiles = [
        '嘻嘻～ (露出两颗小虎牙笑眯眯) 😄 看我的无敌开心脸，嘴角上扬，心情瞬间放晴啦！',
        '哈哈！大大的微笑送给你！愿你今天每一秒都被快乐包围～ 🌟'
      ];
      responseText = smiles[Math.floor(Math.random() * smiles.length)];
      finalAIEmotion = 'HAPPY';
    } else if (/天气|今天天气|晴天|下雨/i.test(lower)) {
      const weathers = [
        '今天外面的天气怎么样呢？无论是晴空万里还是微风细雨，KuroBlob 的头顶都已经为你撑起一弯彩虹啦！☀️🌈',
        '如果是大晴天就尽情享受温暖阳光，如果是下雨天就听听雨声喝杯热茶吧！随时注意增减衣物哦～ ☕'
      ];
      responseText = weathers[Math.floor(Math.random() * weathers.length)];
      finalAIEmotion = 'SUNNY';
    } else if (/你是谁|自我介绍|介绍一下/i.test(lower)) {
      responseText = '我是 KuroBlob AI！一个拥有生命感物理引擎、50 种程序化表情和 VTuber 面捕能力的智能萌宠伴侣！很高兴认识你！👾';
      finalAIEmotion = 'HAPPY';
    } else if (/变身|忍者|魔法|魔术/i.test(lower)) {
      responseText = '呼啦啦～ 变身时刻到！看我瞬间展开专属战袍与酷炫特效！🥷✨';
      finalAIEmotion = 'NINJA';
    } else {
      // Pick AI Response Text based on intent pool
      const pool = this.responses[userAnalysis.emotion] || this.responses.IDLE;
      responseText = pool[Math.floor(Math.random() * pool.length)];
    }

    const aiAnalysis = this.analyzer.analyze(responseText);
    if (!finalAIEmotion || finalAIEmotion === 'IDLE') {
      finalAIEmotion = (aiAnalysis.confidence > 0.4 && aiAnalysis.emotion !== 'IDLE')
        ? aiAnalysis.emotion
        : userAnalysis.emotion;
    }

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
      if (i % 2 === 0) {
        soundFx.playMascotChatter(responseText[i], i);
        this.avatar.setFaceTracking(true, { mouthOpen: (Math.sin(i * 0.85) * 0.35 + 0.35) });
      }
      if (this.onMessageUpdate) this.onMessageUpdate(this.history, aiAnalysis);
      await this.sleep(25);
    }

    // Close mouth upon typing completion
    this.avatar.setFaceTracking(false, { mouthOpen: 0 });

    // 6. Response Stream Finished: Set Avatar Emotion strictly to match AI Response Text!
    await this.sleep(150);
    this.avatar.setEmotion(finalAIEmotion);
    soundFx.emotionReaction(finalAIEmotion);

    if (this.onMessageUpdate) this.onMessageUpdate(this.history, aiAnalysis);
    if (this.onMessageComplete) this.onMessageComplete(aiMessage.text, finalAIEmotion);

    this.isGenerating = false;
  }

  appendSystemMessage(text, emotion = 'DIZZY') {
    this.history.push({
      sender: 'ai',
      text,
      emotion,
      confidence: 1.0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    if (this.onMessageUpdate) this.onMessageUpdate(this.history, { emotion, confidence: 1.0 });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
