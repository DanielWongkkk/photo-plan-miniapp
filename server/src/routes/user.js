/**
 * 用户路由
 */

const express = require('express');
const router = express.Router();

/**
 * 获取用户信息
 * GET /api/user/profile
 */
router.get('/profile', (req, res) => {
  // TODO: 从数据库获取用户信息
  res.json({
    success: true,
    data: {
      nickName: '摄影爱好者',
      avatarUrl: '',
      city: '北京',
      equipments: [],
      defaultEquipmentId: null,
      stylePreferences: []
    }
  });
});

/**
 * 更新用户信息
 * PUT /api/user/profile
 */
router.put('/profile', (req, res) => {
  const updates = req.body;
  // TODO: 更新数据库
  res.json({ success: true });
});

/**
 * 添加设备
 * POST /api/user/equipment
 */
router.post('/equipment', (req, res) => {
  const { brand, model, lens } = req.body;
  // TODO: 保存到数据库
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      brand,
      model,
      lens,
      createdAt: new Date().toISOString()
    }
  });
});

/**
 * 删除设备
 * DELETE /api/user/equipment/:id
 */
router.delete('/equipment/:id', (req, res) => {
  const { id } = req.params;
  // TODO: 从数据库删除
  res.json({ success: true });
});

/**
 * 设置默认设备
 * PUT /api/user/equipment/:id/default
 */
router.put('/equipment/:id/default', (req, res) => {
  const { id } = req.params;
  // TODO: 更新默认设备
  res.json({ success: true });
});

module.exports = router;