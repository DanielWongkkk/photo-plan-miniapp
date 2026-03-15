/**
 * AI 每周推荐服务
 * 根据季节、节日、热点等生成拍摄主题推荐
 */

const axios = require('axios');

class RecommendationService {
  constructor(config) {
    this.aiConfig = config.ai || {};
  }

  /**
   * 生成每周推荐
   * @returns {Promise<Array>} 推荐列表
   */
  async generateWeeklyRecommendations() {
    const now = new Date();
    const weekNum = this.getWeekNumber(now);
    const season = this.getSeason(now);
    const month = now.getMonth() + 1;
    
    // 基于 AI 生成推荐
    const recommendations = await this.generateByAI(season, month, weekNum);
    
    return recommendations;
  }

  /**
   * 获取所有历史推荐
   */
  async getAllRecommendations() {
    // TODO: 从数据库获取
    // 目前返回模拟数据
    return this.getMockHistory();
  }

  /**
   * 通过 AI 生成推荐
   */
  async generateByAI(season, month, weekNum) {
    const prompt = `你是一位专业的摄影策划师。现在是${season}（${month}月），请根据以下要求推荐4-5个适合拍摄的摄影主题：

1. 结合当前季节特点（花期、天气、光线等）
2. 考虑临近的节日或特殊日期
3. 推荐热门、易出片的主题
4. 每个主题给出具体的拍摄地点建议

请以 JSON 数组格式返回，每项包含：
- title: 主题标题（带 emoji 前缀，如 "🌸 春日樱花人像"）
- subtitle: 副标题（简短描述，10字以内）
- theme: 主题类型（人像/风景/街拍/夜景等）
- location: 推荐地点（多个用 / 分隔）
- reason: 推荐理由（30字以内）
- tags: 标签数组（3个标签）
- hot: 是否热门（boolean）

只返回 JSON 数组，不要其他文字。`;

    try {
      const response = await this.callAI(prompt);
      const recommendations = this.parseAIResponse(response);
      
      // 添加元数据
      const week = `${new Date().getFullYear()}年第${weekNum}周`;
      const createdAt = new Date().toISOString().split('T')[0];
      
      return recommendations.map((rec, index) => ({
        id: `rec_${Date.now()}_${index}`,
        week,
        ...rec,
        hot: rec.hot || index === 0, // 第一个默认热门
        createdAt
      }));
    } catch (error) {
      console.error('Generate recommendations error:', error.message);
      return this.getDefaultRecommendations(season, month, weekNum);
    }
  }

  /**
   * 调用 AI
   */
  async callAI(prompt) {
    const provider = this.aiConfig.providers?.[this.aiConfig.defaultProvider];
    
    if (!provider || !provider.enabled) {
      throw new Error('AI 服务未配置');
    }

    const response = await axios.post(
      `${provider.baseUrl}/chat/completions`,
      {
        model: provider.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * 解析 AI 返回
   */
  parseAIResponse(response) {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error('Parse AI response error:', error);
      return [];
    }
  }

  /**
   * 获取季节
   */
  getSeason(date) {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return '春季';
    if (month >= 6 && month <= 8) return '夏季';
    if (month >= 9 && month <= 11) return '秋季';
    return '冬季';
  }

  /**
   * 获取周数
   */
  getWeekNumber(date) {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstDay.getDay() + 1) / 7);
  }

  /**
   * 默认推荐（根据季节）
   */
  getDefaultRecommendations(season, month, weekNum) {
    const week = `${new Date().getFullYear()}年第${weekNum}周`;
    const createdAt = new Date().toISOString().split('T')[0];
    
    const seasonMap = {
      '春季': [
        {
          id: `rec_${Date.now()}_1`,
          week,
          title: '🌸 春日樱花人像',
          subtitle: '花期正盛，错过再等一年',
          theme: '人像',
          location: '公园 / 景区樱花园',
          reason: '春季樱花盛开，是拍摄人像的最佳时节',
          tags: ['樱花', '日系', '人像'],
          hot: true,
          createdAt
        },
        {
          id: `rec_${Date.now()}_2`,
          week,
          title: '🌷 郁金香花海',
          subtitle: '春日限定，色彩斑斓',
          theme: '风景',
          location: '植物园 / 花海景区',
          reason: '郁金香花期短暂，色彩丰富',
          tags: ['郁金香', '花海', '春日'],
          hot: false,
          createdAt
        },
        {
          id: `rec_${Date.now()}_3`,
          week,
          title: '🏔️ 山野徒步摄影',
          subtitle: '春暖花开，山间寻景',
          theme: '风景',
          location: '郊野山岭 / 国家公园',
          reason: '春季山间野花盛开，适合徒步拍摄',
          tags: ['山野', '徒步', '风光'],
          hot: false,
          createdAt
        },
        {
          id: `rec_${Date.now()}_4`,
          week,
          title: '🌅 日出云海',
          subtitle: '清晨登高，云海翻涌',
          theme: '风景',
          location: '山顶观景台',
          reason: '春季早晚温差大，易形成云海',
          tags: ['日出', '云海', '风光'],
          hot: false,
          createdAt
        }
      ],
      '夏季': [
        {
          id: `rec_${Date.now()}_1`,
          week,
          title: '🌻 向日葵花海',
          subtitle: '夏日金黄，阳光灿烂',
          theme: '风景',
          location: '向日葵基地',
          reason: '夏季向日葵盛开，金黄一片',
          tags: ['向日葵', '夏日', '花海'],
          hot: true,
          createdAt
        },
        {
          id: `rec_${Date.now()}_2`,
          week,
          title: '🏖️ 海边人像',
          subtitle: '阳光沙滩，夏日风情',
          theme: '人像',
          location: '海边沙滩',
          reason: '夏季海边光线充足，适合拍摄',
          tags: ['海边', '夏日', '人像'],
          hot: false,
          createdAt
        }
      ],
      '秋季': [
        {
          id: `rec_${Date.now()}_1`,
          week,
          title: '🍂 银杏人像',
          subtitle: '金黄满地，秋意浓浓',
          theme: '人像',
          location: '银杏大道 / 古寺',
          reason: '秋季银杏金黄，是拍摄人像的绝佳背景',
          tags: ['银杏', '秋日', '人像'],
          hot: true,
          createdAt
        },
        {
          id: `rec_${Date.now()}_2`,
          week,
          title: '🍁 红叶风景',
          subtitle: '层林尽染，秋色宜人',
          theme: '风景',
          location: '山区红叶景区',
          reason: '秋季红叶满山，色彩斑斓',
          tags: ['红叶', '秋日', '风光'],
          hot: false,
          createdAt
        }
      ],
      '冬季': [
        {
          id: `rec_${Date.now()}_1`,
          week,
          title: '❄️ 雪景人像',
          subtitle: '银装素裹，冬日浪漫',
          theme: '人像',
          location: '雪场 / 雪景公园',
          reason: '冬季雪景独特，适合创作',
          tags: ['雪景', '冬日', '人像'],
          hot: true,
          createdAt
        },
        {
          id: `rec_${Date.now()}_2`,
          week,
          title: '🌃 城市夜景',
          subtitle: '华灯初上，冬日温情',
          theme: '夜景',
          location: '城市地标 / 商业区',
          reason: '冬季夜长，适合拍摄夜景',
          tags: ['夜景', '城市', '冬日'],
          hot: false,
          createdAt
        }
      ]
    };
    
    return seasonMap[season] || seasonMap['春季'];
  }

  /**
   * 模拟历史数据
   */
  getMockHistory() {
    return [
      // 本周
      ...this.getDefaultRecommendations('春季', 3, 11),
      // 上周
      {
        id: 'rec_history_1',
        week: '2026年第10周',
        title: '🏔️ 山野徒步摄影',
        subtitle: '春暖花开，山间寻景',
        theme: '风景',
        location: '岳麓山 / 大围山',
        reason: '三月山间野花盛开，适合徒步拍摄自然风光',
        tags: ['山野', '徒步', '风光'],
        hot: true,
        createdAt: '2026-03-08'
      },
      {
        id: 'rec_history_2',
        week: '2026年第10周',
        title: '🎭 街头人文',
        subtitle: '城市角落，故事无处不在',
        theme: '街拍',
        location: '太平老街 / 坡子街',
        reason: '周末人流较多，适合捕捉生动的街头瞬间',
        tags: ['街拍', '人文', '纪实'],
        hot: false,
        createdAt: '2026-03-08'
      },
      // 更早
      {
        id: 'rec_history_3',
        week: '2026年第9周',
        title: '🌅 日出云海',
        subtitle: '清晨登高，云海翻涌',
        theme: '风景',
        location: '岳麓山顶',
        reason: '春季早晚温差大，清晨易形成云海奇观',
        tags: ['日出', '云海', '风光'],
        hot: false,
        createdAt: '2026-03-01'
      }
    ];
  }
}

module.exports = RecommendationService;