/**
 * 样片上传服务
 * 支持用户上传自己的参考图片
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const SampleAnalysisService = require('./sample-analysis');

class SampleUploadService {
  constructor(config) {
    this.uploadDir = config.uploadDir || path.join(__dirname, '../uploads/samples');
    this.analysisService = new SampleAnalysisService(config);
    
    // 确保上传目录存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 保存上传的样片
   * @param {Object} file 上传的文件对象
   * @param {string} userId 用户ID
   * @returns {Object} 保存结果
   */
  async saveSample(file, userId) {
    // 生成文件名
    const ext = path.extname(file.originalname || '.jpg');
    const filename = `${userId}_${Date.now()}${ext}`;
    const filepath = path.join(this.uploadDir, filename);
    
    // 保存文件
    if (file.buffer) {
      fs.writeFileSync(filepath, file.buffer);
    } else if (file.path) {
      fs.copyFileSync(file.path, filepath);
    }
    
    // 返回可访问的 URL
    return {
      filename,
      filepath,
      url: `/uploads/samples/${filename}`,
      size: file.size,
      mimetype: file.mimetype
    };
  }

  /**
   * 上传并分析样片
   * @param {Object} file 上传的文件
   * @param {string} userId 用户ID
   * @param {string} theme 拍摄主题
   * @param {string} title 样片标题（可选）
   * @returns {Promise<Object>} 分析结果
   */
  async uploadAndAnalyze(file, userId, theme, title = '用户上传样片') {
    // 1. 保存文件
    const saved = await this.saveSample(file, userId);
    
    // 2. 分析样片
    // 构建本地文件访问 URL（需要根据实际部署调整）
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const imageUrl = `${baseUrl}${saved.url}`;
    
    try {
      const analysis = await this.analysisService.analyzeSample(
        { imageUrl, title },
        theme
      );
      
      return {
        ...saved,
        analysis: analysis.analysis,
        title,
        theme,
        uploadTime: new Date().toISOString()
      };
    } catch (error) {
      console.error('Analyze uploaded sample error:', error);
      return {
        ...saved,
        analysis: null,
        error: error.message,
        title,
        theme,
        uploadTime: new Date().toISOString()
      };
    }
  }

  /**
   * 批量上传并分析样片
   */
  async uploadAndAnalyzeBatch(files, userId, theme) {
    const results = await Promise.all(
      files.map((file, index) => 
        this.uploadAndAnalyze(file, userId, theme, `样片 ${index + 1}`)
      )
    );
    return results;
  }

  /**
   * 删除样片
   */
  deleteSample(filename, userId) {
    const filepath = path.join(this.uploadDir, filename);
    
    // 验证文件属于该用户
    if (!filename.startsWith(`${userId}_`)) {
      throw new Error('无权删除此文件');
    }
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  }

  /**
   * 获取用户上传的样片列表
   */
  getUserSamples(userId) {
    const files = fs.readdirSync(this.uploadDir);
    return files
      .filter(f => f.startsWith(`${userId}_`))
      .map(filename => ({
        filename,
        url: `/uploads/samples/${filename}`,
        uploadTime: fs.statSync(path.join(this.uploadDir, filename)).mtime
      }))
      .sort((a, b) => b.uploadTime - a.uploadTime);
  }
}

module.exports = SampleUploadService;