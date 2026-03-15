/**
 * 策划路由 - 增强版
 */

const express = require('express');
const router = express.Router();
const PlanService = require('../services/plan');
const SampleService = require('../services/sample');
const config = require('../config');

// 初始化服务
const planService = new PlanService({
  ai: config,
  weatherApiKey: process.env.WEATHER_API_KEY,
  unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
  pexelsApiKey: process.env.PEXELS_API_KEY
});

const sampleService = new SampleService({
  unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
  pexelsApiKey: process.env.PEXELS_API_KEY
});

/**
 * 生成拍照策划
 * POST /api/plan/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { theme, location, date, equipment, style, notes } = req.body;
    
    // 验证必填字段
    if (!theme || !location) {
      return res.status(400).json({ 
        error: '请填写拍摄主题和地点' 
      });
    }

    // 生成策划
    const plan = await planService.generatePlan({
      theme,
      location,
      date: date || new Date().toISOString().split('T')[0],
      equipment,
      style,
      notes
    });

    res.json({ 
      success: true, 
      data: plan 
    });
  } catch (error) {
    console.error('Generate plan error:', error);
    res.status(500).json({ 
      error: error.message || '生成策划失败，请稍后重试' 
    });
  }
});

/**
 * 获取天气预报
 * GET /api/plan/weather?location=xxx
 */
router.get('/weather', async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.status(400).json({ error: '请提供地点' });
    }

    const weather = await planService.getWeatherForecast(location);
    res.json({ success: true, data: weather });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 获取取景点
 * GET /api/plan/spots?location=xxx&theme=xxx
 */
router.get('/spots', async (req, res) => {
  try {
    const { location, theme } = req.query;
    
    if (!location) {
      return res.status(400).json({ error: '请提供地点' });
    }

    const spots = await planService.generateShootingSpots(location, theme || '人像', null);
    res.json({ success: true, data: spots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 搜索样片
 * GET /api/plan/samples?keyword=xxx&theme=xxx&location=xxx
 */
router.get('/samples', async (req, res) => {
  try {
    const { keyword, theme, location, count } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ error: '请提供搜索关键词' });
    }

    const samples = await sampleService.searchSamples({
      keyword,
      theme: theme || '',
      location: location || '',
      count: parseInt(count) || 6
    });
    
    res.json({ success: true, data: samples });
  } catch (error) {
    console.error('Search samples error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 获取热门样片
 * GET /api/plan/samples/trending?theme=xxx
 */
router.get('/samples/trending', async (req, res) => {
  try {
    const { theme } = req.query;
    
    const samples = await sampleService.getTrendingSamples(theme || '人像', 8);
    res.json({ success: true, data: samples });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 获取历史策划
 * GET /api/plan/history
 */
router.get('/history', (req, res) => {
  // TODO: 从数据库获取
  res.json({
    success: true,
    data: []
  });
});

/**
 * 获取单个策划详情
 * GET /api/plan/:id
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  // TODO: 从数据库获取
  res.json({
    success: true,
    data: null
  });
});

/**
 * 删除策划
 * DELETE /api/plan/:id
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  // TODO: 从数据库删除
  res.json({ success: true });
});

/**
 * 保存策划进度
 * POST /api/plan/:id/progress
 */
router.post('/:id/progress', (req, res) => {
  const { id } = req.params;
  const { completedShots } = req.body;
  // TODO: 保存到数据库
  res.json({ success: true });
});

module.exports = router;