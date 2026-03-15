/**
 * 拍照策划小程序 - 个人中心
 */
const api = require('../../utils/api')
const util = require('../../utils/util')
const auth = require('../../utils/auth')

Page({
  data: {
    userInfo: {},
    equipments: [],
    recentPlans: [],
    usageCount: 0,
    totalPlans: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadUserData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadUserData()
  },

  /**
   * 加载用户数据
   */
  async loadUserData() {
    try {
      const userInfo = await api.getUserInfo()
      
      this.setData({
        userInfo,
        equipments: userInfo.equipments || [],
        usageCount: userInfo.usageCount || 0,
        totalPlans: userInfo.totalPlans || 0
      })
      
      // 加载最近的策划记录
      this.loadRecentPlans()
    } catch (error) {
      // 使用本地存储的用户信息
      const localUserInfo = wx.getStorageSync('userInfo') || {}
      this.setData({
        userInfo: localUserInfo,
        equipments: this.getMockEquipments()
      })
    }
  },

  /**
   * 加载最近的策划记录
   */
  async loadRecentPlans() {
    try {
      const result = await api.getPlanHistory(1, 3)
      this.setData({
        recentPlans: result.list || []
      })
    } catch (error) {
      // 使用模拟数据
      this.setData({
        recentPlans: this.getMockPlans()
      })
    }
  },

  /**
   * 获取模拟设备数据
   */
  getMockEquipments() {
    return [
      {
        id: 'eq_001',
        name: '索尼 A7M4 + 35mm F1.4',
        camera: { brand: 'Sony', model: 'A7M4', type: '全画幅' },
        lens: { brand: 'Sony', model: '35mm F1.4 GM', focalLength: 35, maxAperture: 1.4 },
        isDefault: true
      },
      {
        id: 'eq_002',
        name: '富士 X-T5 + 23mm F2',
        camera: { brand: 'Fujifilm', model: 'X-T5', type: 'APS-C' },
        lens: { brand: 'Fujifilm', model: '23mm F2', focalLength: 23, maxAperture: 2 },
        isDefault: false
      }
    ]
  },

  /**
   * 获取模拟策划数据
   */
  getMockPlans() {
    return [
      {
        id: 'plan_001',
        theme: '人像',
        location: '杭州西湖',
        date: '3月15日',
        thumbnail: ''
      },
      {
        id: 'plan_002',
        theme: '夜景',
        location: '上海外滩',
        date: '3月10日',
        thumbnail: ''
      }
    ]
  },

  /**
   * 跳转设备管理
   */
  goToEquipmentManage() {
    // TODO: 跳转到设备管理页
    util.showToast('设备管理')
  },

  /**
   * 编辑设备
   */
  editEquipment(e) {
    const id = e.currentTarget.dataset.id
    // TODO: 跳转到设备编辑页
    util.showToast('编辑设备')
  },

  /**
   * 添加设备
   */
  addEquipment() {
    // TODO: 跳转到添加设备页
    util.showToast('添加设备')
  },

  /**
   * 跳转历史记录
   */
  goToHistory() {
    // TODO: 跳转到历史记录页
    util.showToast('历史记录')
  },

  /**
   * 查看策划详情
   */
  viewPlan(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/result/result?id=${id}`
    })
  },

  /**
   * 编辑默认城市
   */
  editCity() {
    wx.showModal({
      title: '设置默认城市',
      editable: true,
      placeholderText: this.data.userInfo.city || '请输入城市名称',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await api.updateProfile({ city: res.content })
            this.setData({
              'userInfo.city': res.content
            })
            util.showToast('设置成功')
          } catch (error) {
            util.showToast('设置失败')
          }
        }
      }
    })
  },

  /**
   * 编辑风格偏好
   */
  editStyles() {
    // TODO: 跳转到风格选择页
    util.showToast('风格偏好设置')
  },

  /**
   * 显示关于我们
   */
  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: '拍照策划小程序\n版本：1.0.0\n一款专为摄影爱好者打造的拍照策划工具',
      showCancel: false
    })
  },

  /**
   * 清除缓存
   */
  clearCache() {
    wx.showModal({
      title: '确认清除',
      content: '清除缓存不会影响您的账号数据，确定要清除吗？',
      confirmColor: '#FF6B35',
      success(res) {
        if (res.confirm) {
          try {
            wx.clearStorageSync()
            util.showToast('清除成功')
          } catch (error) {
            util.showToast('清除失败')
          }
        }
      }
    })
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmColor: '#FF6B35',
      success(res) {
        if (res.confirm) {
          auth.logout()
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  }
})