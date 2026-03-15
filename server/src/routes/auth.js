/**
 * 认证路由
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

/**
 * 微信登录
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { code, userInfo } = req.body;
    
    // TODO: 调用微信 API 获取 openid
    // const wxRes = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`);
    
    // 生成 JWT
    const token = jwt.sign(
      { userId: 'mock_user_id', openid: 'mock_openid' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        userInfo: {
          nickName: userInfo?.nickName || '用户',
          avatarUrl: userInfo?.avatarUrl || ''
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 验证 Token
 * GET /api/auth/verify
 */
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '未登录' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    res.json({ valid: true, userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ error: 'Token 无效' });
  }
});

module.exports = router;