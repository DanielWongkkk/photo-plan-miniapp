/**
 * 拍照策划生成服务
 * 核心功能：生成可落地的拍摄策划
 */

const axios = require('axios');

class PlanService {
  constructor(config) {
    this.aiConfig = config.ai || {};
    this.weatherApiKey = config.weatherApiKey;
  }

  /**
   * 生成完整的拍摄策划
   * @param {Object} input - 用户输入
   * @returns {Promise<Object>} 策划结果
   */
  async generatePlan(input) {
    const { theme, location, date, equipment, style, notes } = input;
    
    // 1. 获取天气预报（未来5天）
    const weatherData = await this.getWeatherForecast(location);
    
    // 2. 根据天气推荐最佳日期
    const recommendedDates = this.recommendDates(weatherData, theme);
    
    // 3. 获取具体取景点（AI生成）
    const shootingSpots = await this.generateShootingSpots(location, theme, equipment);
    
    // 4. 生成拍摄清单
    const shotList = await this.generateShotList(theme, location, equipment, style);
    
    // 5. 生成参数配置
    const equipmentConfig = this.generateEquipmentConfig(equipment, theme, style);
    
    // 6. 生成后期建议
    const postProcessing = await this.generatePostProcessing(style, theme);
    
    return {
      id: `plan_${Date.now()}`,
      summary: `${location}${theme}拍摄策划`,
      createdAt: new Date().toISOString(),
      input: {
        theme,
        location,
        datetime: date,
        equipmentName: equipment ? `${equipment.brand} ${equipment.model} ${equipment.lens}` : '',
        style
      },
      recommendedDates,
      timeSlots: this.getTimeSlotRecommendations(theme, weatherData[0]),
      shootingSpots,
      equipmentConfig,
      shotList,
      postProcessing,
      notices: this.generateNotices(location, theme)
    };
  }

  /**
   * 获取天气预报
   */
  async getWeatherForecast(location) {
    // 使用 Open-Meteo 免费 API（无需 API Key）
    // 先地理编码获取经纬度
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=zh`;
      const geoRes = await axios.get(geoUrl, { timeout: 5000 });
      
      if (!geoRes.data.results || geoRes.data.results.length === 0) {
        return this.getDefaultWeather();
      }
      
      const { latitude, longitude, name } = geoRes.data.results[0];
      
      // 获取天气预报
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia/Shanghai`;
      const weatherRes = await axios.get(weatherUrl, { timeout: 5000 });
      
      const daily = weatherRes.data.daily;
      const forecasts = [];
      
      for (let i = 0; i < Math.min(5, daily.time.length); i++) {
        forecasts.push({
          date: daily.time[i],
          weatherCode: daily.weathercode[i],
          weather: this.weatherCodeToString(daily.weathercode[i]),
          tempMax: daily.temperature_2m_max[i],
          tempMin: daily.temperature_2m_min[i]
        });
      }
      
      return forecasts;
    } catch (error) {
      console.error('Weather API error:', error.message);
      return this.getDefaultWeather();
    }
  }

  /**
   * 天气代码转文字
   */
  weatherCodeToString(code) {
    const weatherMap = {
      0: '☀️ 晴',
      1: '🌤️ 晴间多云',
      2: '⛅ 多云',
      3: '☁️ 阴',
      45: '🌫️ 雾',
      48: '🌫️ 冻雾',
      51: '🌦️ 小雨',
      53: '🌦️ 中雨',
      55: '🌧️ 大雨',
      61: '🌧️ 小雨',
      63: '🌧️ 中雨',
      65: '🌧️ 大雨',
      71: '🌨️ 小雪',
      73: '🌨️ 中雪',
      75: '❄️ 大雪',
      80: '🌧️ 阵雨',
      81: '🌧️ 中阵雨',
      82: '⛈️ 暴雨',
      95: '⛈️ 雷暴'
    };
    return weatherMap[code] || '🌤️ 多云';
  }

  /**
   * 默认天气数据
   */
  getDefaultWeather() {
    const today = new Date();
    const forecasts = [];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      forecasts.push({
        date: date.toISOString().split('T')[0],
        weather: '☀️ 晴',
        tempMax: 25,
        tempMin: 18
      });
    }
    return forecasts;
  }

  /**
   * 根据天气推荐日期
   */
  recommendDates(weatherData, theme) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const today = new Date();
    
    return weatherData.map((w, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // 计算拍摄适宜度评分
      let score = 5;
      let recommended = false;
      let reason = '';
      
      // 晴天高分
      if (w.weather.includes('晴')) {
        score = 9 + Math.random() * 0.5;
        recommended = true;
        reason = '晴天，光线柔和，适合拍摄';
      } else if (w.weather.includes('多云')) {
        score = 7 + Math.random() * 0.5;
        reason = '多云，光线柔和但偏平';
      } else if (w.weather.includes('雨')) {
        score = 3 + Math.random();
        reason = '有雨，不建议拍摄';
      } else {
        score = 5 + Math.random() * 2;
        reason = '天气一般，可考虑拍摄';
      }
      
      return {
        date: w.date,
        weekday: weekdays[date.getDay()],
        dateNum: date.getDate().toString(),
        weather: w.weather,
        temperature: `${Math.round(w.tempMin)}-${Math.round(w.tempMax)}°C`,
        score: Math.round(score * 10) / 10,
        recommended,
        selected: i === 0,
        reason
      };
    });
  }

  /**
   * 时间段推荐
   */
  getTimeSlotRecommendations(theme, weather) {
    const isPortrait = theme === '人像';
    
    return [
      {
        period: '07:00-09:00',
        description: isPortrait ? '晨光柔和，适合清新风格' : '晨雾缭绕，氛围感强',
        lightIcon: '🌅',
        lightCondition: '柔和晨光',
        recommended: true
      },
      {
        period: '10:00-12:00',
        description: '光线强烈，需注意阴影',
        lightIcon: '☀️',
        lightCondition: '强烈直射',
        recommended: false
      },
      {
        period: '16:00-18:00',
        description: '黄金时刻，逆光剪影最佳',
        lightIcon: '🌇',
        lightCondition: '金色暖光',
        recommended: true
      },
      {
        period: '18:00-19:30',
        description: '蓝调时刻，氛围感强',
        lightIcon: '🌆',
        lightCondition: '蓝紫色调',
        recommended: isPortrait ? false : true
      }
    ];
  }

  /**
   * 生成具体取景点（调用 AI）
   */
  async generateShootingSpots(location, theme, equipment) {
    const prompt = `你是一位专业的摄影向导。请为"${location}"推荐4-5个具体的拍摄点。

要求：
1. 每个点位必须提供具体名称和详细地址
2. 描述该位置的特点和适合的拍摄风格
3. 说明最佳拍摄时间段
4. 推荐拍摄角度和机位
5. 提供相机参数参考（光圈、快门、ISO）
${theme === '人像' ? '6. 提供摆姿引导建议（详细的动作描述）' : ''}

请以 JSON 数组格式返回，每个点位包含：
- name: 点位名称
- address: 详细地址
- latitude: 纬度（数字）
- longitude: 经度（数字）
- description: 位置描述
- bestTime: 最佳拍摄时间
- angle: 拍摄角度
- params: 参数参考
${theme === '人像' ? '- poseGuide: 摆姿引导' : ''}

只返回 JSON，不要其他文字。`;

    try {
      const aiResponse = await this.callAI(prompt);
      // 解析 AI 返回
      const spots = this.parseAIResponse(aiResponse);
      
      // 为每个点位添加样片参考信息
      return spots.map(spot => ({
        ...spot,
        samples: this.getSampleReferences(spot.name, theme)
      }));
    } catch (error) {
      console.error('Generate spots error:', error.message);
      return this.getDefaultSpots(location, theme);
    }
  }

  /**
   * 生成拍摄清单
   */
  async generateShotList(theme, location, equipment, style) {
    const prompt = `为"${location}"拍摄"${theme}"主题生成5-6张照片的拍摄清单。

要求：
1. 包含不同景别（全景、中景、特写）
2. 提供详细的构图建议
3. 提供相机参数
${theme === '人像' ? '4. 提供摆姿引导' : ''}

以 JSON 数组返回，每项包含：
- order: 序号
- name: 照片名称
- shotType: 景别
- angle: 拍摄角度
- composition: 构图建议
- params: 相机参数
${theme === '人像' ? '- poseGuide: 摆姿引导' : ''}
- tips: 拍摄提示

只返回 JSON。`;

    try {
      const response = await this.callAI(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      return this.getDefaultShotList(theme);
    }
  }

  /**
   * 获取样片参考
   */
  getSampleReferences(spotName, theme) {
    // 这里可以集成真实的图片搜索 API
    // 目前返回占位数据
    const sources = [
      { name: '小红书', icon: '📕' },
      { name: 'Instagram', icon: '📷' },
      { name: '500px', icon: '🖼️' },
      { name: '图虫', icon: '🖼️' }
    ];
    
    return sources.slice(0, 2).map(source => ({
      imageUrl: `https://placeholder.com/sample.jpg`,
      source: source.name,
      sourceIcon: source.icon,
      author: '@摄影师',
      link: '#'
    }));
  }

  /**
   * 调用 AI
   */
  async callAI(prompt) {
    const provider = this.aiConfig.providers[this.aiConfig.defaultProvider];
    
    if (!provider || !provider.enabled) {
      throw new Error('AI 服务未配置');
    }

    const response = await axios.post(
      `${provider.baseUrl}/chat/completions`,
      {
        model: provider.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4096
      },
      {
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
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
   * 生成设备参数配置
   */
  generateEquipmentConfig(equipment, theme, style) {
    const isPortrait = theme === '人像';
    
    return {
      lens: equipment?.lens || '50mm 或 85mm 定焦',
      aperture: isPortrait ? 'F1.4 - F2.8' : 'F5.6 - F11',
      shutter: '1/500s 以上',
      iso: '100-400',
      whiteBalance: style?.includes('暖') ? '5200K（偏暖）' : '自动',
      filters: '可选 CPL 减少反光',
      tips: isPortrait 
        ? '大光圈虚化背景，注意对焦在眼睛' 
        : '小光圈保证景深，注意曝光准确'
    };
  }

  /**
   * 生成后期建议
   */
  async generatePostProcessing(style, theme) {
    const styleMap = {
      '日系清新': {
        style: '日系清新',
        steps: [
          '1. 降低对比度 -10',
          '2. 高光 -20，阴影 +15',
          '3. 色温偏暖 +5，色调偏青 -3',
          '4. HSL：橙色饱和度 -5（肤色）',
          '5. 添加轻微颗粒感'
        ],
        lrPresets: 'VSCO A6 / Mastin Labs Fuji 400H',
        apps: ['Lightroom', 'VSCO', '醒图']
      },
      '复古胶片': {
        style: '复古胶片',
        steps: [
          '1. 增加对比度 +10',
          '2. 降低饱和度 -15',
          '3. 色温偏暖 +10',
          '4. 添加胶片颗粒',
          '5. 暗角效果'
        ],
        lrPresets: 'VSCO Portra 400 / Mastin Labs Portra',
        apps: ['Lightroom', 'RNI Films', ' NOMO']
      },
      '暗调': {
        style: '暗调风格',
        steps: [
          '1. 降低曝光 -0.5',
          '2. 压暗高光 -30',
          '3. 提升阴影 +10',
          '4. 曲线压暗中间调',
          '5. 局部提亮主体'
        ],
        lrPresets: '自定义暗调预设',
        apps: ['Lightroom', '泼辣修图']
      }
    };

    return styleMap[style] || styleMap['日系清新'];
  }

  /**
   * 生成注意事项
   */
  generateNotices(location, theme) {
    const notices = [
      '建议提前踩点，熟悉光线变化',
      '带足备用电池和存储卡',
      '注意保护相机，避免灰尘和湿气'
    ];

    if (location.includes('公园') || location.includes('景区')) {
      notices.push('注意景区开放时间，避免闭馆');
      notices.push('部分区域可能需要额外门票');
    }

    if (theme === '人像') {
      notices.push('与模特提前沟通，确认服装和风格');
      notices.push('准备小道具增加画面趣味性');
    }

    return notices;
  }

  /**
   * 默认取景点
   */
  getDefaultSpots(location, theme) {
    return [
      {
        name: `${location}主入口`,
        address: location,
        latitude: 28.2,
        longitude: 113.0,
        description: '开阔区域，适合全景',
        bestTime: '16:00-18:00',
        angle: '平视或低角度',
        params: 'F5.6, 1/500s, ISO 100',
        poseGuide: theme === '人像' ? '自然站立，望向远方' : null,
        samples: this.getSampleReferences(location, theme)
      }
    ];
  }

  /**
   * 默认拍摄清单
   */
  getDefaultShotList(theme) {
    const isPortrait = theme === '人像';
    
    return [
      {
        order: 1,
        name: '环境全景',
        shotType: '全景',
        angle: '平视',
        composition: '广角展现环境',
        params: 'F8, 1/250s, ISO 100',
        tips: '注意构图平衡'
      },
      {
        order: 2,
        name: '中景主体',
        shotType: '中景',
        angle: '平视',
        composition: '三分法构图',
        params: 'F4, 1/500s, ISO 100',
        poseGuide: isPortrait ? '侧身站立，自然放松' : null,
        tips: '注意背景简洁'
      },
      {
        order: 3,
        name: '特写细节',
        shotType: '特写',
        angle: '平视',
        composition: '大光圈虚化背景',
        params: 'F2.0, 1/800s, ISO 100',
        tips: '对焦准确'
      }
    ];
  }
}

module.exports = PlanService;