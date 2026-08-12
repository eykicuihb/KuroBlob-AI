/**
 * SentimentAnalyzer - Real-time Natural Language Sentiment & Intent Classifier
 * Analyzes dialogue content to automatically determine expression states.
 */

export class SentimentAnalyzer {
  constructor() {
    // Emotion lexicon & regex pattern rules (Supporting Chinese & English)
    this.rules = {
      ANGRY: {
        keywords: ['生气', '讨厌', '垃圾', '笨', '重写', '搞什么', '太差', '闭嘴', '滚', '极差', '怒', 'angry', 'hate', 'stupid', 'terrible', 'horrible', 'shut up', 'useless', 'bad', 'wrong'],
        regex: /(生气|讨厌|太差|搞什么|闭嘴|重写|垃圾|angry|hate|terrible|useless)/i,
        weight: 3.5
      },
      THINKING: {
        keywords: ['为什么', '如何', '怎么', '分析', '思考', '算一下', '原理', '解释', '推导', '对比', 'why', 'how', 'analyze', 'think', 'explain', 'calculate', 'reason', 'compare', 'logic'],
        regex: /(\?|？|为什么|如何|怎么|分析|思考|原理|解释|推导|why|how|analyze|explain)/i,
        questionWeight: 2.0
      },
      WRITING: {
        keywords: ['写', '生成', '代码', '文章', '故事', '总结', '大纲', '列表', '草稿', 'write', 'generate', 'code', 'story', 'summarize', 'draft', 'list', 'create', 'script'],
        regex: /(写一段|写一篇|生成|代码|故事|总结|大纲|write|generate|create|code|story|summarize)/i
      },
      HAPPY: {
        keywords: ['哈哈', '太棒了', '谢谢', '厉害', '牛', '喜欢', '开心', '赞', '幽默', '笑话', 'haha', 'great', 'awesome', 'thanks', 'cool', 'love', 'happy', 'joke', 'nice'],
        regex: /(哈哈|太棒了|谢谢|厉害|开心|赞|笑话|haha|great|awesome|thanks|love)/i
      },
      SURPRISED: {
        keywords: ['哇', '真的吗', '天啊', '竟然', '难以置信', '震惊', 'wow', 'omg', 'really', 'unbelievable', 'shocking', 'surprised'],
        regex: /(哇|天啊|真的吗|竟然|难以置信|wow|omg|incredible)/i
      },
      CONFUSED: {
        keywords: ['不懂', '什么意思', '不明白', '疑惑', '离谱', '奇怪', 'confused', 'huh', 'pardon', 'what', 'unclear', 'doubt'],
        regex: /(不懂|什么意思|不明白|疑惑|奇怪|confused|huh|what\?)/i
      },
      SLEEPING: {
        keywords: ['晚安', '休息', '睡觉', '退下', '睡了', 'sleep', 'goodnight', 'rest', 'bye'],
        regex: /(晚安|休息|睡觉|睡了|goodnight|sleep|bye)/i
      },
      LOVE: {
        keywords: ['爱', '亲亲', '可爱', '表白', '喜欢你', '心动', '粉色', 'cute', 'love you', 'adore', 'sweet', 'heart'],
        regex: /(爱|可爱|心动|表白|喜欢你|cute|love|sweet)/i
      },
      LAUGHING: {
        keywords: ['笑死', '爆笑', '太逗了', '搞笑', 'lol', 'lmao', 'rofl', 'hilarious', 'funny'],
        regex: /(笑死|爆笑|太逗了|搞笑|lol|lmao|hilarious)/i
      },
      SAD: {
        keywords: ['难过', '伤心', '哭了', '遗憾', '痛苦', '失望', 'sad', 'cry', 'disappointed', 'sorry', 'heartbroken'],
        regex: /(难过|伤心|哭了|遗憾|痛苦|sad|cry|sorry)/i
      },
      SHOCKED: {
        keywords: ['害怕', '发抖', '恐慌', '吓人', '恐怖', 'scared', 'afraid', 'terrified', 'fear'],
        regex: /(害怕|发抖|吓人|恐怖|scared|afraid)/i
      },
      SMUG: {
        keywords: ['傲娇', '得意', '自豪', '赢了', '不愧是我', 'smug', 'proud', 'pro', 'flex'],
        regex: /(得意|自豪|不愧是我|傲娇|smug|proud)/i
      },
      FOCUSED: {
        keywords: ['专注', '调试', '精细', '深度', 'focus', 'deep', 'debug', 'precise'],
        regex: /(专注|调试|精细|focus|debug)/i
      },
      DIZZY: {
        keywords: ['晕', '头晕', '转圈', '乱七八糟', '眼花', 'dizzy', 'spin', 'whirl'],
        regex: /(晕|头晕|转圈|眼花|dizzy|spin)/i
      },
      SHY: {
        keywords: ['害羞', '脸红', '不好意思', '脸颊', '腼腆', 'shy', 'blush', 'bashful'],
        regex: /(害羞|脸红|不好意思|腼腆|shy|blush)/i
      },
      EVIL: {
        keywords: ['阴险', '坏笑', '邪恶', '算计', '反派', 'evil', 'wicked', 'scheme', 'villain'],
        regex: /(阴险|坏笑|邪恶|算计|evil|wicked)/i
      },
      HYPED: {
        keywords: ['嗨', '兴奋', '燃起来了', '极度兴奋', '狂热', 'hype', 'hyped', 'pumped', 'excited'],
        regex: /(嗨|兴奋|燃起来了|狂热|hype|hyped|pumped)/i
      },
      BORED: {
        keywords: ['无聊', '没意思', '翻白眼', '乏味', '无趣', 'bored', 'boring', 'unamused', 'dull'],
        regex: /(无聊|没意思|翻白眼|乏味|bored|boring)/i
      },
      WINK: {
        keywords: ['眨眼', '调皮', '淘气', '眨眨眼', 'wink', 'playful', 'tease'],
        regex: /(眨眼|调皮|淘气|眨眨眼|wink)/i
      },
      COOL: {
        keywords: ['酷', '帅', '装逼', '墨镜', '大佬', 'cool', 'swag', 'chill', 'boss'],
        regex: /(酷|帅|墨镜|大佬|cool|swag)/i
      },
      NERVOUS: {
        keywords: ['紧张', '流汗', '忐忑', '慌张', '捏一把汗', 'nervous', 'sweat', 'anxious', 'panicked'],
        regex: /(紧张|流汗|忐忑|慌张|nervous|sweat)/i
      },
      PARTY: {
        keywords: ['庆祝', '派对', '狂欢', '乾杯', '洒花', 'party', 'celebrate', 'cheers'],
        regex: /(庆祝|派对|狂欢|洒花|party|celebrate)/i
      },
      DISGUSTED: {
        keywords: ['嫌弃', '恶心', '吐了', '离远点', '晦气', 'eww', 'gross', 'disgusted', 'nasty'],
        regex: /(嫌弃|恶心|吐了|晦气|eww|gross|disgusted)/i
      },
      ROBOT: {
        keywords: ['机器人', '系统', '硬核', '矩阵', '指令', 'robot', 'system', 'matrix', 'bot'],
        regex: /(机器人|系统模式|矩阵|robot|system|matrix)/i
      },
      BOBA: {
        keywords: ['汪汪', '卖萌', '大眼睛', '波霸眼', 'boba', 'puppy'],
        regex: /(汪汪|卖萌|大眼睛|波霸眼|boba|puppy)/i
      },
      CAT: {
        keywords: ['猫咪', '喵喵', '吐舌', '猫', 'neko', 'cat', 'meow'],
        regex: /(猫咪|喵喵|吐舌|猫|neko|cat|meow)/i
      },
      RABBIT: {
        keywords: ['兔兔', '兔子', '蹦蹦跳跳', 'bunny', 'rabbit'],
        regex: /(兔兔|兔子|蹦蹦跳跳|bunny|rabbit)/i
      },
      ANGEL: {
        keywords: ['天使', '圣光', '金光', '光环', 'angel', 'holy', 'halo'],
        regex: /(天使|圣光|金光|光环|angel|holy)/i
      },
      DEVIL: {
        keywords: ['恶魔', '小恶魔', '红角', 'devil', 'demon'],
        regex: /(恶魔|小恶魔|红角|devil|demon)/i
      },
      GHOST: {
        keywords: ['幽灵', '鬼鬼', 'boo', 'ghost', 'spooky'],
        regex: /(幽灵|鬼鬼|boo|ghost|spooky)/i
      },
      BOUNCY: {
        keywords: ['果冻', 'q弹', '软糯', 'jelly', 'bouncy'],
        regex: /(果冻|q弹|软糯|jelly|bouncy)/i
      },
      YAWN: {
        keywords: ['打哈欠', '犯困', '打哈气', 'yawn', 'sleepyhead'],
        regex: /(打哈欠|犯困|打哈气|yawn)/i
      },
      PUFF: {
        keywords: ['鼓腮帮子', '嘟嘴', '生气气', 'pout', 'puff'],
        regex: /(鼓腮帮子|嘟嘴|生气气|pout|puff)/i
      },
      STAR: {
        keywords: ['星星眼', '崇拜', '闪耀', 'star', 'sparkle'],
        regex: /(星星眼|崇拜|闪耀|star|sparkle)/i
      },
      PIRATE: {
        keywords: ['海盗', '眼罩', '船长', 'pirate'],
        regex: /(海盗|眼罩|船长|pirate)/i
      },
      SUPERHERO: {
        keywords: ['超级英雄', '斗篷', '英雄', 'hero', 'superhero'],
        regex: /(超级英雄|斗篷|英雄|hero)/i
      },
      PANDA: {
        keywords: ['熊猫', '大熊猫', '黑眼圈', 'panda'],
        regex: /(熊猫|大熊猫|黑眼圈|panda)/i
      },
      MUSIC: {
        keywords: ['听音乐', '跳舞', '摇摆', '音符', 'music', 'dance'],
        regex: /(听音乐|跳舞|摇摆|音符|music|dance)/i
      },
      FOODIE: {
        keywords: ['流口水', '馋嘴', '好吃', '美食', 'yummy', 'foodie'],
        regex: /(流口水|馋嘴|好吃|美食|yummy)/i
      },
      SNOW: {
        keywords: ['发抖', '冰冻', '雪人', '好冷', 'freeze', 'snow'],
        regex: /(发抖|冰冻|雪人|好冷|freeze|snow)/i
      },
      FIRE: {
        keywords: ['燃烧', '火焰', '激情', 'fire', 'flame'],
        regex: /(燃烧|火焰|激情|fire|flame)/i
      },
      ALIEN: {
        keywords: ['外星人', '触角', 'ufo', 'alien'],
        regex: /(外星人|触角|ufo|alien)/i
      },
      MAGIC: {
        keywords: ['魔法', '魔法师', '魔咒', 'magic', 'wizard'],
        regex: /(魔法|魔法师|魔咒|magic|wizard)/i
      },
      NINJA: {
        keywords: ['忍者', '隐身', '掩面', 'ninja'],
        regex: /(忍者|隐身|掩面|ninja)/i
      },
      MARSHMALLOW: {
        keywords: ['棉花糖', '云朵', '超软', 'marshmallow', 'cloud'],
        regex: /(棉花糖|云朵|超软|marshmallow|cloud)/i
      },
      PIXEL: {
        keywords: ['像素', '8比特', '复古', 'pixel', 'retro'],
        regex: /(像素|8比特|复古|pixel|retro)/i
      },
      COSMIC: {
        keywords: ['宇宙', '星系', '星球', 'cosmic', 'galaxy'],
        regex: /(宇宙|星系|星球|cosmic|galaxy)/i
      },
      ZEN: {
        keywords: ['打坐', '静心', '禅修', 'zen', 'meditate'],
        regex: /(打坐|静心|禅修|zen|meditate)/i
      },
      CELEBRITY: {
        keywords: ['偶像', '打光', '明星', 'celebrity', 'idol'],
        regex: /(偶像|打光|明星|celebrity|idol)/i
      },
      SUNNY: {
        keywords: ['晴天', '太阳', '大晴天', '艳阳高照', 'sunny', 'sun'],
        regex: /(晴天|太阳|大晴天|艳阳高照|sunny|sun)/i
      },
      RAIN: {
        keywords: ['下雨', '小雨', '雨天', '淋雨', 'rain', 'rainy'],
        regex: /(下雨|小雨|雨天|淋雨|rain|rainy)/i
      },
      THUNDER: {
        keywords: ['雷阵雨', '打雷', '闪电', '暴风雨', 'thunder', 'storm', 'lightning'],
        regex: /(雷阵雨|打雷|闪电|暴风雨|thunder|storm|lightning)/i
      },
      SNOWY: {
        keywords: ['下雪', '大雪', '雪花', '积雪', 'snow', 'snowy'],
        regex: /(下雪|大雪|雪花|积雪|snow|snowy)/i
      },
      WINDY: {
        keywords: ['刮风', '大风', '狂风', 'wind', 'windy', 'breeze'],
        regex: /(刮风|大风|狂风|wind|windy)/i
      },
      FOGGY: {
        keywords: ['大雾', '雾霾', '起雾', 'fog', 'foggy', 'mist'],
        regex: /(大雾|雾霾|起雾|fog|foggy|mist)/i
      },
      RAINBOW: {
        keywords: ['彩虹', '雨过天晴', '七彩', 'rainbow'],
        regex: /(彩虹|雨过天晴|七彩|rainbow)/i
      },
      HAIL: {
        keywords: ['冰雹', '下冰雹', 'hail'],
        regex: /(冰雹|下冰雹|hail)/i
      },
      TORNADO: {
        keywords: ['台风', '龙卷风', 'tornado', 'typhoon'],
        regex: /(台风|龙卷风|tornado|typhoon)/i
      }
    };
  }

  /**
   * Analyze input text and return predicted emotion & confidence score
   */
  analyze(text) {
    if (!text || text.trim() === '') {
      return { emotion: 'IDLE', confidence: 1.0, scores: {} };
    }

    const cleanText = text.toLowerCase();
    const scores = {
      THINKING: 0,
      WRITING: 0,
      ANGRY: 0,
      HAPPY: 0,
      SURPRISED: 0,
      CONFUSED: 0,
      SLEEPING: 0,
      LOVE: 0,
      LAUGHING: 0,
      SAD: 0,
      SHOCKED: 0,
      SMUG: 0,
      FOCUSED: 0,
      DIZZY: 0,
      SHY: 0,
      EVIL: 0,
      HYPED: 0,
      BORED: 0,
      WINK: 0,
      COOL: 0,
      NERVOUS: 0,
      PARTY: 0,
      DISGUSTED: 0,
      ROBOT: 0,
      BOBA: 0,
      CAT: 0,
      RABBIT: 0,
      ANGEL: 0,
      DEVIL: 0,
      GHOST: 0,
      BOUNCY: 0,
      YAWN: 0,
      PUFF: 0,
      STAR: 0,
      PIRATE: 0,
      SUPERHERO: 0,
      PANDA: 0,
      MUSIC: 0,
      FOODIE: 0,
      SNOW: 0,
      FIRE: 0,
      ALIEN: 0,
      MAGIC: 0,
      NINJA: 0,
      MARSHMALLOW: 0,
      PIXEL: 0,
      COSMIC: 0,
      ZEN: 0,
      CELEBRITY: 0,
      SUNNY: 0,
      RAIN: 0,
      THUNDER: 0,
      SNOWY: 0,
      WINDY: 0,
      FOGGY: 0,
      RAINBOW: 0,
      HAIL: 0,
      TORNADO: 0,
      IDLE: 0.1
    };

    // Analyze pattern matches
    for (const [emotion, rule] of Object.entries(this.rules)) {
      // Keyword matching
      for (const kw of rule.keywords) {
        if (cleanText.includes(kw)) {
          scores[emotion] += 1.5;
        }
      }

      // Regex matching
      if (rule.regex && rule.regex.test(cleanText)) {
        scores[emotion] += 2.0;
      }
    }

    // Punctuation bonuses
    const questionCount = (text.match(/[\?？]/g) || []).length;
    if (questionCount > 0) {
      scores.THINKING += questionCount * 1.5;
      scores.CONFUSED += questionCount * 0.8;
    }

    const exclamationCount = (text.match(/[!！]/g) || []).length;
    if (exclamationCount > 0) {
      scores.ANGRY += exclamationCount * 1.2;
      scores.SURPRISED += exclamationCount * 1.0;
      scores.HAPPY += exclamationCount * 0.8;
    }

    // Length heuristics (long inputs imply thinking or writing requests)
    if (text.length > 50 && scores.WRITING === 0 && scores.THINKING === 0) {
      scores.THINKING += 1.0;
    }

    // Find highest score
    let highestEmotion = 'IDLE';
    let maxScore = 0;
    let totalScore = 0;

    for (const [emotion, score] of Object.entries(scores)) {
      totalScore += score;
      if (score > maxScore) {
        maxScore = score;
        highestEmotion = emotion;
      }
    }

    // Calculate confidence (0.5 to 0.99)
    const confidence = totalScore > 0 ? Math.min(0.99, Math.max(0.5, maxScore / totalScore)) : 1.0;

    return {
      emotion: highestEmotion,
      confidence: parseFloat(confidence.toFixed(2)),
      scores
    };
  }
}
