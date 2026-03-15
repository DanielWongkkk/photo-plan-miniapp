/**
 * 首页 - 输入表单 + AI 每周推荐
 */
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    // 用户信息
    userInfo: null,
    
    // AI 每周推荐
    weeklyRecommendations: [],
    currentRecIndex: 0,
    
    // 表单数据
    formData: {
      theme: '',
      themeId: '',
      location: '',
      date: '',
      dateStr: '',
      timeSlot: '',
      timeSlotName: '',
      equipmentId: '',
      equipmentName: '',
      style: '',
      notes: ''
    },
    
    // 选项数据
    themeOptions: [
      { id: 'portrait', name: '人像', icon: '👩' },
      { id: 'landscape', name: '风景', icon: '🏔️' },
      { id: 'street', name: '街拍', icon: '🏙️' },
      { id: 'food', name: '美食', icon: '🍜' },
      { id: 'pet', name: '宠物', icon: '🐱' },
      { id: 'wedding', name: '婚礼', icon: '💍' },
      { id: 'graduation', name: '毕业照', icon: '🎓' },
      { id: 'flower', name: '花卉', icon: '🌸' },
      { id: 'night', name: '夜景', icon: '🌃' },
      { id: 'architecture', name: '建筑', icon: '🏛️' }
    ],
    
    timeSlotOptions: [
      { id: 'morning', name: '早晨', desc: '06:00-09:00', icon: '🌅' },
      { id: 'forenoon', name: '上午', desc: '09:00-12:00', icon: '☀️' },
      { id: 'afternoon', name: '下午', desc: '14:00-17:00', icon: '🌤️' },
      { id: 'golden', name: '黄金时刻', desc: '16:00-18:00', icon: '🌇' },
      { id: 'sunset', name: '傍晚', desc: '18:00-19:30', icon: '🌆' },
      { id: 'night', name: '夜晚', desc: '19:30-22:00', icon: '🌃' }
    ],
    
    styleOptions: [
      { id: 'japanese', name: '日系清新', color: '#A8D8EA' },
      { id: 'film', name: '复古胶片', color: '#D4A574' },
      { id: 'dark', name: '暗调', color: '#4A4A4A' },
      { id: 'bright', name: '明亮', color: '#FFF9C4' },
      { id: 'moody', name: '情绪', color: '#6B5B95' },
      { id: 'cinematic', name: '电影感', color: '#2C3E50' }
    ],
    
    // 设备列表
    equipments: [],
    
    // 显示选择器
    showThemePicker: false,
    showTimePicker: false,
    showStylePicker: false,
    showEquipmentPicker: false,
    
    // 日期选择
    minDate: '',
    maxDate: ''
  },

  onLoad() {
    this.initDatePicker()
    this.loadUserInfo()
    this.loadWeeklyRecommendations()
    this.loadEquipments()
  },

  onShow() {
    // 每次显示页面时刷新设备列表
    this.loadEquipments()
  },

  /**
   * 初始化日期选择器
   */
  initDatePicker() {
    const today = new Date()
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30) // 最多选择30天后
    
    this.setData({
      'formData.date': this.formatDate(today),
      'formData.dateStr': this.formatDateCN(today),
      minDate: this.formatDate(today),
      maxDate: this.formatDate(maxDate)
    })
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  /**
   * 加载每周推荐
   */
  async loadWeeklyRecommendations() {
    try {
      // 先从本地缓存读取
      const cached = wx.getStorageSync('weeklyRecommendations')
      const cacheTime = wx.getStorageSync('weeklyRecommendationsTime')
      
      // 缓存有效期：24小时
      if (cached && cacheTime && Date.now() - cacheTime < 24 * 60 * 60 * 1000) {
        this.setData({ weeklyRecommendations: cached })
        return
      }
      
      // 从服务器获取
      const recommendations = await api.getWeeklyRecommendations()
      this.setData({ weeklyRecommendations: recommendations })
      
      // 缓存到本地
      wx.setStorageSync('weeklyRecommendations', recommendations)
      wx.setStorageSync('weeklyRecommendationsTime', Date.now())
    } catch (error) {
      console.error('Load recommendations error:', error)
      // 使用模拟数据
      this.setData({ weeklyRecommendations: this.getMockRecommendations() })
    }
  },

  /**
   * 模拟推荐数据
   */
  getMockRecommendations() {
    const weekNum = this.getWeekNumber(new Date())
    return [
      {
        id: 'rec_001',
        week: `第${weekNum}周推荐`,
        title: '🌸 春日樱花人像',
        subtitle: '花期正盛，错过再等一年',
        theme: '人像',
        location: '长沙橘子洲头 / 烈士公园',
        reason: '三月下旬至四月上旬是樱花最佳观赏期，适合拍摄日系清新风格人像',
        tags: ['樱花', '日系', '人像'],
        coverImage: 'https://example.com/sakura.jpg',
        hot: true,
        createdAt: '2026-03-15'
      },
      {
        id: 'rec_002',
        week: `第${weekNum}周推荐`,
        title: '🌷 郁金香花海',
        subtitle: '春日限定，色彩斑斓',
        theme: '风景',
        location: '湖南省植物园',
        reason: '郁金香花期短暂但色彩丰富，适合拍摄大面积花海或人像',
        tags: ['郁金香', '花海', '春日'],
        coverImage: 'https://example.com/tulip.jpg',
        hot: false,
        createdAt: '2026-03-15'
      },
      {
        id: 'rec_003',
        week: `第${weekNum}周推荐`,
        title: '🏙️ 城市夜色',
        subtitle: '华灯初上，城市最美时刻',
        theme: '夜景',
        location: 'IFS国金中心 / 湘江两岸',
        reason: '春季夜晚气温适宜，城市灯光与江景相映成趣',
        tags: ['夜景', '城市', '长曝光'],
        coverImage: 'https://example.com/night.jpg',
        hot: false,
        createdAt: '2026-03-15'
      },
      {
        id: 'rec_004',
        week: `第${weekNum}周推荐`,
        title: '🎭 街头人文',
        subtitle: '城市角落，故事无处不在',
        theme: '街拍',
        location: '太平老街 / 坡子街',
        reason: '周末人流较多，适合捕捉生动的街头瞬间',
        tags: ['街拍', '人文', '纪实'],
        coverImage: 'https://example.com/street.jpg',
        hot: false,
        createdAt: '2026-03-15'
      }
    ]
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
   * 加载设备列表
   */
  loadEquipments() {
    const equipments = wx.getStorageSync('equipments') || []
    this.setData({ equipments })
    
    if (equipments.length > 0 && !this.data.formData.equipmentId) {
      const defaultEquip = equipments.find(e => e.isDefault) || equipments[0]
      this.setData({
        'formData.equipmentId': defaultEquip.id,
        'formData.equipmentName': `${defaultEquip.brand} ${defaultEquip.model} ${defaultEquip.lens}`
      })
    }
  },

  /**
   * 轮播切换
   */
  onSwiperChange(e) {
    this.setData({ currentRecIndex: e.detail.current })
  },

  /**
   * 点击推荐卡片
   */
  onRecommendationTap(e) {
    const { item } = e.currentTarget.dataset
    if (!item) return
    
    // 填充表单
    this.setData({
      'formData.theme': item.theme,
      'formData.location': item.location.split(' / ')[0]
    })
    
    wx.showToast({
      title: '已填入推荐主题',
      icon: 'success'
    })
  },

  /**
   * 查看更多推荐
   */
  viewMoreRecommendations() {
    wx.navigateTo({
      url: '/pages/recommendations/recommendations'
    })
  },

  /**
   * 选择主题
   */
  selectTheme(e) {
    const { item } = e.currentTarget.dataset
    this.setData({
      'formData.theme': item.name,
      'formData.themeId': item.id,
      showThemePicker: false
    })
  },

  /**
   * 选择时间
   */
  selectTime(e) {
    const { item } = e.currentTarget.dataset
    this.setData({
      'formData.timeSlot': item.id,
      'formData.timeSlotName': item.name,
      showTimePicker: false
    })
  },

  /**
   * 选择风格
   */
  selectStyle(e) {
    const { item } = e.currentTarget.dataset
    this.setData({
      'formData.style': item.name,
      showStylePicker: false
    })
  },

  /**
   * 选择设备
   */
  selectEquipment(e) {
    const { item } = e.currentTarget.dataset
    this.setData({
      'formData.equipmentId': item.id,
      'formData.equipmentName': `${item.brand} ${item.model} ${item.lens}`,
      showEquipmentPicker: false
    })
  },

  /**
   * 日期选择
   */
  onDateChange(e) {
    const date = new Date(e.detail.value)
    this.setData({
      'formData.date': e.detail.value,
      'formData.dateStr': this.formatDateCN(date)
    })
  },

  /**
   * 输入地点
   */
  onLocationInput(e) {
    this.setData({ 'formData.location': e.detail.value })
  },

  /**
   * 输入备注
   */
  onNotesInput(e) {
    this.setData({ 'formData.notes': e.detail.value })
  },

  /**
   * 显示/隐藏选择器
   */
  togglePicker(e) {
    const { type } = e.currentTarget.dataset
    const key = `show${type.charAt(0).toUpperCase() + type.slice(1)}Picker`
    this.setData({ [key]: !this.data[key] })
  },

  /**
   * 生成策划
   */
  async generatePlan() {
    const { formData } = this.data
    
    // 验证必填项
    if (!formData.theme) {
      return wx.showToast({ title: '请选择拍摄主题', icon: 'none' })
    }
    if (!formData.location) {
      return wx.showToast({ title: '请输入拍摄地点', icon: 'none' })
    }
    if (!formData.timeSlot) {
      return wx.showToast({ title: '请选择拍摄时间', icon: 'none' })
    }
    
    // 跳转到加载页
    wx.navigateTo({
      url: `/pages/loading/loading?data=${encodeURIComponent(JSON.stringify(formData))}`
    })
  },

  /**
   * 跳转到个人中心
   */
  goToProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' })
  },

  /**
   * 格式化日期
   */
  formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  formatDateCN(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`
  }
})