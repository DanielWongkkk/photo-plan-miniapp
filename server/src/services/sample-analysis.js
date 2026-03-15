/**
 * 样片分析服务
 * 使用 AI 视觉模型分析图片，提供拍摄建议
 */

const axios = require('axios');

class SampleAnalysisService {
  constructor(config) {
    this.aiConfig = config.ai || {};
  }

  /**
   * 分析样片并生成拍摄建议
   * @param {Object} sample 样片信息
   * @param {string} sample.imageUrl 图片URL
   * @param {string} sample.title 标题
   * @param {string} sample.author 作者
   * @param {string} theme 拍摄主题
   * @returns {Promise<Object>} 分析结果
   */
  async analyzeSample(sample, theme) {
    if (!sample.imageUrl) {
      return {
        ...sample,
        analysis: null,
        tip: '该笔记暂无封面图片，请点击链接查看详情'
      };
    }

    try {
      const analysis = await this.callVisionModel(sample.imageUrl, theme, sample.title);
      
      return {
        ...sample,
        analysis: {
          lightDirection: analysis.lightDirection,
          lightQuality: analysis.lightQuality,
          timeOfDay: analysis.timeOfDay,
          cameraAngle: analysis.cameraAngle,
          composition: analysis.composition,
          poseGuide: analysis.poseGuide,
          locationTips: analysis.locationTips,
          suggestedParams: analysis.suggestedParams,
          keyPoints: analysis.keyPoints,
          difficulty: analysis.difficulty
        }
      };
    } catch (error) {
      console.error('Analyze sample error:', error.message);
      return {
        ...sample,
        analysis: null,
        error: error.message
      };
    }
  }

  /**
   * 批量分析样片
   */
  async analyzeSamples(samples, theme) {
    const results = await Promise.all(
      samples.map(sample => this.analyzeSample(sample, theme))
    );
    return results;
  }

  /**
   * 调用视觉模型分析图片
   */
  async callVisionModel(imageUrl, theme, title) {
    const provider = this.aiConfig.providers?.[this.aiConfig.defaultProvider];
    
    if (!provider || !provider.enabled) {
      throw new Error('AI 服务未配置');
    }

    // 构建分析 Prompt
    const prompt = this.buildAnalysisPrompt(theme, title);

    // 根据不同模型调用不同的 API
    if (this.aiConfig.defaultProvider === 'qwen') {
      return await this.callQwenVision(provider, imageUrl, prompt);
    } else if (this.aiConfig.defaultProvider === 'glm') {
      return await this.callGLMVision(provider, imageUrl, prompt);
    } else {
      // 其他模型暂时不支持视觉，返回默认建议
      return this.getDefaultAnalysis(theme);
    }
  }

  /**
   * 调用通义千问视觉模型
   */
  async callQwenVision(provider, imageUrl, prompt) {
    try {
      const response = await axios.post(
        `${provider.baseUrl}/chat/completions`,
        {
          model: 'qwen-vl-max',  // 通义千问视觉模型
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: imageUrl } },
                { type: 'text', text: prompt }
              ]
            }
          ],
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      const content = response.data.choices[0].message.content;
      return this.parseAnalysisResponse(content);
    } catch (error) {
      console.error('Qwen Vision API error:', error.response?.data || error.message);
      // 降级到文本模型生成通用建议
      return await this.generateGenericAnalysis(provider, prompt);
    }
  }

  /**
   * 调用智谱 GLM-4V 视觉模型
   */
  async callGLMVision(provider, imageUrl, prompt) {
    try {
      const response = await axios.post(
        `${provider.baseUrl}/chat/completions`,
        {
          model: 'glm-4v',  // 智谱视觉模型
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: imageUrl } },
                { type: 'text', text: prompt }
              ]
            }
          ],
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      const content = response.data.choices[0].message.content;
      return this.parseAnalysisResponse(content);
    } catch (error) {
      console.error('GLM Vision API error:', error.response?.data || error.message);
      return this.getDefaultAnalysis('人像');
    }
  }

  /**
   * 使用文本模型生成通用拍摄建议（无视觉能力时的降级方案）
   */
  async generateGenericAnalysis(provider, prompt) {
    try {
      const response = await axios.post(
        `${provider.baseUrl}/chat/completions`,
        {
          model: provider.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const content = response.data.choices[0].message.content;
      return this.parseAnalysisResponse(content);
    } catch (error) {
      return this.getDefaultAnalysis('人像');
    }
  }

  /**
   * 构建分析 Prompt
   */
  buildAnalysisPrompt(theme, title) {
    return `你是一位专业的摄影指导老师。请分析这张${theme || '人像'}照片，并提供详细的拍摄建议。

照片标题：${title || '未知'}

请从以下几个方面进行分析，并以 JSON 格式返回：

1. **光线分析**：
   - lightDirection: 光线方向（顺光/侧光/逆光/侧逆光/顶光/底光）
   - lightQuality: 光线质感（硬光/软光/自然光/混合光）
   - timeOfDay: 拍摄时间推测（黄金时刻/蓝调时刻/正午/阴天/夜晚）

2. **机位与构图**：
   - cameraAngle: 拍摄角度（平视/仰拍/俯拍/低角度/高角度）
   - composition: 构图方式（三分法/居中/对角线/框架/引导线等）

3. ${theme === '人像' ? '**摆姿引导**：\n   - poseGuide: 模特的姿势描述和引导建议' : '**场景特点**：\n   - sceneFeatures: 场景的特点和利用方式'}

4. **拍摄建议**：
   - locationTips: 场地选择的建议（什么类型的地方适合拍这种效果）
   - suggestedParams: 建议的拍摄参数（光圈、快门、ISO 大致范围）
   - keyPoints: 拍摄要点数组（3-5个关键点）
   - difficulty: 难度等级（简单/中等/困难）

请严格按以下 JSON 格式返回，不要添加其他文字：
{
  "lightDirection": "",
  "lightQuality": "",
  "timeOfDay": "",
  "cameraAngle": "",
  "composition": "",
  ${theme === '人像' ? '"poseGuide": "",' : '"sceneFeatures": "",'}
  "locationTips": "",
  "suggestedParams": "",
  "keyPoints": [],
  "difficulty": ""
}`;
  }

  /**
   * 解析 AI 返回的分析结果
   */
  parseAnalysisResponse(content) {
    try {
      // 尝试提取 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // 如果没有 JSON，尝试解析文本
      return this.parseTextResponse(content);
    } catch (error) {
      console.error('Parse analysis error:', error);
      return this.getDefaultAnalysis('人像');
    }
  }

  /**
   * 解析文本格式的响应
   */
  parseTextResponse(text) {
    const result = {
      lightDirection: '',
      lightQuality: '',
      timeOfDay: '',
      cameraAngle: '',
      composition: '',
      poseGuide: '',
      locationTips: '',
      suggestedParams: '',
      keyPoints: [],
      difficulty: '中等'
    };

    // 简单的文本提取
    const patterns = {
      lightDirection: /光线方向[：:]\s*(.+)/,
      lightQuality: /光线质感[：:]\s*(.+)/,
      timeOfDay: /拍摄时间[：:]\s*(.+)/,
      cameraAngle: /拍摄角度[：:]\s*(.+)/,
      composition: /构图[：:]\s*(.+)/,
      poseGuide: /摆姿[：:]\s*(.+)/,
      locationTips: /场地建议[：:]\s*(.+)/,
      suggestedParams: /参数[：:]\s*(.+)/
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        result[key] = match[1].trim();
      }
    }

    return result;
  }

  /**
   * 默认分析结果（AI 不可用时）
   */
  getDefaultAnalysis(theme) {
    if (theme === '人像') {
      return {
        lightDirection: '侧光或侧逆光',
        lightQuality: '自然柔光',
        timeOfDay: '黄金时刻（日出后/日落前1小时）',
        cameraAngle: '平视或略低角度',
        composition: '三分法构图，人物放在画面三分之一处',
        poseGuide: '自然放松，身体微侧，头部略微倾斜，眼睛看向镜头或远方',
        locationTips: '选择背景简洁、光线柔和的地点，如公园、街道、咖啡馆等',
        suggestedParams: '光圈 F1.4-F2.8，快门 1/200s 以上，ISO 100-400',
        keyPoints: [
          '注意眼神光，让眼睛有神',
          '控制景深，虚化背景突出人物',
          '捕捉自然表情，避免僵硬摆拍'
        ],
        difficulty: '中等'
      };
    }
    
    return {
      lightDirection: '侧光',
      lightQuality: '自然光',
      timeOfDay: '黄金时刻',
      cameraAngle: '平视',
      composition: '三分法',
      sceneFeatures: '场景层次丰富，光线均匀',
      locationTips: '选择视野开阔、光线好的地点',
      suggestedParams: '光圈 F5.6-F11，快门根据光线调整',
      keyPoints: [
        '注意构图平衡',
        '利用前景增加层次',
        '选择合适的拍摄时间'
      ],
      difficulty: '简单'
    };
  }
}

module.exports = SampleAnalysisService;