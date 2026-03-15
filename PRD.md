# 拍照策划小程序 - 产品需求文档 (PRD)

> 版本：V1.0  
> 日期：2026-03-15  
> 作者：王工

---

## 一、项目概述

### 1.1 背景
- 刚学摄影，发现拍照策划很重要，但懒得写
- 现有方案：手动搜索样片、记笔记，效率低
- 目标：做一个一键生成拍照策划的微信小程序

### 1.2 目标用户
- 摄影初学者
- 懒得做前期策划的摄影爱好者
- 需要快速出片的活动摄影师

### 1.3 核心价值
- **省时间**：自动生成策划，不用手动搜索整理
- **可落地**：基于用户实际设备生成，确保能拍出来
- **有参考**：AI 智能搜索真实样片，知道成片效果

### 1.4 核心设计决策
- **设备信息**：存储在用户个人资料中，一次填写多次复用
- **样片来源**：通过大模型 AI 搜索生成，非传统爬虫方案
- **AI 服务**：配置化管理，支持多模型切换（通义千问、DeepSeek、GLM 等）
- **后端部署**：自有服务器部署，便于灵活调整
- **用户体系**：微信登录，支持后续会员体系扩展
- **商业模式**：V1 免费个人使用，预留会员接口

### 1.5 技术设计原则
- **配置优先**：AI 模型、API 密钥等通过配置文件管理，方便切换
- **接口抽象**：AI 服务层统一抽象，不同模型实现同一接口
- **渐进增强**：V1 先跑通核心流程，后续逐步优化体验
- **成本可控**：支持切换低成本模型，控制 API 调用费用

---

## 二、功能需求

### 2.1 用户输入

用户需要填写/选择以下信息：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 拍摄主题 | 文本/选择 | ✅ | 如：人像、风景、街拍、美食、宠物、婚礼、毕业照 |
| 拍摄地点 | 文本 | ✅ | 如：杭州西湖、上海外滩、家里 |
| 拍摄时间 | 日期+时段 | ✅ | 日期 + 上午/下午/傍晚/夜晚 |
| 设备信息 | 选择 | ✅ | 相机型号、镜头焦段（可手动输入） |
| 风格偏好 | 选择 | ❌ | 日系、复古、胶片、清新、暗调、高对比等 |
| 额外备注 | 文本 | ❌ | 其他特殊要求 |

**设备信息**：
- 从用户个人资料中读取已保存的设备
- 支持多套设备，快速切换
- 首次使用引导用户填写设备信息

### 2.2 策划输出

生成的拍照策划包含以下内容：

#### 2.2.1 基础信息卡片
- 拍摄主题
- 地点建议（最佳取景点）
- 时间建议（光线分析）
- 天气影响提示（调用天气API）

#### 2.2.2 设备配置建议
- 推荐镜头搭配
- 推荐参数设置（光圈、快门、ISO范围）
- 滤镜/配件建议（如需要）

#### 2.2.3 拍摄清单（Shot List）
| 序号 | 景别/角度 | 构图建议 | 参考样片 |
|------|-----------|----------|----------|
| 1 | 全景 | 利用前景框架 | [样片缩略图] |
| 2 | 中景 | 三分法构图 | [样片缩略图] |
| 3 | 特写 | 大光圈虚化 | [样片缩略图] |
| ... | ... | ... | ... |

#### 2.2.4 样片参考（AI 搜索生成）
- **核心方案**：通过大模型 AI 搜索并生成样片参考
- AI 根据用户输入（主题+地点+设备+风格）智能搜索：
  - 小红书样片
  - Instagram 作品
  - 500px / 图虫 / Pinterest
  - 摄影教程截图
- AI 输出：
  - 样片图片链接
  - 拍摄参数分析（从样片反推）
  - 构图/光线技巧说明
- 每个样片显示：
  - 缩略图
  - 来源链接
  - 标签（如"逆光"、"黄金时刻"等）
  - 参数参考（AI 分析得出）

> 注：V1 阶段 AI 可能返回的是搜索到的真实样片链接；后续可考虑接入 AI 绘图生成参考图

#### 2.2.5 技术参数参考
- 类似场景的曝光参数参考
- 白平衡建议
- 后期调色方向（可选）

### 2.3 用户体系

#### 2.3.1 微信登录
- 首次打开小程序，引导微信授权登录
- 获取用户基本信息（头像、昵称）
- 登录状态持久化

#### 2.3.2 个人资料
用户个人资料包含：

| 字段 | 类型 | 说明 |
|------|------|------|
| 昵称 | 文本 | 微信昵称 |
| 头像 | 图片 | 微信头像 |
| 设备库 | 列表 | 多套设备组合 |
| 默认设备 | ID | 常用设备 ID |
| 风格偏好 | 列表 | 默认风格标签 |
| 所在城市 | 文本 | 默认拍摄城市 |

#### 2.3.3 设备管理（个人资料模块）
- 添加设备：相机品牌/型号 + 镜头信息
- 编辑/删除设备
- 设置默认设备
- 支持多套设备切换（如：索尼主设备、富士备机）

#### 2.3.4 会员体系（预留）
V1 暂不实现，但预留接口：

| 会员等级 | 功能权益 |
|----------|----------|
| 免费用户 | 每日 3 次策划生成 |
| VIP 会员 | 无限次生成 + 高级样片源 + 导出 PDF |

### 2.4 AI 每周推荐（v0.3.0 新增）

#### 2.4.1 功能概述
用户有时不知道想拍什么，AI 每周推荐帮助用户发现拍摄灵感。

#### 2.4.2 推荐逻辑
- **季节驱动**：根据当前季节推荐主题（春季樱花、夏季向日葵、秋季银杏、冬季雪景）
- **节日热点**：结合临近节日（情人节、毕业季等）
- **花期监控**：关注当前花期信息
- **热度参考**：参考小红书等平台热门拍摄主题

#### 2.4.3 展示形式
| 位置 | 形式 |
|------|------|
| 首页 | 轮播卡片，展示本周 4-5 个推荐 |
| 推荐历史页 | 按周分组，查看历史推荐存档 |

#### 2.4.4 推荐卡片内容
| 字段 | 说明 |
|------|------|
| 标题 | 带 Emoji 的主题标题 |
| 副标题 | 简短描述（10字内） |
| 主题类型 | 人像/风景/街拍等 |
| 推荐地点 | 1-2 个具体地点 |
| 推荐理由 | 为什么推荐 |
| 标签 | 3 个关键词 |
| 热门标识 | 是否当周热门 |

#### 2.4.5 交互设计
- **点击卡片**：自动填充表单（主题+地点）
- **查看更多**：跳转推荐历史页
- **自动刷新**：每周自动生成新推荐
- **本地缓存**：24 小时内使用缓存

### 2.5 历史记录

- 保存生成的策划记录
- 支持查看、编辑、删除
- 支持分享给好友

### 2.6 其他设置

- 默认城市设置
- 通知设置（可选）

---

## 三、技术方案

### 3.1 前端架构

```
微信小程序
├── pages/
│   ├── index/          # 首页 - 输入表单
│   ├── result/         # 策划结果页
│   ├── history/        # 历史记录
│   ├── profile/        # 个人中心（含设备管理）
│   └── login/          # 登录页
├── components/
│   ├── equipment-picker/   # 设备选择器
│   ├── theme-selector/     # 主题选择
│   ├── shot-card/          # 拍摄卡片组件
│   └── sample-gallery/     # 样片画廊
└── utils/
    ├── api.js           # 接口封装
    ├── auth.js          # 微信登录逻辑
    └── storage.js       # 本地存储
```

### 3.2 后端架构（独立服务器部署）

```
后端服务（独立服务器）
├── src/
│   ├── api/                    # API 路由层
│   │   ├── routes/
│   │   │   ├── auth.js         # 认证相关
│   │   │   ├── plan.js         # 策划相关
│   │   │   ├── user.js         # 用户相关
│   │   │   └── admin.js        # 管理接口（配置管理）
│   │   └── middleware/
│   │       ├── auth.js         # JWT 验证
│   │       └── errorHandler.js # 错误处理
│   │
│   ├── services/               # 业务服务层
│   │   ├── ai/                 # AI 服务（核心）
│   │   │   ├── index.js        # AI 服务入口
│   │   │   ├── provider.js     # Provider 抽象基类
│   │   │   ├── providers/
│   │   │   │   ├── qwen.js     # 通义千问
│   │   │   │   ├── deepseek.js # DeepSeek
│   │   │   │   ├── glm.js      # 智谱 GLM
│   │   │   │   ├── openai.js   # OpenAI
│   │   │   │   └── claude.js   # Claude（可选）
│   │   │   └── prompts/
│   │   │       ├── plan.js     # 策划生成 Prompt
│   │   │       └── sample.js   # 样片搜索 Prompt
│   │   │
│   │   ├── auth.js             # 认证服务
│   │   ├── plan.js             # 策划服务
│   │   ├── user.js             # 用户服务
│   │   └── weather.js          # 天气服务
│   │
│   ├── models/                 # 数据模型
│   │   ├── User.js
│   │   ├── Plan.js
│   │   └── Config.js           # 系统配置
│   │
│   ├── config/                 # 配置文件
│   │   ├── index.js            # 配置入口
│   │   ├── ai.js               # AI 模型配置
│   │   └── constants.js        # 常量定义
│   │
│   └── utils/                  # 工具函数
│       ├── logger.js           # 日志
│       └── cache.js            # 缓存
│
├── .env                        # 环境变量（不提交）
├── .env.example                # 环境变量示例
└── ecosystem.config.js         # PM2 配置
```

### 3.3 AI 服务配置化设计（重点）

#### 3.3.1 设计理念
- **统一接口**：所有 AI 模型实现同一接口，业务层无感知
- **配置驱动**：通过配置文件切换模型，无需改代码
- **故障转移**：主模型不可用时自动切换备用模型
- **成本优化**：不同场景可配置不同模型（简单任务用便宜模型）

#### 3.3.2 配置文件设计

**config/ai.js**
```javascript
module.exports = {
  // 默认使用的模型
  defaultProvider: 'qwen',
  
  // 各模型配置
  providers: {
    qwen: {
      name: '通义千问',
      enabled: true,
      apiKey: process.env.QWEN_API_KEY,
      baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
      model: 'qwen-max',  // 或 qwen-plus, qwen-turbo
      models: {
        plan: 'qwen-max',      // 策划生成用高端模型
        sample: 'qwen-plus',   // 样片搜索用中端模型
      },
      timeout: 30000,
      maxRetries: 3,
    },
    deepseek: {
      name: 'DeepSeek',
      enabled: true,
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      timeout: 30000,
      maxRetries: 3,
    },
    glm: {
      name: '智谱 GLM',
      enabled: true,
      apiKey: process.env.GLM_API_KEY,
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      model: 'glm-4',
      timeout: 30000,
      maxRetries: 3,
    },
    openai: {
      name: 'OpenAI',
      enabled: false,  // 国内需代理，默认禁用
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4-turbo',
      proxy: process.env.HTTP_PROXY,  // 可选代理
      timeout: 60000,
      maxRetries: 3,
    },
  },
  
  // 故障转移策略
  fallback: {
    enabled: true,
    order: ['qwen', 'deepseek', 'glm'],  // 降级顺序
  },
  
  // 场景-模型映射（可动态调整）
  sceneMapping: {
    plan: 'qwen',      // 策划生成
    sample: 'deepseek', // 样片搜索
    chat: 'glm',       // 对话交互
  },
}
```

**.env.example**
```env
# 服务端口
PORT=3000

# 数据库
MONGODB_URI=mongodb://localhost:27017/photo-plan

# 微信小程序
WX_APPID=your_appid
WX_SECRET=your_secret

# AI 模型 API Keys
QWEN_API_KEY=sk-xxx
DEEPSEEK_API_KEY=sk-xxx
GLM_API_KEY=xxx.xxx

# OpenAI（可选）
OPENAI_API_KEY=sk-xxx
HTTP_PROXY=http://127.0.0.1:7890

# JWT 密钥
JWT_SECRET=your_jwt_secret

# 天气 API
WEATHER_API_KEY=xxx
```

#### 3.3.3 Provider 抽象接口

**services/ai/provider.js**
```javascript
/**
 * AI Provider 基类
 * 所有模型需实现此接口
 */
class AIProvider {
  constructor(config) {
    this.config = config;
  }

  /**
   * 生成拍照策划
   * @param {Object} input - 用户输入
   * @returns {Promise<Object>} 策划结果
   */
  async generatePlan(input) {
    throw new Error('Method not implemented');
  }

  /**
   * 搜索样片
   * @param {Object} params - 搜索参数
   * @returns {Promise<Array>} 样片列表
   */
  async searchSamples(params) {
    throw new Error('Method not implemented');
  }

  /**
   * 通用对话（可选）
   * @param {string} prompt - 提示词
   * @returns {Promise<string>} 响应
   */
  async chat(prompt) {
    throw new Error('Method not implemented');
  }

  /**
   * 健康检查
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    throw new Error('Method not implemented');
  }
}

module.exports = AIProvider;
```

#### 3.3.4 具体实现示例（通义千问）

**services/ai/providers/qwen.js**
```javascript
const AIProvider = require('../provider');

class QwenProvider extends AIProvider {
  async generatePlan(input) {
    const prompt = this._buildPlanPrompt(input);
    
    const response = await fetch(`${this.config.baseUrl}/services/aigc/text-generation/generation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.models.plan,
        input: { prompt },
        parameters: {
          max_tokens: 4000,
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();
    return this._parsePlanResult(data);
  }

  _buildPlanPrompt(input) {
    return `你是一个专业摄影策划师。请根据以下信息生成详细的拍照策划：

【拍摄主题】${input.theme}
【拍摄地点】${input.location}
【拍摄时间】${input.datetime} (${input.timeSlot})
【摄影设备】${input.equipmentName}
【风格偏好】${input.styles?.join('、') || '不限'}
【额外要求】${input.notes || '无'}

请输出 JSON 格式的策划方案，包含：
1. summary: 策划标题
2. bestSpots: 推荐取景点数组
3. lightAnalysis: 光线分析
4. shotList: 拍摄清单（包含景别、构图、参数建议）
5. samples: 样片参考（搜索真实样片并返回链接）

注意：样片需要是真实存在的网络图片链接，优先从小红书、Instagram、500px 等平台搜索。`;
  }

  _parsePlanResult(data) {
    // 解析 AI 返回结果，转换为标准格式
    try {
      const content = data.output?.text || data.output?.choices?.[0]?.message?.content;
      return JSON.parse(content);
    } catch (e) {
      // 解析失败处理
      throw new Error('AI 返回格式错误');
    }
  }
}

module.exports = QwenProvider;
```

#### 3.3.5 AI 服务入口

**services/ai/index.js**
```javascript
const config = require('../../config/ai');
const QwenProvider = require('./providers/qwen');
const DeepSeekProvider = require('./providers/deepseek');
const GLMProvider = require('./providers/glm');

class AIService {
  constructor() {
    this.providers = {};
    this._initProviders();
  }

  _initProviders() {
    // 初始化所有启用的 Provider
    for (const [key, providerConfig] of Object.entries(config.providers)) {
      if (!providerConfig.enabled) continue;
      
      switch (key) {
        case 'qwen':
          this.providers[key] = new QwenProvider(providerConfig);
          break;
        case 'deepseek':
          this.providers[key] = new DeepSeekProvider(providerConfig);
          break;
        case 'glm':
          this.providers[key] = new GLMProvider(providerConfig);
          break;
      }
    }
  }

  /**
   * 获取 Provider
   * @param {string} scene - 场景（plan/sample/chat）
   * @returns {AIProvider}
   */
  getProvider(scene = 'plan') {
    // 根据场景获取配置的模型
    const providerKey = config.sceneMapping[scene] || config.defaultProvider;
    
    if (this.providers[providerKey]) {
      return this.providers[providerKey];
    }
    
    // 故障转移
    if (config.fallback.enabled) {
      for (const fallbackKey of config.fallback.order) {
        if (this.providers[fallbackKey]) {
          return this.providers[fallbackKey];
        }
      }
    }
    
    throw new Error('No available AI provider');
  }

  /**
   * 生成策划（带故障转移）
   */
  async generatePlan(input) {
    const provider = this.getProvider('plan');
    try {
      return await provider.generatePlan(input);
    } catch (error) {
      // 自动故障转移
      if (config.fallback.enabled) {
        for (const fallbackKey of config.fallback.order) {
          if (this.providers[fallbackKey] && this.providers[fallbackKey] !== provider) {
            try {
              return await this.providers[fallbackKey].generatePlan(input);
            } catch (e) {
              continue;
            }
          }
        }
      }
      throw error;
    }
  }

  /**
   * 动态切换模型（管理接口调用）
   */
  setDefaultProvider(providerKey) {
    if (!this.providers[providerKey]) {
      throw new Error(`Provider ${providerKey} not found or disabled`);
    }
    config.defaultProvider = providerKey;
  }
}

module.exports = new AIService();
```

#### 3.3.6 管理接口（动态调整配置）

```
POST /api/admin/ai/config
{
  "defaultProvider": "deepseek",
  "sceneMapping": {
    "plan": "qwen",
    "sample": "deepseek"
  }
}

GET /api/admin/ai/status
{
  "currentProvider": "qwen",
  "providers": [
    { "name": "qwen", "enabled": true, "healthy": true },
    { "name": "deepseek", "enabled": true, "healthy": true },
    { "name": "glm", "enabled": true, "healthy": false }
  ]
}
```

### 3.4 核心技术选型

| 模块 | 技术选型 | 说明 |
|------|----------|------|
| 小程序框架 | **Taro 3** | 支持跨平台，React 语法 |
| 前端语言 | **TypeScript** | 类型安全，开发体验好 |
| 后端框架 | **Koa 2** / Express | Koa 更现代，中间件优雅 |
| 后端语言 | **TypeScript** | 前后端统一技术栈 |
| 数据库 | **MongoDB** | 灵活存储非结构化数据 |
| 缓存 | **Redis**（可选） | 缓存热门策划，提升响应 |
| 进程管理 | **PM2** | 生产环境进程守护 |
| 反向代理 | **Nginx** | HTTPS、负载均衡 |
| AI 服务 | 通义千问 / DeepSeek / GLM | 可配置切换 |
| 微信登录 | 微信开放平台 API | wx.login + 用户信息授权 |
| 天气 API | 和风天气 / OpenWeather | 免费额度够用 |

### 3.5 服务器部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                         Nginx (443)                         │
│                    HTTPS + 反向代理                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Node.js (PM2)                          │
│                    API 服务 :3000                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Auth Service│  │ Plan Service│  │ AI Service  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ MongoDB  │    │  Redis   │    │  OSS     │
        │  数据库   │    │  缓存    │    │ 文件存储  │
        └──────────┘    └──────────┘    └──────────┘
```

**部署要求**：
- 服务器：2核4G 起步（阿里云/腾讯云）
- 系统：Ubuntu 22.04 / CentOS 8
- Node.js：v18 LTS 或更高
- MongoDB：5.0+
- 域名：需备案（微信小程序要求 HTTPS）

### 3.6 微信登录流程

```
[小程序启动] → [检查登录态] 
                   ↓
            [已登录] → [进入首页]
                   ↓
            [未登录] → [显示登录页]
                   ↓
            [wx.login] → [获取 code]
                   ↓
            [后端换取 openid] → [获取用户信息]
                   ↓
            [创建/更新用户] → [进入首页]
```

**关键点**：
- 使用 `wx.login()` 获取 code
- 后端调用微信 API 换取 openid/session_key
- 用户信息授权使用新的隐私协议（头像昵称填写能力）
- Token 存储在本地，定期刷新

---

## 四、API 接口设计

### 4.1 接口规范

**基础信息**：
- Base URL: `https://api.example.com/api`
- 数据格式: JSON
- 认证方式: Bearer Token (JWT)
- 编码: UTF-8

**通用响应格式**：
```json
{
  "code": 0,          // 0 成功，非 0 失败
  "message": "success",
  "data": { ... }
}
```

**错误码定义**：
| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 未授权 |
| 1003 | Token 过期 |
| 2001 | 用户不存在 |
| 2002 | 设备不存在 |
| 3001 | AI 服务异常 |
| 3002 | 策划生成失败 |
| 5000 | 服务器内部错误 |

### 4.2 认证接口

#### 4.2.1 微信登录
```
POST /auth/wechat-login

Request:
{
  "code": "wx_login_code",     // wx.login 返回的 code
  "nickname": "王工",          // 用户昵称（可选）
  "avatar": "https://..."      // 用户头像 URL（可选）
}

Response:
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "expiresIn": 7200,
    "user": {
      "id": "user_xxx",
      "nickname": "王工",
      "avatar": "https://...",
      "isNewUser": true
    }
  }
}
```

#### 4.2.2 刷新 Token
```
POST /auth/refresh-token

Headers:
Authorization: Bearer <token>

Response:
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "expiresIn": 7200
  }
}
```

#### 4.2.3 获取用户信息
```
GET /auth/me

Headers:
Authorization: Bearer <token>

Response:
{
  "code": 0,
  "data": {
    "id": "user_xxx",
    "nickname": "王工",
    "avatar": "https://...",
    "city": "杭州",
    "equipments": [...],
    "stylePreferences": ["日系", "清新"],
    "memberType": "free",
    "createdAt": "2026-03-15T00:00:00Z"
  }
}
```

### 4.3 用户接口

#### 4.3.1 更新用户信息
```
PUT /user/profile

Request:
{
  "nickname": "王工",
  "city": "杭州",
  "stylePreferences": ["日系", "清新"]
}

Response:
{
  "code": 0,
  "message": "更新成功"
}
```

#### 4.3.2 添加设备
```
POST /user/equipment

Request:
{
  "name": "索尼 A7M4 + 35mm F1.4",
  "camera": {
    "brand": "Sony",
    "model": "A7M4",
    "type": "full_frame"
  },
  "lens": {
    "brand": "Sony",
    "model": "35mm F1.4 GM",
    "focalLength": 35,
    "maxAperture": 1.4
  }
}

Response:
{
  "code": 0,
  "data": {
    "id": "eq_xxx",
    "name": "索尼 A7M4 + 35mm F1.4",
    ...
  }
}
```

#### 4.3.3 更新设备
```
PUT /user/equipment/:id

Request:
{
  "name": "索尼 A7M4 + 85mm F1.4",
  "lens": {
    "brand": "Sony",
    "model": "85mm F1.4 GM",
    "focalLength": 85,
    "maxAperture": 1.4
  }
}
```

#### 4.3.4 删除设备
```
DELETE /user/equipment/:id
```

#### 4.3.5 设置默认设备
```
PUT /user/equipment/:id/default
```

### 4.4 策划接口

#### 4.4.1 生成策划（核心接口）
```
POST /plan/generate

Request:
{
  "theme": "人像",
  "location": "杭州西湖",
  "datetime": "2026-03-20T16:00:00Z",
  "timeSlot": "afternoon",        // morning/afternoon/evening/night
  "equipmentId": "eq_xxx",
  "styles": ["日系", "清新"],
  "notes": "女朋友生日，要浪漫一点"
}

Response:
{
  "code": 0,
  "data": {
    "id": "plan_xxx",
    "summary": "杭州西湖人像拍摄策划",
    "weather": {
      "condition": "晴",
      "temperature": 22,
      "suggestion": "光线柔和，适合逆光拍摄"
    },
    "bestSpots": [
      {
        "name": "断桥残雪",
        "description": "经典取景点，适合全景和中景",
        "bestTime": "下午 4-6 点"
      },
      {
        "name": "苏堤春晓",
        "description": "柳树倒影，适合侧逆光人像",
        "bestTime": "傍晚 5-7 点"
      }
    ],
    "equipmentConfig": {
      "lens": "35mm F1.4",
      "aperture": "F1.4 - F2.8",
      "shutter": "1/500s 以上",
      "iso": "100-400",
      "filters": "可选 CPL 滤镜增强天空"
    },
    "shotList": [
      {
        "order": 1,
        "name": "断桥全景人像",
        "shotType": "全景",
        "composition": "以断桥和西湖为背景，人物居中偏右",
        "angle": "平视或略低角度",
        "params": "F2.8, 1/500s, ISO 100",
        "tips": "利用桥洞形成自然框架",
        "sampleUrl": "https://..."
      },
      {
        "order": 2,
        "name": "柳树下侧逆光",
        "shotType": "中景",
        "composition": "三分法，人物在右侧三分之一处",
        "angle": "侧逆光角度",
        "params": "F1.8, 1/640s, ISO 100",
        "tips": "阳光透过柳叶形成光斑效果",
        "sampleUrl": "https://..."
      }
    ],
    "samples": [
      {
        "imageUrl": "https://...",
        "source": "xiaohongshu",
        "sourceUrl": "https://...",
        "tags": ["西湖", "人像", "日系"],
        "params": "F2.0, 1/500s"
      }
    ],
    "postProcessing": {
      "style": "日系清新",
      "suggestion": "低对比度，略带青色调，肤色偏暖"
    },
    "createdAt": "2026-03-15T00:00:00Z"
  }
}
```

#### 4.4.2 获取策划详情
```
GET /plan/:id
```

#### 4.4.3 获取历史策划列表
```
GET /plan/history?page=1&pageSize=10

Response:
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "plan_xxx",
        "theme": "人像",
        "location": "杭州西湖",
        "createdAt": "2026-03-15T00:00:00Z",
        "thumbnail": "https://..."
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 10
  }
}
```

#### 4.4.4 删除策划
```
DELETE /plan/:id
```

### 4.5 管理接口（Admin）

#### 4.5.1 获取 AI 配置状态
```
GET /admin/ai/status

Response:
{
  "code": 0,
  "data": {
    "defaultProvider": "qwen",
    "providers": [
      {
        "key": "qwen",
        "name": "通义千问",
        "enabled": true,
        "healthy": true,
        "model": "qwen-max"
      },
      {
        "key": "deepseek",
        "name": "DeepSeek",
        "enabled": true,
        "healthy": true,
        "model": "deepseek-chat"
      },
      {
        "key": "glm",
        "name": "智谱 GLM",
        "enabled": true,
        "healthy": false,
        "model": "glm-4"
      }
    ],
    "sceneMapping": {
      "plan": "qwen",
      "sample": "deepseek"
    }
  }
}
```

#### 4.5.2 更新 AI 配置
```
PUT /admin/ai/config

Request:
{
  "defaultProvider": "deepseek",
  "sceneMapping": {
    "plan": "qwen",
    "sample": "glm"
  }
}
```

#### 4.5.3 切换模型可用状态
```
PUT /admin/ai/provider/:key

Request:
{
  "enabled": false
}
```

---

## 五、数据结构设计

### 5.1 用户信息 (User)

```json
{
  "_id": "user_xxx",
  "openid": "wx_openid_xxx",
  "unionId": "wx_unionid_xxx",     // 可选，多应用打通
  "nickname": "王工",
  "avatar": "https://...",
  "city": "杭州",
  "equipments": [
    {
      "id": "eq_001",
      "name": "索尼 A7M4 + 35mm F1.4",
      "camera": {
        "brand": "Sony",
        "model": "A7M4",
        "type": "full_frame"       // full_frame / apsc / m43
      },
      "lens": {
        "brand": "Sony",
        "model": "35mm F1.4 GM",
        "focalLength": 35,
        "maxAperture": 1.4
      },
      "isDefault": true,
      "createdAt": "2026-03-15T00:00:00Z"
    }
  ],
  "stylePreferences": ["日系", "清新"],
  "memberType": "free",            // free / vip
  "memberExpiredAt": null,
  "usageCount": 0,                 // 今日使用次数
  "usageDate": "2026-03-15",       // 使用日期（重置用）
  "createdAt": "2026-03-15T00:00:00Z",
  "lastLoginAt": "2026-03-15T00:00:00Z"
}
```

**索引设计**：
- `openid`: 唯一索引
- `unionId`: 唯一索引（可选）

### 5.2 拍照策划 (Plan)

```json
{
  "_id": "plan_xxx",
  "userId": "user_xxx",
  "input": {
    "theme": "人像",
    "location": "杭州西湖",
    "datetime": "2026-03-20T16:00:00Z",
    "timeSlot": "afternoon",
    "equipmentId": "eq_001",
    "styles": ["日系", "清新"],
    "notes": "女朋友生日，要浪漫一点"
  },
  "output": {
    "summary": "杭州西湖人像拍摄策划",
    "weather": {
      "condition": "晴",
      "temperature": 22,
      "suggestion": "光线柔和，适合逆光拍摄"
    },
    "bestSpots": [
      {
        "name": "断桥残雪",
        "description": "经典取景点",
        "bestTime": "下午 4-6 点"
      }
    ],
    "equipmentConfig": {
      "lens": "35mm F1.4",
      "aperture": "F1.4 - F2.8",
      "shutter": "1/500s 以上",
      "iso": "100-400",
      "filters": "可选 CPL 滤镜"
    },
    "shotList": [
      {
        "order": 1,
        "name": "断桥全景人像",
        "shotType": "全景",
        "composition": "以断桥和西湖为背景",
        "angle": "平视",
        "params": "F2.8, 1/500s, ISO 100",
        "tips": "利用桥洞形成框架",
        "sampleUrl": "https://..."
      }
    ],
    "samples": [
      {
        "imageUrl": "https://...",
        "source": "xiaohongshu",
        "sourceUrl": "https://...",
        "tags": ["西湖", "人像"],
        "params": "F2.0, 1/500s"
      }
    ],
    "postProcessing": {
      "style": "日系清新",
      "suggestion": "低对比度，青色调"
    }
  },
  "aiProvider": "qwen",            // 使用的 AI 模型
  "generateTime": 3500,            // 生成耗时(ms)
  "createdAt": "2026-03-15T00:00:00Z"
}
```

**索引设计**：
- `userId`: 普通索引
- `createdAt`: 普通索引（用于排序）
- `{ userId: 1, createdAt: -1 }`: 复合索引

### 5.3 系统配置 (Config)

```json
{
  "_id": "config_ai",
  "type": "ai",
  "defaultProvider": "qwen",
  "providers": {
    "qwen": {
      "enabled": true,
      "model": "qwen-max"
    },
    "deepseek": {
      "enabled": true,
      "model": "deepseek-chat"
    },
    "glm": {
      "enabled": true,
      "model": "glm-4"
    }
  },
  "sceneMapping": {
    "plan": "qwen",
    "sample": "deepseek"
  },
  "updatedAt": "2026-03-15T00:00:00Z"
}
```

### 5.4 操作日志 (Log) - 可选

```json
{
  "_id": "log_xxx",
  "type": "plan_generate",
  "userId": "user_xxx",
  "data": {
    "provider": "qwen",
    "input": { ... },
    "success": true,
    "generateTime": 3500
  },
  "createdAt": "2026-03-15T00:00:00Z"
}
```

---

## 六、页面流程设计

### 6.1 主流程

```
[首页输入] → [设备选择] → [主题选择] → [地点时间] → [生成策划]
                                                      ↓
[加载动画] ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
    ↓
[策划结果页]
├── 基础信息卡片
├── 设备配置建议
├── 拍摄清单（可展开）
├── 样片画廊（可点击放大）
└── 操作按钮：分享 / 保存 / 重新生成
```

### 6.2 页面线框图

#### 首页（输入页）
```
┌─────────────────────────────────┐
│  📷 拍照策划                    │
├─────────────────────────────────┤
│                                 │
│  拍摄主题                       │
│  ┌───────────────────────────┐ │
│  │ 人像  风景  街拍  美食 ... │ │
│  └───────────────────────────┘ │
│                                 │
│  拍摄地点                       │
│  ┌───────────────────────────┐ │
│  │ 杭州西湖            📍    │ │
│  └───────────────────────────┘ │
│                                 │
│  拍摄时间                       │
│  ┌──────────┐ ┌──────────────┐ │
│  │ 3月20日  │ │ 下午 ☀️      │ │
│  └──────────┘ └──────────────┘ │
│                                 │
│  我的设备                       │
│  ┌───────────────────────────┐ │
│  │ 索尼 A7M4 + 35mm F1.4  ▼ │ │
│  └───────────────────────────┘ │
│                                 │
│  风格偏好（可选）               │
│  ○ 日系  ○ 复古  ○ 胶片 ...   │
│                                 │
│  ┌───────────────────────────┐ │
│  │      ✨ 生成策划          │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

#### 策划结果页
```
┌─────────────────────────────────┐
│  ← 拍照策划        分享 ⋮      │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │ 📍 杭州西湖人像拍摄        ││
│  │ 🕐 下午 16:00-18:00        ││
│  │ 🌤️ 晴天，光线柔和          ││
│  └─────────────────────────────┘│
│                                 │
│  📸 推荐设备配置                │
│  ┌─────────────────────────────┐│
│  │ 镜头：35mm F1.4            ││
│  │ 光圈：F1.4 - F2.8          ││
│  │ 快门：1/500s 以上          ││
│  │ ISO：100-400               ││
│  └─────────────────────────────┘│
│                                 │
│  📝 拍摄清单                    │
│  ┌─────────────────────────────┐│
│  │ 1. 全景 · 断桥人像         ││
│  │    [样片缩略图]             ││
│  ├─────────────────────────────┤│
│  │ 2. 中景 · 苏堤漫步         ││
│  │    [样片缩略图]             ││
│  ├─────────────────────────────┤│
│  │ 3. 特写 · 逆光侧脸         ││
│  │    [样片缩略图]             ││
│  └─────────────────────────────┘│
│                                 │
│  🖼️ 更多样片参考                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │    │ │    │ │    │ │    │  │
│  └────┘ └────┘ └────┘ └────┘  │
│                                 │
│  ┌───────────────────────────┐ │
│  │     🔄 重新生成           │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

---

## 七、页面详细设计

### 7.1 登录页

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│         📷 拍照策划             │
│                                 │
│    一键生成专业拍照策划         │
│                                 │
│                                 │
│  ┌───────────────────────────┐ │
│  │                           │ │
│  │   🔘 微信一键登录          │ │
│  │                           │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │                           │ │
│  │   点击头像获取微信头像     │ │
│  │   [输入昵称...]           │ │
│  │                           │ │
│  └───────────────────────────┘ │
│                                 │
│      登录即表示同意用户协议     │
│                                 │
└─────────────────────────────────┘
```

**交互流程**：
1. 用户点击"微信一键登录"
2. 调用 `wx.login` 获取 code
3. 弹出头像昵称填写框（微信新规要求）
4. 用户选择头像、填写昵称
5. 提交后端，完成登录

### 7.2 首页（输入页）

```
┌─────────────────────────────────┐
│  📷 拍照策划           👤 历史 │
├─────────────────────────────────┤
│                                 │
│  拍摄主题 *                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │人像│ │风景│ │街拍│ │美食│  │
│  └────┘ └────┘ └────┘ └────┘  │
│  ┌────┐ ┌────┐ ┌────┐         │
│  │宠物│ │婚礼│ │毕业│ │...  │  │
│  └────┘ └────┘ └────┘         │
│                                 │
│  拍摄地点 *                     │
│  ┌───────────────────────────┐ │
│  │ 📍 杭州西湖           [×] │ │
│  └───────────────────────────┘ │
│  最近：上海外滩、北京故宫      │
│                                 │
│  拍摄时间 *                     │
│  ┌──────────────┐ ┌──────────┐│
│  │ 📅 2026-03-20│ │ 🕐 下午  ││
│  └──────────────┘ └──────────┘│
│                                 │
│  我的设备 *                     │
│  ┌───────────────────────────┐ │
│  │ 📷 索尼 A7M4 + 35mm   ▼  │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ + 添加新设备              │ │
│  └───────────────────────────┘ │
│                                 │
│  风格偏好（可选）               │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │日系│ │复古│ │胶片│ │清新│  │
│  └────┘ └────┘ └────┘ └────┘  │
│                                 │
│  额外要求（可选）               │
│  ┌───────────────────────────┐ │
│  │ 女朋友生日，要浪漫一点... │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │      ✨ 生成策划          │ │
│  └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### 7.3 加载页

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│            ✨                   │
│                                 │
│       正在生成策划...           │
│                                 │
│   ████████████░░░░░░░░  60%     │
│                                 │
│    • 分析拍摄场景               │
│    • 匹配最佳设备参数           │
│    ✓ 搜索相关样片               │
│                                 │
│                                 │
│                                 │
└─────────────────────────────────┘
```

**加载动画说明**：
- 显示进度条和百分比
- 逐条显示正在执行的步骤
- 预计等待时间提示

### 7.4 策划结果页

```
┌─────────────────────────────────┐
│  ← 返回      拍照策划    ⋮ 更多 │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │ 📍 杭州西湖 · 人像拍摄     ││
│  │ ────────────────────────── ││
│  │ 📅 2026-03-20 周六         ││
│  │ 🕐 下午 16:00-18:00        ││
│  │ 🌤️ 晴 22°C 光线柔和        ││
│  │ 📷 索尼 A7M4 + 35mm F1.4   ││
│  └─────────────────────────────┘│
│                                 │
│  📸 推荐参数配置                │
│  ┌─────────────────────────────┐│
│  │ 光圈    │ F1.4 - F2.8      ││
│  │ 快门    │ 1/500s 以上       ││
│  │ ISO     │ 100 - 400         ││
│  │ 白平衡  │ 日光 / 5200K      ││
│  │ 滤镜    │ 可选 CPL 增强     ││
│  └─────────────────────────────┘│
│                                 │
│  📍 推荐取景点                  │
│  ┌─────────────────────────────┐│
│  │ 1. 断桥残雪                 ││
│  │    经典取景点，适合全景     ││
│  │    最佳时间：下午 4-6 点    ││
│  ├─────────────────────────────┤│
│  │ 2. 苏堤春晓                 ││
│  │    柳树倒影，侧逆光人像     ││
│  │    最佳时间：傍晚 5-7 点    ││
│  └─────────────────────────────┘│
│                                 │
│  📝 拍摄清单 (共 5 张)          │
│  ┌─────────────────────────────┐│
│  │ 1. 断桥全景人像      [展开]││
│  │    [样片缩略图]             ││
│  ├─────────────────────────────┤│
│  │ 2. 柳树下侧逆光      [展开]││
│  │    [样片缩略图]             ││
│  ├─────────────────────────────┤│
│  │ 3. 湖边特写          [展开]││
│  │    [样片缩略图]             ││
│  └─────────────────────────────┘│
│                                 │
│  🖼️ 样片参考                    │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │    │ │    │ │    │ │    │  │
│  │ 1  │ │ 2  │ │ 3  │ │ 4  │  │
│  └────┘ └────┘ └────┘ └────┘  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │    │ │    │ │    │ │    │  │
│  │ 5  │ │ 6  │ │ 7  │ │ 8  │  │
│  └────┘ └────┘ └────┘ └────┘  │
│                                 │
│  🎨 后期建议                    │
│  ┌─────────────────────────────┐│
│  │ 风格：日系清新              ││
│  │ 对比度：略低                ││
│  │ 色调：带青色，肤色偏暖      ││
│  │ 颗粒：可选轻微胶片感        ││
│  └─────────────────────────────┘│
│                                 │
│  ┌──────────┐ ┌──────────────┐ │
│  │ 🔄 重新生成│ │ 📤 分享策划  │ │
│  └──────────┘ └──────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### 7.5 拍摄清单详情（展开）

```
┌─────────────────────────────────┐
│  ← 返回      拍摄详情           │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │                             ││
│  │      [样片大图]             ││
│  │                             ││
│  └─────────────────────────────┘│
│                                 │
│  断桥全景人像                   │
│  ─────────────────────────────  │
│                                 │
│  📐 景别：全景                  │
│  🎯 构图：以断桥和西湖为背景    │
│         人物居中偏右            │
│  📷 角度：平视或略低角度        │
│                                 │
│  ⚙️ 参数建议                    │
│  ┌─────────────────────────────┐│
│  │ 光圈：F2.8                  ││
│  │ 快门：1/500s                ││
│  │ ISO：100                    ││
│  │ 焦距：35mm                  ││
│  └─────────────────────────────┘│
│                                 │
│  💡 拍摄技巧                    │
│  利用桥洞形成自然框架          │
│  注意人物与背景的距离          │
│  可尝试不同姿势变化            │
│                                 │
│  🔗 样片来源                    │
│  小红书 @摄影师小王             │
│  [查看原图]                     │
│                                 │
└─────────────────────────────────┘
```

### 7.6 个人中心

```
┌─────────────────────────────────┐
│            个人中心             │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │  [头像]                     ││
│  │  王工                       ││
│  │  免费用户                   ││
│  │  今日已用：2/3 次           ││
│  └─────────────────────────────┘│
│                                 │
│  📷 我的设备                    │
│  ┌─────────────────────────────┐│
│  │ 默认 · 索尼 A7M4 + 35mm  ▶ ││
│  ├─────────────────────────────┤│
│  │ 富士 X-T5 + 23mm        ▶ ││
│  ├─────────────────────────────┤│
│  │ + 添加新设备               ││
│  └─────────────────────────────┘│
│                                 │
│  📋 历史策划                    │
│  ┌─────────────────────────────┐│
│  │ 3月15日 西湖人像        ▶ ││
│  ├─────────────────────────────┤│
│  │ 3月10日 外滩夜景        ▶ ││
│  ├─────────────────────────────┤│
│  │ 3月5日  家里宠物        ▶ ││
│  └─────────────────────────────┘│
│                                 │
│  ⚙️ 设置                        │
│  ┌─────────────────────────────┐│
│  │ 默认城市        杭州     ▶ ││
│  ├─────────────────────────────┤│
│  │ 风格偏好        日系     ▶ ││
│  ├─────────────────────────────┤│
│  │ 关于我们                  ▶ ││
│  ├─────────────────────────────┤│
│  │ 清除缓存                  ▶ ││
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

### 7.7 设备管理页

```
┌─────────────────────────────────┐
│  ← 返回      添加设备           │
├─────────────────────────────────┤
│                                 │
│  设备名称（便于识别）           │
│  ┌───────────────────────────┐ │
│  │ 索尼 A7M4 + 35mm F1.4    │ │
│  └───────────────────────────┘ │
│                                 │
│  ─── 相机信息 ───               │
│                                 │
│  品牌                           │
│  ┌───────────────────────────┐ │
│  │ 索尼 Sony              ▼ │ │
│  └───────────────────────────┘ │
│                                 │
│  型号                           │
│  ┌───────────────────────────┐ │
│  │ A7M4 (ILCE-7M4)        ▼ │ │
│  └───────────────────────────┘ │
│                                 │
│  画幅类型                       │
│  ○ 全画幅  ● APS-C  ○ M4/3     │
│                                 │
│  ─── 镜头信息 ───               │
│                                 │
│  品牌                           │
│  ┌───────────────────────────┐ │
│  │ 索尼 Sony              ▼ │ │
│  └───────────────────────────┘ │
│                                 │
│  型号                           │
│  ┌───────────────────────────┐ │
│  │ 35mm F1.4 GM           ▼ │ │
│  └───────────────────────────┘ │
│                                 │
│  焦段                           │
│  ┌───────────────────────────┐ │
│  │ 35mm                       │ │
│  └───────────────────────────┘ │
│                                 │
│  最大光圈                       │
│  ┌───────────────────────────┐ │
│  │ F1.4                       │ │
│  └───────────────────────────┘ │
│                                 │
│  ☑️ 设为默认设备                │
│                                 │
│  ┌──────────┐ ┌──────────────┐ │
│  │   取消   │ │    保存      │ │
│  └──────────┘ └──────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### 7.8 历史记录页

```
┌─────────────────────────────────┐
│  ← 返回      历史策划           │
├─────────────────────────────────┤
│                                 │
│  2026年3月                      │
│                                 │
│  ┌─────────────────────────────┐│
│  │ [缩略图] │ 3月15日 周六     ││
│  │          │ 杭州西湖 · 人像  ││
│  │          │ 索尼 A7M4       ││
│  │          │            [删除]││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ [缩略图] │ 3月10日 周一     ││
│  │          │ 上海外滩 · 夜景  ││
│  │          │ 索尼 A7M4       ││
│  │          │            [删除]││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ [缩略图] │ 3月5日 周三      ││
│  │          │ 家里 · 宠物      ││
│  │          │ 富士 X-T5       ││
│  │          │            [删除]││
│  └─────────────────────────────┘│
│                                 │
│  2026年2月                      │
│                                 │
│  ┌─────────────────────────────┐│
│  │ [缩略图] │ 2月28日 周日     ││
│  │          │ 北京故宫 · 人像  ││
│  │          │ 索尼 A7M4       ││
│  │          │            [删除]││
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

---

## 八、MVP 功能清单

### V1.0 最小可行产品

| 优先级 | 功能 | 状态 |
|--------|------|------|
| P0 | 微信登录 | 待开发 |
| P0 | 首页输入表单 | 待开发 |
| P0 | AI 策划生成 | 待开发 |
| P0 | AI 样片搜索 | 待开发 |
| P0 | 结果页展示 | 待开发 |
| P1 | 设备管理（个人资料） | 待开发 |
| P1 | 历史记录 | 待开发 |
| P2 | 天气 API 集成 | 待开发 |
| P2 | 分享功能 | 待开发 |
| P3 | 会员体系 | 预留接口 |

### V2.0 迭代方向

- AI 图像识别：上传样片，反推参数
- 社区分享：策划模板共享
- 地点推荐：基于位置的热门拍摄点
- 教程推荐：关联 YouTube/B站 教程

---

## 九、技术难点 & 解决方案

### 9.1 AI 样片搜索质量

**问题**：AI 搜索的样片可能不准确或链接失效

**解决方案**：
1. 使用高质量的 AI 模型（通义千问/DeepSeek/GLM）
2. AI 返回多个备选样片，用户自行筛选
3. 后续：缓存热门策划，减少 AI 调用
4. 后续：接入稳定图床或自建样片库
5. 添加样片有效性检测，失效时重新生成

### 9.2 AI 参数建议专业性

**问题**：AI 生成的参数建议可能不够专业

**解决方案**：
1. **Prompt 工程**：设计专业的 Prompt，包含摄影知识
2. **Few-shot 示例**：提供优质策划示例，让 AI 学习
3. **知识库辅助**：建立相机镜头参数知识库，AI 参考
4. **用户反馈**：收集用户反馈，持续优化 Prompt
5. **专家审核**：初期可人工审核，逐步提升质量

**示例 Prompt 结构**：
```
你是专业摄影策划师，拥有 10 年人像摄影经验。

【拍摄场景】
- 主题：人像
- 地点：杭州西湖
- 时间：下午 16:00-18:00
- 光线：柔和的侧逆光
- 天气：晴天

【摄影设备】
- 相机：索尼 A7M4（全画幅，2400万像素）
- 镜头：35mm F1.4 GM

请根据以上信息，生成：
1. 推荐的曝光参数（光圈、快门、ISO）
2. 构图建议
3. 拍摄技巧

注意：
- 35mm 是人文焦段，适合环境人像
- F1.4 大光圈可创造浅景深
- 下午4点光线柔和，适合逆光人像
```

### 9.3 微信登录新规

**问题**：微信小程序登录规则变更，需要使用头像昵称填写能力

**解决方案**：
1. 使用 `wx.login` 获取 code
2. 使用 `<button open-type="chooseAvatar">` 获取头像
3. 使用 `<input type="nickname">` 获取昵称
4. 参考：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html

**代码示例**：
```html
<!-- 小程序登录页 -->
<view class="login-page">
  <button open-type="chooseAvatar" bind:chooseavatar="onChooseAvatar">
    <image src="{{avatarUrl || '/assets/default-avatar.png'}}" />
    点击选择头像
  </button>
  
  <input type="nickname" placeholder="请输入昵称" bind:blur="onNicknameInput" />
  
  <button bind:tap="onLogin">完成登录</button>
</view>
```

### 9.4 响应速度优化

**问题**：AI 生成 + 搜索可能需要 10-30 秒

**解决方案**：

| 方案 | 说明 | 优先级 |
|------|------|--------|
| 骨架屏 | 加载时显示骨架屏，减少焦虑感 | P0 |
| 进度提示 | 显示正在执行的步骤和百分比 | P0 |
| 流式输出 | 如果 AI 支持，逐步返回结果 | P1 |
| 结果缓存 | 缓存热门主题的策划结果 | P1 |
| 预生成 | 用户输入时预生成部分内容 | P2 |

**异步加载策略**：
```javascript
// 前端请求
async function generatePlan(input) {
  // 1. 立即显示加载状态
  showLoading();
  
  // 2. 先获取基础策划（较快）
  const basePlan = await api.post('/plan/generate-base', input);
  updateUI(basePlan);
  
  // 3. 异步获取样片（较慢）
  api.post('/plan/generate-samples', { planId: basePlan.id })
    .then(samples => {
      updateSamples(samples);
    });
  
  // 4. 异步获取天气（可选）
  api.get(`/weather?location=${input.location}`)
    .then(weather => {
      updateWeather(weather);
    });
}
```

### 9.5 AI 服务稳定性

**问题**：AI 服务可能不稳定，导致生成失败

**解决方案**：

1. **多模型备份**：配置多个 AI 模型，自动故障转移
2. **重试机制**：失败自动重试 3 次
3. **降级方案**：AI 服务不可用时返回模板策划
4. **超时控制**：设置合理超时时间，避免用户等待过久

```javascript
// 故障转移示例
async generatePlan(input) {
  const providers = ['qwen', 'deepseek', 'glm'];
  
  for (const provider of providers) {
    try {
      return await this.providers[provider].generatePlan(input);
    } catch (error) {
      console.error(`${provider} failed:`, error);
      continue;
    }
  }
  
  // 所有模型都失败，返回降级方案
  return this.getFallbackPlan(input);
}
```

---

## 十、安全性设计

### 10.1 API 安全

| 安全措施 | 说明 |
|----------|------|
| HTTPS | 全站 HTTPS 加密传输 |
| JWT Token | 用户认证使用 JWT，设置合理过期时间 |
| Token 刷新 | Token 过期前自动刷新 |
| 接口限流 | 防刷限流，保护后端资源 |
| 参数校验 | 所有输入参数严格校验 |
| SQL/NoSQL 注入防护 | 使用 ORM，避免拼接查询 |

### 10.2 数据安全

| 安全措施 | 说明 |
|----------|------|
| 敏感信息加密 | API Key 等敏感信息加密存储 |
| 环境变量 | 敏感配置通过环境变量注入 |
| 日志脱敏 | 日志中不记录敏感信息 |
| 数据备份 | 定期备份数据库 |

### 10.3 微信小程序安全

| 安全措施 | 说明 |
|----------|------|
| code 校验 | 后端校验 code 有效性 |
| openid 绑定 | 用户数据与 openid 绑定 |
| 域名白名单 | 小程序配置合法域名 |

### 10.4 管理接口安全

```javascript
// 管理接口鉴权中间件
async function adminAuth(ctx, next) {
  const adminKey = ctx.headers['x-admin-key'];
  
  if (adminKey !== process.env.ADMIN_KEY) {
    ctx.status = 403;
    ctx.body = { code: 1002, message: '无权访问' };
    return;
  }
  
  await next();
}
```

---

## 十一、测试策略

### 11.1 单元测试

| 测试内容 | 工具 | 覆盖率目标 |
|----------|------|-----------|
| AI Provider | Jest | 80%+ |
| 业务逻辑 | Jest | 70%+ |
| 工具函数 | Jest | 90%+ |

**示例**：
```javascript
// AI Provider 测试
describe('QwenProvider', () => {
  it('should generate plan successfully', async () => {
    const provider = new QwenProvider(mockConfig);
    const result = await provider.generatePlan(mockInput);
    
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('shotList');
    expect(result.shotList.length).toBeGreaterThan(0);
  });
  
  it('should fallback on error', async () => {
    // 测试故障转移
  });
});
```

### 11.2 接口测试

| 测试内容 | 工具 |
|----------|------|
| API 接口 | Postman / Jest + Supertest |
| 性能测试 | Artillery / k6 |

### 11.3 前端测试

| 测试内容 | 工具 |
|----------|------|
| 组件测试 | Jest + React Testing Library |
| E2E 测试 | Cypress / Playwright |

### 11.4 测试环境

```
开发环境 → 测试环境 → 预发布环境 → 生产环境
   ↓          ↓           ↓            ↓
 本地调试   自动化测试   人工验收     灰度发布
```

---

## 十二、监控与运维

### 12.1 监控指标

| 指标类型 | 监控项 | 告警阈值 |
|----------|--------|----------|
| 服务可用性 | HTTP 状态码 | 5xx > 1% |
| 响应时间 | API 响应时间 | P99 > 5s |
| AI 服务 | 生成成功率 | < 95% |
| AI 服务 | 平均生成时间 | > 30s |
| 数据库 | 连接数 | > 80% |
| 服务器 | CPU/内存 | > 80% |

### 12.2 日志系统

```javascript
// 日志格式
{
  "timestamp": "2026-03-15T16:00:00Z",
  "level": "info",
  "service": "photo-plan-api",
  "traceId": "trace_xxx",
  "userId": "user_xxx",
  "action": "plan_generate",
  "provider": "qwen",
  "generateTime": 3500,
  "success": true
}
```

### 12.3 告警通知

- 钉钉/企业微信机器人
- 短信告警（紧急）
- 邮件告警（非紧急）

---

## 十三、开发排期

### 13.1 详细排期

| 阶段 | 时间 | 任务 | 产出 |
|------|------|------|------|
| **第1周** | Day 1-2 | 项目初始化 | 项目框架搭建完成 |
| | Day 3-4 | 微信登录 + 用户模块 | 登录功能可用 |
| | Day 5 | 设备管理模块 | 设备 CRUD 完成 |
| **第2周** | Day 1-2 | 后端 API 开发 | 接口联调完成 |
| | Day 3-4 | AI 服务集成 | AI 生成可用 |
| | Day 5 | 首页输入表单 | 表单完成 |
| **第3周** | Day 1-2 | 策划结果页 | 结果展示完成 |
| | Day 3 | 历史记录 | 历史功能完成 |
| | Day 4-5 | 优化 + 测试 | Bug 修复 |
| **第4周** | Day 1 | 部署上线 | 生产环境部署 |
| | Day 2-3 | 灰度测试 | 收集反馈 |
| | Day 4-5 | 问题修复 + 迭代 | V1 稳定版 |

### 13.2 里程碑

| 里程碑 | 时间 | 标准 |
|--------|------|------|
| M1: 基础功能 | 第1周末 | 登录 + 设备管理可用 |
| M2: 核心功能 | 第2周末 | AI 策划生成可用 |
| M3: 完整功能 | 第3周末 | 所有页面功能完成 |
| M4: 上线 | 第4周中 | 生产环境部署完成 |

---

## 十四、待确认问题

| 序号 | 问题 | 状态 | 备注 |
|------|------|------|------|
| 1 | AI 服务选型 | ✅ 已确认 | 配置化管理，支持多模型 |
| 2 | 后端部署方式 | ✅ 已确认 | 自有服务器部署 |
| 3 | 微信小程序 AppID | ⏳ 待确认 | 是否已注册？ |
| 4 | 域名备案 | ⏳ 待确认 | 域名是否已备案？ |
| 5 | 服务器配置 | ⏳ 待确认 | 是否有现成服务器？ |
| 6 | AI API Key | ⏳ 待确认 | 通义千问/DeepSeek/GLM 的 Key 是否已申请？ |

---

## 十五、附录

### 15.1 参考资料

- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Taro 框架文档](https://taro-docs.jd.com/)
- [通义千问 API 文档](https://help.aliyun.com/document_detail/2712195.html)
- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
- [智谱 GLM API 文档](https://open.bigmodel.cn/dev/api)

### 15.2 相似产品参考

- 小红书（样片参考）
- 图虫（摄影社区）
- 500px（专业摄影平台）

### 15.3 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| V1.0 | 2026-03-15 | 初始版本 |

---

**文档结束**

> 这是一份完整的产品需求文档，可以直接复制到 Trae 开始开发。有任何问题随时提出修改。