/**
 * 拍照策划小程序 - 应用入口
 */
App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'https://api.example.com/api' // 替换为实际服务器地址
  },

  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus()
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    
    if (token && userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      
      // 验证 token 是否有效
      this.validateToken()
    }
  },

  /**
   * 验证 token 有效性
   */
  async validateToken() {
    try {
      const res = await wx.request({
        url: `${this.globalData.baseUrl}/auth/validate`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${this.globalData.token}`
        }
      })
      
      if (res.data.code !== 0) {
        // token 无效，清除登录状态
        this.logout()
      }
    } catch (error) {
      console.error('验证 token 失败:', error)
    }
  },

  /**
   * 登出
   */
  logout() {
    this.globalData.token = null
    this.globalData.userInfo = null
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
  },

  /**
   * 检查是否需要登录
   */
  requireLogin() {
    return new Promise((resolve, reject) => {
      if (this.globalData.token && this.globalData.userInfo) {
        resolve(this.globalData.userInfo)
      } else {
        reject(new Error('请先登录'))
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }
    })
  }
})