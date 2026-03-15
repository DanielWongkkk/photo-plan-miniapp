/**
 * 推荐路由
 */

const express = require('express');
const router = express.Router();
const RecommendationService = require('../services/recommendation');
const config = require('../config');

const recommendationService = new RecommendationService(config);

/**
 * 获取本周推荐
 * GET /api/recommendations/weekly
 */
router.get('/weekly', async (req, res) => {
  try {
    const recommendations = await recommendationService.generateWeeklyRecommendations();
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get weekly recommendations error:', error);
    // 返回默认推荐
    const defaults = recommendationService.getDefaultRecommendations('春季', 3, 11);
    res.json({
      success: true,
      data: defaults
    });
  }
});

/**
 * 获取推荐历史
 * GET /api/recommendations/history
 */
router.get('/history', async (req, res) => {
  try {
    const recommendations = await recommendationService.getAllRecommendations();
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get recommendation history error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取推荐详情
 * GET /api/recommendations/:id
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
 * 手动触发生成推荐（管理员接口）
 * POST /api/recommendations/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const recommendations = await recommendationService.generateWeeklyRecommendations();
    res.json({
      success: true,
      data: recommendations,
      message: '推荐生成成功'
    });
  } catch (error) {
    console.error('Generate recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;