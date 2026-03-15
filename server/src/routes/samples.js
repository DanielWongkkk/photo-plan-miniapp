/**
 * 样片上传路由
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const SampleUploadService = require('../services/sample-upload');
const config = require('../config');

// 配置 multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // 最多5张
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型，仅支持 JPG/PNG/GIF/WebP'));
    }
  }
});

// 初始化服务
const uploadService = new SampleUploadService({
  uploadDir: path.join(__dirname, '../uploads/samples'),
  ...config
});

/**
 * 上传单张样片并分析
 * POST /api/samples/upload
 */
router.post('/upload', upload.single('sample'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' });
    }

    const { theme, title } = req.body;
    const userId = req.user?.userId || 'guest'; // 从认证中间件获取用户ID

    const result = await uploadService.uploadAndAnalyze(
      req.file,
      userId,
      theme || '人像',
      title
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Upload sample error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 批量上传样片并分析
 * POST /api/samples/upload-batch
 */
router.post('/upload-batch', upload.array('samples', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '请选择要上传的图片' });
    }

    const { theme } = req.body;
    const userId = req.user?.userId || 'guest';

    const results = await uploadService.uploadAndAnalyzeBatch(
      req.files,
      userId,
      theme || '人像'
    );

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Upload samples error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 获取用户上传的样片列表
 * GET /api/samples/my
 */
router.get('/my', async (req, res) => {
  try {
    const userId = req.user?.userId || 'guest';
    const samples = uploadService.getUserSamples(userId);
    
    res.json({
      success: true,
      data: samples
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 删除样片
 * DELETE /api/samples/:filename
 */
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user?.userId || 'guest';
    
    const deleted = uploadService.deleteSample(filename, userId);
    
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '文件不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 分析已有样片URL
 * POST /api/samples/analyze-url
 */
router.post('/analyze-url', async (req, res) => {
  try {
    const { imageUrl, theme, title } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: '请提供图片URL' });
    }

    const SampleAnalysisService = require('../services/sample-analysis');
    const analysisService = new SampleAnalysisService(config);
    
    const result = await analysisService.analyzeSample(
      { imageUrl, title: title || '参考样片' },
      theme || '人像'
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Analyze URL error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;