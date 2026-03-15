/**
 * AI 服务配置
 */

module.exports = {
  // 默认使用的模型
  defaultProvider: process.env.AI_PROVIDER || 'qwen',
  
  // 各模型配置
  providers: {
    qwen: {
      name: '通义千问',
      enabled: !!process.env.QWEN_API_KEY,
      apiKey: process.env.QWEN_API_KEY,
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: 'qwen-max',
      timeout: 30000
    },
    deepseek: {
      name: 'DeepSeek',
      enabled: !!process.env.DEEPSEEK_API_KEY,
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      timeout: 30000
    },
    glm: {
      name: '智谱 GLM',
      enabled: !!process.env.GLM_API_KEY,
      apiKey: process.env.GLM_API_KEY,
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      model: 'glm-4',
      timeout: 30000
    }
  }
};