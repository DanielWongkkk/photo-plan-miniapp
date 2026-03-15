/**
 * 策划路由
 */

const express = require('express');
const router = express.Router();

/**
 * 生成拍照策划
 * POST /api/plan/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { theme, location, time, equipment, style, notes } = req.body;
    
    // TODO: 调用 AI 服务生成策划
    // const plan = await aiService.generatePlan({ theme, location, time, equipment, style, notes });
    
    // 模拟返回数据
    const plan = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      basicInfo: {
        theme,
        location: `${location} - 建议取景点`,
        time: `${time} - 光线柔和`,
        weather: '晴天适合拍摄'
      },
      equipment: {
        lens: equipment?.lens || '建议使用 50mm 或 85mm 定焦',
        aperture: 'f/1.8 - f/2.8',
        shutter: '1/200s - 1/500s',
        iso: '100 - 400',
        filters: []
      },
      shotList: [
        {
          id: 1,
          type: '全景',
          composition: '利用前景框架，突出主体',
          sample: 'https://example.com/sample1.jpg',
          params: 'f/2.8, 1/200s, ISO 200'
        },
        {
          id: 2,
          type: '中景',
          composition: '三分法构图，留白呼吸感',
          sample: 'https://example.com/sample2.jpg',
          params: 'f/2.0, 1/250s, ISO 100'
        },
        {
          id: 3,
          type: '特写',
          composition: '大光圈虚化背景，突出细节',
          sample: 'https://example.com/sample3.jpg',
          params: 'f/1.8, 1/320s, ISO 100'
        }
      ],
      samples: [
        {
          url: 'https://example.com/sample1.jpg',
          source: '小红书',
          tags: ['逆光', '黄金时刻']
        }
      ]
    };
    
    res.json({ success: true, data: plan });
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

module.exports = router;