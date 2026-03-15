/**
 * 拍照策划小程序 - 后端服务入口
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plan', require('./routes/plan'));
app.use('/api/user', require('./routes/user'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || '服务器错误' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 服务已启动: http://localhost:${PORT}`);
});