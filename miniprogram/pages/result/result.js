/**
 * 拍照策划小程序 - 结果页
 */
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    planId: '',
    plan: null,
    allExpanded: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ planId: options.id })
      this.loadPlanDetail()
    } else if (options.data) {
      // 从加载页传递的数据
      const plan = JSON.parse(decodeURIComponent(options.data))
      this.setData({ plan })
    }
  },

  /**
   * 加载策划详情
   */
  async loadPlanDetail() {
    try {
      util.showLoading('加载中...')
      const plan = await api.getPlanDetail(this.data.planId)
      this.setData({ plan })
      util.hideLoading()
    } catch (error) {
      util.hideLoading()
      // 使用模拟数据
      this.setData({
        plan: this.getMockPlan()
      })
    }
  },

  /**
   * 获取模拟数据
   */
  getMockPlan() {
    return {
      id: this.data.planId,
      summary: '杭州西湖人像拍摄策划',
      input: {
        theme: '人像',
        location: '杭州西湖',
        datetime: '2026-03-20',
        timeSlot: 'afternoon',
        timeSlotName: '下午',
        equipmentName: '索尼 A7M4 + 35mm F1.4'
      },
      weather: {
        condition: '晴',
        temperature: 22,
        suggestion: '光线柔和，适合逆光拍摄'
      },
      bestSpots: [
        {
          name: '断桥残雪',
          description: '经典取景点，适合全景和中景',
          bestTime: '下午 4-6 点'
        },
        {
          name: '苏堤春晓',
          description: '柳树倒影，适合侧逆光人像',
          bestTime: '傍晚 5-7 点'
        },
        {
          name: '雷峰塔',
          description: '夕阳西下时最佳',
          bestTime: '傍晚 6-7 点'
        }
      ],
      equipmentConfig: {
        lens: '35mm F1.4',
        aperture: 'F1.4 - F2.8',
        shutter: '1/500s 以上',
        iso: '100-400',
        filters: '可选 CPL 滤镜'
      },
      shotList: [
        {
          order: 1,
          name: '断桥全景人像',
          shotType: '全景',
          composition: '以断桥和西湖为背景，人物居中偏右',
          angle: '平视或略低角度',
          params: 'F2.8, 1/500s, ISO 100',
          tips: '利用桥洞形成自然框架，注意人物与背景的距离',
          expanded: false
        },
        {
          order: 2,
          name: '柳树下侧逆光',
          shotType: '中景',
          composition: '三分法，人物在右侧三分之一处',
          angle: '侧逆光角度',
          params: 'F1.8, 1/640s, ISO 100',
          tips: '阳光透过柳叶形成光斑效果',
          expanded: false
        },
        {
          order: 3,
          name: '湖边特写',
          shotType: '特写',
          composition: '虚化背景，突出人物表情',
          angle: '平视',
          params: 'F1.4, 1/800s, ISO 100',
          tips: '使用大光圈创造浅景深',
          expanded: false
        },
        {
          order: 4,
          name: '夕阳剪影',
          shotType: '全景',
          composition: '以夕阳为背景，人物轮廓清晰',
          angle: '低角度仰拍',
          params: 'F8, 1/1000s, ISO 100',
          tips: '逆光拍摄，注意测光位置',
          expanded: false
        }
      ],
      samples: [],
      postProcessing: {
        style: '日系清新',
        suggestion: '低对比度，略带青色调，肤色偏暖，可选轻微胶片感'
      }
    }
  },

  /**
   * 切换单个拍摄项展开
   */
  toggleShot(e) {
    const index = e.currentTarget.dataset.index
    const shotList = this.data.plan.shotList
    shotList[index].expanded = !shotList[index].expanded
    this.setData({
      'plan.shotList': shotList
    })
  },

  /**
   * 展开/收起全部
   */
  toggleAllShots() {
    const allExpanded = !this.data.allExpanded
    const shotList = this.data.plan.shotList.map(shot => ({
      ...shot,
      expanded: allExpanded
    }))
    this.setData({
      allExpanded,
      'plan.shotList': shotList
    })
  },

  /**
   * 预览样片
   */
  previewSample(e) {
    const url = e.currentTarget.dataset.url
    const urls = this.data.plan.samples.map(s => s.imageUrl)
    wx.previewImage({
      current: url,
      urls
    })
  },

  /**
   * 重新生成
   */
  regenerate() {
    wx.showModal({
      title: '确认重新生成',
      content: '重新生成将覆盖当前策划，确定继续吗？',
      confirmColor: '#FF6B35',
      success(res) {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  },

  /**
   * 分享策划
   */
  sharePlan() {
    // 触发分享
  },

  /**
   * 分享给朋友
   */
  onShareAppMessage() {
    return {
      title: `${this.data.plan.summary} - 拍照策划`,
      path: `/pages/result/result?id=${this.data.planId}`,
      imageUrl: '' // 可以设置分享图片
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: `${this.data.plan.summary} - 拍照策划`,
      query: `id=${this.data.planId}`
    }
  }
})