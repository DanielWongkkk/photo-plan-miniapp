/**
 * 每周推荐历史页面
 */
const api = require('../../utils/api')

Page({
  data: {
    recommendations: [],
    groupedRecommendations: [],
    loading: true
  },

  onLoad() {
    this.loadRecommendations()
  },

  /**
   * 加载推荐历史
   */
  async loadRecommendations() {
    try {
      // 先从本地缓存读取
      const cached = wx.getStorageSync('allWeeklyRecommendations') || []
      
      // 从服务器获取历史推荐
      const recommendations = await api.getAllWeeklyRecommendations()
      
      // 按周分组
      const grouped = this.groupByWeek(recommendations)
      
      this.setData({
        recommendations,
        groupedRecommendations: grouped,
        loading: false
      })
      
      // 缓存到本地
      wx.setStorageSync('allWeeklyRecommendations', recommendations)
    } catch (error) {
      console.error('Load recommendations error:', error)
      
      // 使用模拟数据
      const mockData = this.getMockRecommendations()
      this.setData({
        recommendations: mockData,
        groupedRecommendations: this.groupByWeek(mockData),
        loading: false
      })
    }
  },

  /**
   * 按周分组
   */
  groupByWeek(recommendations) {
    const groups = {}
    
    recommendations.forEach(rec => {
      const weekKey = rec.week || this.getWeekKey(rec.createdAt)
      if (!groups[weekKey]) {
        groups[weekKey] = {
          week: weekKey,
          date: rec.createdAt,
          items: []
        }
      }
      groups[weekKey].items.push(rec)
    })
    
    // 按日期倒序排列
    return Object.values(groups).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )
  },

  /**
   * 获取周标识
   */
  getWeekKey(dateStr) {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const weekNum = this.getWeekNumber(date)
    return `${year}年第${weekNum}周`
  },

  /**
   * 获取周数
   */
  getWeekNumber(date) {
    const firstDay = new Date(date.getFullYear(), 0, 1)
    const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000))
    return Math.ceil((days + firstDay.getDay() + 1) / 7)
  },

  /**
   * 模拟数据
   */
  getMockRecommendations() {
    return [
      // 本周推荐
      {
        id: 'rec_001',
        week: '2026年第11周',
        title: '🌸 春日樱花人像',
        subtitle: '花期正盛，错过再等一年',
        theme: '人像',
        location: '长沙橘子洲头 / 烈士公园',
        reason: '三月下旬至四月上旬是樱花最佳观赏期，适合拍摄日系清新风格人像',
        tags: ['樱花', '日系', '人像'],
        hot: true,
        createdAt: '2026-03-15'
      },
      {
        id: 'rec_002',
        week: '2026年第11周',
        title: '🌷 郁金香花海',
        subtitle: '春日限定，色彩斑斓',
        theme: '风景',
        location: '湖南省植物园',
        reason: '郁金香花期短暂但色彩丰富，适合拍摄大面积花海或人像',
        tags: ['郁金香', '花海', '春日'],
        hot: false,
        createdAt: '2026-03-15'
      },
      {
        id: 'rec_003',
        week: '2026年第11周',
        title: '🏙️ 城市夜色',
        subtitle: '华灯初上，城市最美时刻',
        theme: '夜景',
        location: 'IFS国金中心 / 湘江两岸',
        reason: '春季夜晚气温适宜，城市灯光与江景相映成趣',
        tags: ['夜景', '城市', '长曝光'],
        hot: false,
        createdAt: '2026-03-15'
      },
      // 上周推荐
      {
        id: 'rec_004',
        week: '2026年第10周',
        title: '🏔️ 山野徒步摄影',
        subtitle: '春暖花开，山间寻景',
        theme: '风景',
        location: '岳麓山 / 大围山',
        reason: '三月山间野花盛开，适合徒步拍摄自然风光',
        tags: ['山野', '徒步', '风光'],
        hot: true,
        createdAt: '2026-03-08'
      },
      {
        id: 'rec_005',
        week: '2026年第10周',
        title: '🎭 街头人文',
        subtitle: '城市角落，故事无处不在',
        theme: '街拍',
        location: '太平老街 / 坡子街',
        reason: '周末人流较多，适合捕捉生动的街头瞬间',
        tags: ['街拍', '人文', '纪实'],
        hot: false,
        createdAt: '2026-03-08'
      },
      // 更早的推荐
      {
        id: 'rec_006',
        week: '2026年第9周',
        title: '🌅 日出云海',
        subtitle: '清晨登高，云海翻涌',
        theme: '风景',
        location: '岳麓山顶',
        reason: '春季早晚温差大，清晨易形成云海奇观',
        tags: ['日出', '云海', '风光'],
        hot: false,
        createdAt: '2026-03-01'
      },
      {
        id: 'rec_007',
        week: '2026年第9周',
        title: '🐱 萌宠写真',
        subtitle: '春日阳光，宠物最萌',
        theme: '宠物',
        location: '橘子洲草坪 / 小区公园',
        reason: '春日阳光柔和，适合户外拍摄宠物',
        tags: ['宠物', '萌宠', '户外'],
        hot: false,
        createdAt: '2026-03-01'
      }
    ]
  },

  /**
   * 点击推荐卡片
   */
  onRecommendationTap(e) {
    const { item } = e.currentTarget.dataset
    
    // 填充表单并返回首页
    wx.setStorageSync('selectedRecommendation', item)
    wx.switchTab({ url: '/pages/index/index' })
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    await this.loadRecommendations()
    wx.stopPullDownRefresh()
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '拍照策划 - AI每周推荐',
      path: '/pages/recommendations/recommendations'
    }
  }
})