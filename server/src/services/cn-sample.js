/**
 * 国内样片搜索服务
 * 支持：小红书搜索、图虫、花瓣等
 */

const axios = require('axios');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class CNSampleService {
  constructor(config) {
    this.tuchongCookie = config.tuchongCookie || process.env.TUCHONG_COOKIE;
    this.xiaohongshuWebSession = config.xiaohongshuWebSession || process.env.XIAOHONGSHU_WEB_SESSION;
    this.xiaohongshuSkillPath = '/home/node/.openclaw/workspace/skills/xiaohongshutools';
  }

  /**
   * 综合搜索国内样片
   * @param {Object} params 
   * @returns {Promise<Object>} 包含真实图片 + 搜索链接
   */
  async searchCNSamples(params) {
    const { keyword, theme, location, count = 6 } = params;
    
    // 生成搜索关键词
    const searchKeyword = this.buildSearchKeyword(keyword, theme, location);
    
    // 并行执行多个方案
    const results = await Promise.allSettled([
      // 方案1：小红书搜索（如果配置了 web_session）
      this.searchXiaohongshu(searchKeyword, count),
      // 方案2：爬取图虫（如果配置了cookie）
      this.searchTuchong(searchKeyword, count),
    ]);
    
    // 合并真实图片
    const images = [];
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
        images.push(...result.value);
      }
    });
    
    // 生成搜索链接
    const searchLinks = this.generateSearchLinks(searchKeyword);
    
    return {
      images: images.slice(0, count),     // 真实获取的图片
      searchLinks,                         // 搜索链接（让用户自己去看）
      keyword: searchKeyword
    };
  }

  /**
   * 小红书搜索（需要配置 web_session）
   */
  async searchXiaohongshu(keyword, count = 6) {
    if (!this.xiaohongshuWebSession) {
      console.log('小红书 web_session 未配置，跳过搜索');
      return [];
    }
    
    try {
      // 使用 xiaohongshutools skill 的 Python 脚本
      const scriptPath = path.join(this.xiaohongshuSkillPath, 'scripts');
      const escapedKeyword = keyword.replace(/"/g, '\\"');
      const escapedSession = this.xiaohongshuWebSession.replace(/"/g, '\\"');
      
      const pythonCode = `
import asyncio
import sys
import json
sys.path.insert(0, '${scriptPath}')

from request.web.xhs_session import create_xhs_session

async def search():
    try:
        xhs = await create_xhs_session(proxy=None, web_session="${escapedSession}")
        res = await xhs.apis.note.search_notes("${escapedKeyword}")
        data = await res.json()
        
        results = []
        if data.get('success') and data.get('data'):
            items = data['data'].get('items', [])
            for item in items[:${count}]:
                cover_url = item.get('cover', {}).get('url', '')
                if cover_url:
                    results.append({
                        'imageUrl': cover_url,
                        'source': '小红书',
                        'sourceIcon': '📕',
                        'author': item.get('user', {}).get('nickname', '匿名'),
                        'title': item.get('display_title', ''),
                        'likes': item.get('liked_count', 0),
                        'link': f"https://www.xiaohongshu.com/explore/{item.get('note_id', '')}"
                    })
        
        await xhs.close_session()
        print(json.dumps(results, ensure_ascii=False))
    except Exception as e:
        print(json.dumps([], ensure_ascii=False))

asyncio.run(search())
`;

      // 写入临时脚本并执行
      const tempScript = `/tmp/xhs_search_${Date.now()}.py`;
      fs.writeFileSync(tempScript, pythonCode);
      
      const result = execSync(`python3 ${tempScript} 2>/dev/null`, {
        encoding: 'utf-8',
        timeout: 30000,
        cwd: this.xiaohongshuSkillPath
      });
      
      // 清理临时文件
      fs.unlinkSync(tempScript);
      
      const data = JSON.parse(result);
      return data || [];
    } catch (error) {
      console.error('小红书搜索异常:', error.message);
      return [];
    }
  }

  /**
   * 生成各平台搜索链接
   */
  generateSearchLinks(keyword) {
    const encodedKeyword = encodeURIComponent(keyword);
    
    return {
      xiaohongshu: {
        name: '小红书',
        icon: '📕',
        url: `https://www.xiaohongshu.com/search_result?keyword=${encodedKeyword}`,
        appUrl: `xhssearch://search/result?keyword=${encodedKeyword}`,
        tip: '点击跳转小红书搜索'
      },
      tuchong: {
        name: '图虫',
        icon: '🖼️',
        url: `https://tuchong.com/search/${encodedKeyword}/`,
        tip: '专业摄影社区'
      },
      huaban: {
        name: '花瓣网',
        icon: '🌸',
        url: `https://huaban.com/search?q=${encodedKeyword}`,
        tip: '设计灵感'
      },
      poco: {
        name: 'POCO摄影',
        icon: '📷',
        url: `https://photo.poco.cn/search?type=photo&keyword=${encodedKeyword}`,
        tip: '老牌摄影社区'
      },
      baidu: {
        name: '百度图片',
        icon: '🔍',
        url: `https://image.baidu.com/search/index?tn=baiduimage&word=${encodedKeyword}+摄影`,
        tip: '综合图片搜索'
      },
      weibo: {
        name: '微博',
        icon: '📱',
        url: `https://s.weibo.com/weibo/${encodedKeyword}%20摄影`,
        tip: '社交媒体'
      }
    };
  }

  /**
   * 搜索图虫（需要登录cookie）
   */
  async searchTuchong(keyword, count = 6) {
    if (!this.tuchongCookie) {
      console.warn('Tuchong cookie not configured, returning empty');
      return [];
    }
    
    try {
      const response = await axios.get('https://tuchong.com/rest/search/posts', {
        params: {
          query: keyword,
          count: count,
          page: 1
        },
        headers: {
          'Cookie': this.tuchongCookie,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://tuchong.com/'
        },
        timeout: 10000
      });
      
      if (response.data && response.data.post_list) {
        return response.data.post_list.map(post => ({
          imageUrl: post.images?.[0]?.url?.medium || post.cover,
          thumbnailUrl: post.images?.[0]?.url?.small || post.cover,
          source: '图虫',
          sourceIcon: '🖼️',
          author: post.author?.nickname || post.author?.name,
          authorLink: `https://tuchong.com/${post.author?.site_id}/`,
          link: `https://tuchong.com/${post.author?.site_id}/${post.post_id}/`,
          title: post.title,
          likes: post.favorites,
          views: post.views
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Tuchong search error:', error.message);
      return [];
    }
  }

  /**
   * 构建搜索关键词
   */
  buildSearchKeyword(keyword, theme, location) {
    const keywords = [];
    
    // 添加主题相关词
    const themeKeywords = {
      '人像': ['人像', '人像摄影', '写真'],
      '风景': ['风景', '风光', '风景摄影'],
      '街拍': ['街拍', '街头摄影', '人文'],
      '美食': ['美食', '美食摄影', '食物拍摄'],
      '宠物': ['宠物', '宠物摄影', '猫', '狗'],
      '婚礼': ['婚礼', '婚纱', '婚礼跟拍'],
      '毕业照': ['毕业照', '毕业季', '校园'],
      '花卉': ['花卉', '花', '植物摄影'],
      '夜景': ['夜景', '城市夜景', '灯光'],
      '建筑': ['建筑', '建筑摄影', '城市建筑']
    };
    
    if (theme && themeKeywords[theme]) {
      keywords.push(themeKeywords[theme][0]);
    }
    
    // 添加原始关键词
    if (keyword) {
      keywords.push(keyword);
    }
    
    // 添加地点
    if (location) {
      keywords.push(location);
    }
    
    // 添加"摄影"后缀提高搜索质量
    const result = keywords.join(' ');
    return result.includes('摄影') ? result : result + ' 摄影';
  }

  /**
   * 生成平台专属搜索词
   */
  generatePlatformKeywords(keyword, theme, platform) {
    const platformStyles = {
      'xiaohongshu': {
        suffix: ['教程', '技巧', '姿势', '构图'],
        prefix: ['最美', '超好看', 'ins风']
      },
      'tuchong': {
        suffix: ['作品', '大片'],
        prefix: []
      },
      'huaban': {
        suffix: ['灵感', '参考'],
        prefix: []
      }
    };
    
    const style = platformStyles[platform] || { suffix: [], prefix: [] };
    
    // 随机添加一个后缀
    if (style.suffix.length > 0) {
      const suffix = style.suffix[Math.floor(Math.random() * style.suffix.length)];
      return `${keyword} ${suffix}`;
    }
    
    return keyword;
  }

  /**
   * 智能推荐：根据场景推荐搜索词
   */
  getRecommendedSearchScenes(theme, location, season) {
    const scenes = [];
    
    // 根据季节推荐
    const seasonScenes = {
      '春季': ['樱花', '春游', '春日', '踏青'],
      '夏季': ['海边', '夏日', '避暑', '荷花'],
      '秋季': ['银杏', '枫叶', '秋色', '金秋'],
      '冬季': ['雪景', '冬日', '暖阳', '雾凇']
    };
    
    // 根据主题推荐
    const themeScenes = {
      '人像': ['逆光', '日系', '胶片', '清新', '情绪'],
      '风景': ['日出', '日落', '云海', '星空', '倒影'],
      '街拍': ['人文', '纪实', '黑白', '城市'],
      '美食': ['美食', '下午茶', '甜品', '咖啡']
    };
    
    // 组合推荐
    if (season && seasonScenes[season]) {
      scenes.push(...seasonScenes[season].slice(0, 2));
    }
    
    if (theme && themeScenes[theme]) {
      scenes.push(...themeScenes[theme].slice(0, 3));
    }
    
    return [...new Set(scenes)];
  }
}

module.exports = CNSampleService;