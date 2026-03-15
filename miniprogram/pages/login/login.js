/**
 * 拍照策划小程序 - 登录页
 */
const auth = require('../../utils/auth')
const util = require('../../utils/util')

Page({
  data: {
    avatarUrl: '',
    nickname: '',
    canSubmit: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查是否已登录
    if (auth.checkLogin()) {
      this.redirectToHome()
    }
  },

  /**
   * 选择头像
   */
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl
    })
    this.validateForm()
  },

  /**
   * 输入昵称
   */
  onNicknameInput(e) {
    const nickname = e.detail.value
    this.setData({ nickname })
    this.validateForm()
  },

  /**
   * 验证表单
   */
  validateForm() {
    const { avatarUrl, nickname } = this.data
    const canSubmit = avatarUrl && nickname.trim().length >= 2
    this.setData({ canSubmit })
  },

  /**
   * 微信一键登录
   */
  async handleWechatLogin() {
    try {
      util.showLoading('登录中...')
      
      // 获取微信 code
      const code = await auth.getWxCode()
      
      // 调用后端登录
      const result = await auth.doLogin('', '')
      
      util.hideLoading()
      util.showToast('登录成功')
      
      // 跳转首页
      setTimeout(() => {
        this.redirectToHome()
      }, 1000)
    } catch (error) {
      util.hideLoading()
      util.showToast(error.message || '登录失败')
    }
  },

  /**
   * 提交登录
   */
  async handleSubmit() {
    if (!this.data.canSubmit) return
    
    try {
      util.showLoading('登录中...')
      
      const { nickname, avatarUrl } = this.data
      
      // 执行登录
      const result = await auth.doLogin(nickname, avatarUrl)
      
      util.hideLoading()
      util.showToast('登录成功')
      
      // 跳转首页
      setTimeout(() => {
        this.redirectToHome()
      }, 1000)
    } catch (error) {
      util.hideLoading()
      util.showToast(error.message || '登录失败')
    }
  },

  /**
   * 显示用户协议
   */
  showAgreement() {
    util.showToast('用户协议')
  },

  /**
   * 显示隐私政策
   */
  showPrivacy() {
    util.showToast('隐私政策')
  },

  /**
   * 跳转首页
   */
  redirectToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})