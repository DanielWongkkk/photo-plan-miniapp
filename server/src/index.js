/**
 * 拍照策划小程序 - 后端服务入口
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务（上传的样片）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plan', require('./routes/plan'));
app.use('/api/user', require('./routes/user'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/samples', require('./routes/samples'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 文档
app.get('/', (req, res) => {
  res.json({
    name: '拍照策划小程序 API',
    version: '0.2.0',
    endpoints: {
      auth: {
        'POST /api/auth/login': '微信登录',
        'GET /api/auth/verify': '验证 Token'
      },
      plan: {
        'POST /api/plan/generate': '生成拍摄策划',
        'GET /api/plan/weather': '获取天气预报',
        'GET /api/plan/spots': '获取取景点',
        'GET /api/plan/history': '获取历史策划',
        'GET /api/plan/:id': '获取策划详情',
        'DELETE /api/plan/:id': '删除策划'
      },
      user: {
        'GET /api/user/profile': '获取用户信息',
        'PUT /api/user/profile': '更新用户信息',
        'POST /api/user/equipment': '添加设备',
        'DELETE /api/user/equipment/:id': '删除设备'
      },
      recommendations: {
        'GET /api/recommendations/weekly': '获取本周推荐',
        'GET /api/recommendations/history': '获取推荐历史',
        'POST /api/recommendations/generate': '手动生成推荐'
      }
    }
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || '服务器错误' 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 服务已启动: http://localhost:${PORT}`);
  console.log(`📖 API 文档: http://localhost:${PORT}/`);
});