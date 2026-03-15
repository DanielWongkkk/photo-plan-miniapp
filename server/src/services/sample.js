/**
 * 样片搜索服务
 * 使用 Unsplash + Pexels 免费 API
 */

const axios = require('axios');

class SampleService {
  constructor(config) {
    this.unsplashAccessKey = config.unsplashAccessKey || process.env.UNSPLASH_ACCESS_KEY;
    this.pexelsApiKey = config.pexelsApiKey || process.env.PEXELS_API_KEY;
  }

  /**
   * 搜索样片
   * @param {Object} params 搜索参数
   * @param {string} params.keyword 搜索关键词
   * @param {string} params.theme 拍摄主题
   * @param {string} params.location 拍摄地点
   * @param {number} params.count 数量
   * @returns {Promise<Array>} 样片列表
   */
  async searchSamples(params) {
    const { keyword, theme, location, count = 6 } = params;
    
    // 构建搜索关键词
    const searchQuery = this.buildSearchQuery(keyword, theme, location);
    
    // 并行搜索多个平台
    const results = await Promise.allSettled([
      this.searchUnsplash(searchQuery, Math.ceil(count / 2)),
      this.searchPexels(searchQuery, Math.ceil(count / 2))
    ]);
    
    // 合并结果
    const samples = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const source = index === 0 ? 'Unsplash' : 'Pexels';
        result.value.forEach(img => {
          samples.push({
            imageUrl: img.urls?.small || img.src?.medium,
            thumbnailUrl: img.urls?.thumb || img.src?.tiny,
            fullUrl: img.urls?.regular || img.src?.large,
            source: source,
            sourceIcon: index === 0 ? '🖼️' : '📷',
            author: img.user?.name || img.photographer,
            authorLink: img.user?.links?.html || `https://www.pexels.com/@${img.photographer_id}`,
            link: img.links?.html || img.url,
            width: img.width,
            height: img.height,
            color: img.color || '#eee'
          });
        });
      }
    });
    
    return samples.slice(0, count);
  }

  /**
   * 搜索 Unsplash
   */
  async searchUnsplash(query, count = 3) {
    if (!this.unsplashAccessKey) {
      console.warn('Unsplash API Key not configured');
      return [];
    }
    
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query: query,
          per_page: count,
          orientation: 'portrait' // 人像优先竖图
        },
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessKey}`
        },
        timeout: 10000
      });
      
      return response.data.results || [];
    } catch (error) {
      console.error('Unsplash search error:', error.message);
      return [];
    }
  }

  /**
   * 搜索 Pexels
   */
  async searchPexels(query, count = 3) {
    if (!this.pexelsApiKey) {
      console.warn('Pexels API Key not configured');
      return [];
    }
    
    try {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        params: {
          query: query,
          per_page: count,
          orientation: 'portrait'
        },
        headers: {
          'Authorization': this.pexelsApiKey
        },
        timeout: 10000
      });
      
      return response.data.photos || [];
    } catch (error) {
      console.error('Pexels search error:', error.message);
      return [];
    }
  }

  /**
   * 构建搜索关键词
   */
  buildSearchQuery(keyword, theme, location) {
    // 根据主题优化搜索词
    const themeKeywords = {
      '人像': ['portrait', 'people', 'model'],
      '风景': ['landscape', 'nature', 'scenery'],
      '街拍': ['street photography', 'urban', 'city'],
      '美食': ['food photography', 'cuisine', 'dish'],
      '宠物': ['pet', 'dog', 'cat', 'animal'],
      '婚礼': ['wedding', 'couple', 'bride'],
      '毕业照': ['graduation', 'student', 'campus'],
      '花卉': ['flower', 'bloom', 'spring'],
      '夜景': ['night', 'city lights', 'neon'],
      '建筑': ['architecture', 'building', 'structure']
    };
    
    const themeTerms = themeKeywords[theme] || [];
    const searchTerms = [keyword];
    
    // 添加主题相关词
    if (themeTerms.length > 0) {
      searchTerms.push(themeTerms[0]);
    }
    
    // 添加中文地点（转为拼音或英文）
    const locationEn = this.translateLocation(location);
    if (locationEn) {
      searchTerms.push(locationEn);
    }
    
    return searchTerms.join(' ');
  }

  /**
   * 地点中英文映射
   */
  translateLocation(location) {
    const locationMap = {
      '北京': 'Beijing',
      '上海': 'Shanghai',
      '广州': 'Guangzhou',
      '深圳': 'Shenzhen',
      '杭州': 'Hangzhou',
      '西湖': 'West Lake',
      '南京': 'Nanjing',
      '成都': 'Chengdu',
      '重庆': 'Chongqing',
      '武汉': 'Wuhan',
      '西安': 'Xian',
      '长沙': 'Changsha',
      '苏州': 'Suzhou',
      '厦门': 'Xiamen',
      '青岛': 'Qingdao',
      '大连': 'Dalian',
      '三亚': 'Sanya',
      '丽江': 'Lijiang',
      '桂林': 'Guilin',
      '故宫': 'Forbidden City',
      '长城': 'Great Wall',
      '外滩': 'The Bund',
      '迪士尼': 'Disney',
      '公园': 'park',
      '海边': 'beach',
      '山顶': 'mountain top',
      '古镇': 'ancient town',
      '校园': 'campus'
    };
    
    for (const [cn, en] of Object.entries(locationMap)) {
      if (location.includes(cn)) {
        return en;
      }
    }
    
    return '';
  }

  /**
   * 获取热门样片（用于首页推荐）
   */
  async getTrendingSamples(theme, count = 4) {
    const themeQueries = {
      '人像': 'portrait photography',
      '风景': 'landscape photography',
      '街拍': 'street photography',
      '美食': 'food photography',
      '宠物': 'pet photography',
      '婚礼': 'wedding photography',
      '花卉': 'flower photography',
      '夜景': 'night photography',
      '建筑': 'architecture photography'
    };
    
    const query = themeQueries[theme] || 'photography';
    return this.searchSamples({ keyword: query, theme, count });
  }
}

module.exports = SampleService;