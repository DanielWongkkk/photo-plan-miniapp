/**
 * AI 服务 - 支持多种模型
 */

const axios = require('axios');

class AIService {
  constructor(config) {
    this.providers = config.providers || {};
    this.defaultProvider = config.defaultProvider || 'qwen';
  }

  /**
   * 生成拍照策划
   * @param {Object} input - 用户输入
   * @returns {Promise<Object>} 策划结果
   */
  async generatePlan(input) {
    const prompt = this._buildPlanPrompt(input);
    const response = await this._callAI(prompt);
    return this._parsePlanResponse(response);
  }

  /**
   * 构建 Prompt
   */
  _buildPlanPrompt(input) {
    const { theme, location, time, equipment, style, notes } = input;
    
    return `你是一位专业的摄影策划师。请根据以下信息生成一份详细的拍照策划方案。

拍摄主题：${theme}
拍摄地点：${location}
拍摄时间：${time}
设备信息：${equipment?.brand || ''} ${equipment?.model || ''} ${equipment?.lens || ''}
风格偏好：${style || '无特定偏好'}
额外备注：${notes || '无'}

请生成包含以下内容的策划方案：
1. 地点建议（最佳取景点）
2. 时间建议（光线分析）
3. 设备配置建议（推荐镜头、参数设置）
4. 拍摄清单（至少5个不同景别/角度）
5. 构图建议和技巧

请以 JSON 格式返回结果。`;
  }

  /**
   * 调用 AI API
   */
  async _callAI(prompt) {
    const provider = this.providers[this.defaultProvider];
    
    if (!provider || !provider.enabled) {
      throw new Error('AI 服务未配置');
    }

    try {
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
          timeout: provider.timeout || 30000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI API Error:', error.message);
      throw new Error('AI 服务调用失败');
    }
  }

  /**
   * 解析 AI 返回的策划结果
   */
  _parsePlanResponse(response) {
    try {
      // 尝试提取 JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { raw: response };
    } catch (error) {
      return { raw: response };
    }
  }
}

module.exports = AIService;