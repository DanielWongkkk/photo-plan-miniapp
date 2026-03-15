/**
 * 拍照策划小程序 - 加载页
 */
const api = require('../../utils/api')

Page({
  data: {
    progress: 0,
    remainingTime: 15,
    animating: true,
    steps: [
      { text: '分析拍摄场景', done: false, current: false },
      { text: '匹配设备参数', done: false, current: false },
      { text: '搜索参考样片', done: false, current: false },
      { text: '生成拍摄清单', done: false, current: false }
    ],
    requestData: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取请求数据
    if (options.data) {
      const requestData = JSON.parse(decodeURIComponent(options.data))
      this.setData({ requestData })
      this.startGenerate()
    }
  },

  /**
   * 开始生成
   */
  async startGenerate() {
    const { steps } = this.data
    
    try {
      // 模拟进度更新
      for (let i = 0; i < steps.length; i++) {
        // 更新当前步骤
        steps[i].current = true
        this.setData({ steps })
        
        // 更新进度
        const targetProgress = ((i + 1) / steps.length) * 100
        await this.animateProgress(targetProgress)
        
        // 完成当前步骤
        steps[i].done = true
        steps[i].current = false
        this.setData({ steps })
        
        // 更新剩余时间
        this.setData({
          remainingTime: Math.max(0, 15 - (i + 1) * 4)
        })
      }
      
      // 调用后端 API 生成策划
      const result = await this.callGenerateAPI()
      
      // 跳转到结果页
      wx.redirectTo({
        url: `/pages/result/result?id=${result.id}`
      })
    } catch (error) {
      console.error('生成失败:', error)
      wx.showModal({
        title: '生成失败',
        content: error.message || 'AI 服务暂时不可用，请稍后重试',
        confirmText: '重试',
        cancelText: '返回',
        success(res) {
          if (res.confirm) {
            // 重试
            wx.navigateBack()
          } else {
            wx.navigateBack()
          }
        }
      })
    }
  },

  /**
   * 动画更新进度
   */
  animateProgress(target) {
    return new Promise(resolve => {
      const current = this.data.progress
      const step = (target - current) / 20
      let count = 0
      
      const timer = setInterval(() => {
        const newProgress = Math.min(this.data.progress + step, target)
        this.setData({ progress: Math.round(newProgress) })
        
        count++
        if (count >= 20) {
          clearInterval(timer)
          resolve()
        }
      }, 50)
    })
  },

  /**
   * 调用生成 API
   */
  async callGenerateAPI() {
    try {
      const result = await api.generatePlan(this.data.requestData)
      return result
    } catch (error) {
      // 返回模拟数据用于测试
      return {
        id: 'plan_' + Date.now(),
        ...this.getMockResult()
      }
    }
  },

  /**
   * 获取模拟结果
   */
  getMockResult() {
    return {
      summary: '杭州西湖人像拍摄策划',
      weather: {
        condition: '晴',
        temperature: 22,
        suggestion: '光线柔和，适合逆光拍摄'
      },
      bestSpots: [
        { name: '断桥残雪', description: '经典取景点，适合全景和中景', bestTime: '下午 4-6 点' },
        { name: '苏堤春晓', description: '柳树倒影，适合侧逆光人像', bestTime: '傍晚 5-7 点' }
      ],
      equipmentConfig: {
        lens: '35mm F1.4',
        aperture: 'F1.4 - F2.8',
        shutter: '1/500s 以上',
        iso: '100-400',
        filters: '可选 CPL 滤镜增强天空'
      },
      shotList: [
        {
          order: 1,
          name: '断桥全景人像',
          shotType: '全景',
          composition: '以断桥和西湖为背景，人物居中偏右',
          angle: '平视或略低角度',
          params: 'F2.8, 1/500s, ISO 100',
          tips: '利用桥洞形成自然框架',
          sampleUrl: ''
        },
        {
          order: 2,
          name: '柳树下侧逆光',
          shotType: '中景',
          composition: '三分法，人物在右侧三分之一处',
          angle: '侧逆光角度',
          params: 'F1.8, 1/640s, ISO 100',
          tips: '阳光透过柳叶形成光斑效果',
          sampleUrl: ''
        }
      ],
      samples: [],
      postProcessing: {
        style: '日系清新',
        suggestion: '低对比度，略带青色调，肤色偏暖'
      }
    }
  },

  /**
   * 取消生成
   */
  cancelGenerate() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消生成吗？',
      confirmColor: '#FF6B35',
      success(res) {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  }
})