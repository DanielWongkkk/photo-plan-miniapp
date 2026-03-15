/**
 * 拍照策划小程序 - 首页（输入表单）
 */
const util = require('../../utils/util')
const api = require('../../utils/api')

Page({
  data: {
    // 主题
    selectedTheme: null,
    
    // 地点
    location: '',
    recentLocations: ['杭州西湖', '上海外滩', '北京故宫'],
    
    // 时间
    date: '',
    timeSlot: '',
    timeSlotName: '',
    timeSlotIndex: 0,
    timeSlotOptions: util.TIME_SLOTS,
    today: '',
    
    // 设备
    equipments: [],
    selectedEquipmentId: null,
    
    // 风格
    styleOptions: util.STYLES.map(name => ({ name, selected: false })),
    
    // 备注
    notes: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initPage()
  },

  /**
   * 初始化页面
   */
  async initPage() {
    // 设置今天的日期
    const today = util.formatDate(new Date(), 'YYYY-MM-DD')
    this.setData({ today, date: today })
    
    // 加载用户设备
    await this.loadUserEquipments()
  },

  /**
   * 加载用户设备
   */
  async loadUserEquipments() {
    try {
      const userInfo = await api.getUserInfo()
      const equipments = userInfo.equipments || []
      
      // 找到默认设备
      const defaultEquipment = equipments.find(e => e.isDefault) || equipments[0]
      
      this.setData({
        equipments,
        selectedEquipmentId: defaultEquipment ? defaultEquipment.id : null
      })
    } catch (error) {
      console.error('加载设备失败:', error)
      // 使用模拟数据
      this.setData({
        equipments: [
          {
            id: 'eq_001',
            name: '索尼 A7M4 + 35mm F1.4',
            camera: { brand: 'Sony', model: 'A7M4' },
            lens: { focalLength: 35, maxAperture: 1.4 },
            isDefault: true
          }
        ],
        selectedEquipmentId: 'eq_001'
      })
    }
  },

  /**
   * 主题选择变化
   */
  onThemeChange(e) {
    this.setData({
      selectedTheme: e.detail
    })
  },

  /**
   * 地点输入
   */
  onLocationInput(e) {
    this.setData({
      location: e.detail.value
    })
  },

  /**
   * 清除地点
   */
  clearLocation() {
    this.setData({ location: '' })
  },

  /**
   * 选择最近地点
   */
  selectRecentLocation(e) {
    const location = e.currentTarget.dataset.location
    this.setData({ location })
  },

  /**
   * 显示日期选择器
   */
  showDatePicker() {
    // 微信小程序的 picker 需要通过点击触发
    // 这里通过 selectComponent 或其他方式触发
  },

  /**
   * 日期变化
   */
  onDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },

  /**
   * 显示时段选择器
   */
  showTimeSlotPicker() {
    // 同上
  },

  /**
   * 时段变化
   */
  onTimeSlotChange(e) {
    const index = e.detail.value
    const timeSlot = this.data.timeSlotOptions[index]
    this.setData({
      timeSlotIndex: index,
      timeSlot: timeSlot.id,
      timeSlotName: timeSlot.name
    })
  },

  /**
   * 设备选择变化
   */
  onEquipmentChange(e) {
    this.setData({
      selectedEquipmentId: e.detail
    })
  },

  /**
   * 添加设备
   */
  onAddEquipment() {
    wx.navigateTo({
      url: '/pages/profile/profile?tab=equipment'
    })
  },

  /**
   * 切换风格
   */
  toggleStyle(e) {
    const index = e.currentTarget.dataset.index
    const styleOptions = this.data.styleOptions
    styleOptions[index].selected = !styleOptions[index].selected
    this.setData({ styleOptions })
  },

  /**
   * 备注输入
   */
  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },

  /**
   * 生成策划
   */
  async generatePlan() {
    // 验证必填项
    const { selectedTheme, location, date, timeSlot, selectedEquipmentId } = this.data
    
    if (!selectedTheme) {
      return util.showToast('请选择拍摄主题')
    }
    if (!location) {
      return util.showToast('请输入拍摄地点')
    }
    if (!date) {
      return util.showToast('请选择拍摄日期')
    }
    if (!timeSlot) {
      return util.showToast('请选择拍摄时段')
    }
    if (!selectedEquipmentId) {
      return util.showToast('请选择拍摄设备')
    }
    
    // 收集选中的风格
    const selectedStyles = this.data.styleOptions
      .filter(s => s.selected)
      .map(s => s.name)
    
    // 构建请求数据
    const requestData = {
      theme: selectedTheme.name,
      location: this.data.location,
      datetime: this.data.date,
      timeSlot: this.data.timeSlot,
      equipmentId: this.data.selectedEquipmentId,
      styles: selectedStyles,
      notes: this.data.notes
    }
    
    // 跳转到加载页
    wx.navigateTo({
      url: `/pages/loading/loading?data=${encodeURIComponent(JSON.stringify(requestData))}`
    })
  }
})