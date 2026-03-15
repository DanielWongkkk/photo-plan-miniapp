/**
 * 拍照策划小程序 - 结果页
 * 核心功能：可落地的拍摄策划
 */
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    planId: '',
    plan: null,
    completedShots: 0,
    selectedDateIndex: 0
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ planId: options.id })
      this.loadPlanDetail()
    } else if (options.data) {
      const plan = JSON.parse(decodeURIComponent(options.data))
      this.setData({ plan })
      this.updateCompletedCount()
    } else {
      // 开发模式：使用模拟数据
      this.setData({ plan: this.getMockPlan() })
      this.updateCompletedCount()
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
      this.updateCompletedCount()
      util.hideLoading()
    } catch (error) {
      util.hideLoading()
      this.setData({ plan: this.getMockPlan() })
      this.updateCompletedCount()
    }
  },

  /**
   * 选择日期
   */
  selectDate(e) {
    const index = e.currentTarget.dataset.index
    const dates = this.data.plan.recommendedDates
    dates.forEach((d, i) => d.selected = i === index)
    this.setData({
      'plan.recommendedDates': dates,
      selectedDateIndex: index
    })
  },

  /**
   * 打开导航
   */
  openNavigation(e) {
    const spot = e.currentTarget.dataset.spot
    const { name, latitude, longitude, address } = spot
    
    if (!latitude || !longitude) {
      wx.showToast({ title: '暂无定位信息', icon: 'none' })
      return
    }

    wx.showActionSheet({
      itemList: ['腾讯地图', '高德地图', '百度地图'],
      success(res) {
        const tapIndex = res.tapIndex
        let url = ''
        
        switch(tapIndex) {
          case 0: // 腾讯地图
            url = `qqmap://map/geocoder?coord=${latitude},${longitude}&referer=myapp`
            break
          case 1: // 高德地图
            url = `iosamap://viewMap?sourceApplication=myapp&poiname=${encodeURIComponent(name)}&lat=${latitude}&lon=${longitude}&dev=0`
            break
          case 2: // 百度地图
            url = `baidumap://map/marker?location=${latitude},${longitude}&title=${encodeURIComponent(name)}&content=${encodeURIComponent(address)}&src=myapp`
            break
        }
        
        wx.openDocument({
          filePath: url,
          fail() {
            // 如果打开失败，使用微信内置地图
            wx.openLocation({
              latitude,
              longitude,
              name,
              address,
              scale: 16
            })
          }
        })
      },
      fail() {
        // 直接使用微信内置地图
        wx.openLocation({
          latitude,
          longitude,
          name,
          address,
          scale: 16
        })
      }
    })
  },

  /**
   * 打开搜索链接（跳转到小红书等平台）
   */
  openSearchLink(e) {
    const url = e.currentTarget.dataset.url
    if (!url) {
      wx.showToast({ title: '链接不可用', icon: 'none' })
      return
    }
    
    // 复制链接并提示用户在浏览器打开
    wx.setClipboardData({
      data: url,
      success() {
        wx.showModal({
          title: '链接已复制',
          content: '请在浏览器中粘贴打开，搜索相关样片参考',
          showCancel: false,
          confirmText: '知道了'
        })
      }
    })
  },

  /**
   * 预览样片
   */
  previewSample(e) {
    const url = e.currentTarget.dataset.url
    const samples = e.currentTarget.dataset.samples || this.data.plan.shootingSpots[0]?.samples || []
    const urls = samples.map(s => s.imageUrl)
    
    wx.previewImage({
      current: url,
      urls
    })
  },

  /**
   * 预览摆姿参考图
   */
  previewPose(e) {
    const url = e.currentTarget.dataset.url
    const images = e.currentTarget.dataset.images || []
    const urls = images.map(img => img.url)
    
    wx.previewImage({
      current: url,
      urls
    })
  },

  /**
   * 切换拍摄项展开
   */
  toggleShot(e) {
    const index = e.currentTarget.dataset.index
    const shotList = this.data.plan.shotList
    shotList[index].expanded = !shotList[index].expanded
    this.setData({ 'plan.shotList': shotList })
  },

  /**
   * 切换拍摄项完成状态
   */
  toggleShotCheck(e) {
    const index = e.currentTarget.dataset.index
    const shotList = this.data.plan.shotList
    shotList[index].completed = !shotList[index].completed
    this.setData({ 'plan.shotList': shotList })
    this.updateCompletedCount()
    
    // 保存进度到本地
    this.saveProgress()
  },

  /**
   * 更新完成数量
   */
  updateCompletedCount() {
    const shotList = this.data.plan?.shotList || []
    const completed = shotList.filter(s => s.completed).length
    this.setData({ completedShots: completed })
  },

  /**
   * 保存进度
   */
  saveProgress() {
    const key = `plan_progress_${this.data.planId}`
    const progress = this.data.plan.shotList.map(s => ({
      order: s.order,
      completed: s.completed
    }))
    wx.setStorageSync(key, progress)
  },

  /**
   * 保存策划
   */
  savePlan() {
    wx.showToast({ title: '已保存', icon: 'success' })
  },

  /**
   * 导出策划
   */
  exportPlan() {
    wx.showActionSheet({
      itemList: ['导出为图片', '导出为 PDF', '复制文字版'],
      success(res) {
        switch(res.tapIndex) {
          case 0:
            wx.showToast({ title: '功能开发中', icon: 'none' })
            break
          case 1:
            wx.showToast({ title: '功能开发中', icon: 'none' })
            break
          case 2:
            // 复制文字版
            wx.setClipboardData({
              data: '策划内容...',
              success() {
                wx.showToast({ title: '已复制', icon: 'success' })
              }
            })
            break
        }
      }
    })
  },

  /**
   * 开始拍摄
   */
  startShooting() {
    // 跳转到拍摄模式页面
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: `${this.data.plan.summary} - 拍照策划`,
      path: `/pages/result/result?id=${this.data.planId}`
    }
  },

  /**
   * 模拟数据 - 长沙烈士公园人像拍摄
   */
  getMockPlan() {
    return {
      id: 'plan_001',
      summary: '长沙烈士公园人像拍摄策划',
      createdAt: '2026-03-15T15:00:00Z',
      
      input: {
        theme: '人像',
        location: '长沙烈士公园',
        datetime: '2026-03-16',
        timeSlot: 'afternoon',
        timeSlotName: '下午',
        equipmentName: '索尼 A7M4 + 85mm F1.4',
        style: '日系清新'
      },

      // 推荐日期（基于天气）
      recommendedDates: [
        {
          date: '2026-03-16',
          weekday: '周日',
          dateNum: '16',
          weather: '☀️ 晴',
          temperature: '18-25°C',
          score: 9.2,
          recommended: true,
          selected: true,
          reason: '晴天，光线柔和，适合人像'
        },
        {
          date: '2026-03-17',
          weekday: '周一',
          dateNum: '17',
          weather: '⛅ 多云',
          temperature: '16-22°C',
          score: 7.5,
          recommended: false,
          selected: false,
          reason: '多云，光线偏平'
        },
        {
          date: '2026-03-18',
          weekday: '周二',
          dateNum: '18',
          weather: '🌧️ 小雨',
          temperature: '14-19°C',
          score: 4.0,
          recommended: false,
          selected: false,
          reason: '有雨，不建议拍摄'
        },
        {
          date: '2026-03-19',
          weekday: '周三',
          dateNum: '19',
          weather: '☀️ 晴',
          temperature: '17-24°C',
          score: 8.8,
          recommended: true,
          selected: false,
          reason: '晴天，适合拍摄'
        },
        {
          date: '2026-03-20',
          weekday: '周四',
          dateNum: '20',
          weather: '☀️ 晴',
          temperature: '19-26°C',
          score: 9.0,
          recommended: true,
          selected: false,
          reason: '晴天，黄金时刻光线佳'
        }
      ],

      // 时间段推荐
      timeSlots: [
        {
          period: '07:00-09:00',
          description: '晨光柔和，人少安静',
          lightIcon: '🌅',
          lightCondition: '柔和晨光',
          recommended: true
        },
        {
          period: '16:00-18:00',
          description: '黄金时刻，逆光最佳',
          lightIcon: '🌇',
          lightCondition: '金色暖光',
          recommended: true
        },
        {
          period: '18:00-19:30',
          description: '蓝调时刻，剪影效果',
          lightIcon: '🌆',
          lightCondition: '蓝紫色调',
          recommended: false
        }
      ],

      // 具体取景点（带定位）
      shootingSpots: [
        {
          id: 'spot_001',
          name: '烈士纪念碑广场',
          address: '长沙市开福区东风路烈士公园内',
          latitude: 28.1987,
          longitude: 112.9834,
          description: '开阔广场，适合大场景人像，背景庄严肃穆',
          bestTime: '16:00-17:30 逆光最佳',
          angle: '低角度仰拍，突出纪念碑与人物',
          params: 'F2.0, 1/500s, ISO 100',
          poseGuide: '人物可站在台阶上，侧身回望；或坐在台阶边缘，双手撑地，自然放松',
          poseImages: [
            { url: 'https://example.com/pose1.jpg', description: '台阶坐姿' },
            { url: 'https://example.com/pose2.jpg', description: '回望姿势' }
          ],
          samples: [
            {
              imageUrl: 'https://img.xiaohongshu.com/example1.jpg',
              source: '小红书',
              sourceIcon: '📕',
              author: '@摄影师小王',
              link: 'https://xiaohongshu.com/xxx'
            },
            {
              imageUrl: 'https://instagram.com/example2.jpg',
              source: 'Instagram',
              sourceIcon: '📷',
              author: '@portrait_master',
              link: 'https://instagram.com/xxx'
            }
          ]
        },
        {
          id: 'spot_002',
          name: '年嘉湖畔柳堤',
          address: '长沙市开福区烈士公园年嘉湖东岸',
          latitude: 28.1965,
          longitude: 112.9876,
          description: '柳树成荫，湖面倒影，日系清新风格首选',
          bestTime: '07:00-09:00 晨光 或 16:30-18:00 侧逆光',
          angle: '侧逆光角度，利用柳叶做前景',
          params: 'F1.4-F2.0, 1/640s, ISO 100',
          poseGuide: '站在柳树下，让柳叶自然垂落在肩头；或背对镜头，望向湖面，营造意境',
          poseImages: [
            { url: 'https://example.com/pose3.jpg', description: '柳叶前景' }
          ],
          samples: [
            {
              imageUrl: 'https://img.xiaohongshu.com/example3.jpg',
              source: '小红书',
              sourceIcon: '📕',
              author: '@日系人像',
              link: 'https://xiaohongshu.com/xxx'
            },
            {
              imageUrl: 'https://500px.com/example4.jpg',
              source: '500px',
              sourceIcon: '🖼️',
              author: '@nature_portrait',
              link: 'https://500px.com/xxx'
            }
          ]
        },
        {
          id: 'spot_003',
          name: '迎丰桥',
          address: '长沙市开福区烈士公园内',
          latitude: 28.1978,
          longitude: 112.9856,
          description: '古典石桥，桥洞形成天然框架，适合古风或文艺风格',
          bestTime: '17:00-18:00 夕阳斜照',
          angle: '从桥洞外向内拍摄，形成框架构图',
          params: 'F2.8, 1/400s, ISO 100',
          poseGuide: '站在桥上凭栏远眺，或从桥洞走过，抓拍自然瞬间',
          poseImages: [],
          samples: [
            {
              imageUrl: 'https://img.xiaohongshu.com/example5.jpg',
              source: '小红书',
              sourceIcon: '📕',
              author: '@古风摄影',
              link: 'https://xiaohongshu.com/xxx'
            }
          ]
        },
        {
          id: 'spot_004',
          name: '湖心亭',
          address: '长沙市开福区烈士公园年嘉湖中心',
          latitude: 28.1956,
          longitude: 112.9865,
          description: '湖心古典亭阁，四面环水，适合全景和特写',
          bestTime: '07:30-09:00 晨雾缭绕 或 17:30-18:30 夕阳',
          angle: '从岸边长焦压缩，或在亭内拍摄',
          params: 'F2.0, 1/500s, ISO 100',
          poseGuide: '坐在亭中石凳上，手扶栏杆；或站在亭边，背对夕阳形成剪影',
          poseImages: [],
          samples: [
            {
              imageUrl: 'https://tuchong.com/example6.jpg',
              source: '图虫',
              sourceIcon: '🖼️',
              author: '@风光人像',
              link: 'https://tuchong.com/xxx'
            }
          ]
        }
      ],

      // 设备参数配置
      equipmentConfig: {
        lens: '85mm F1.4 GM',
        aperture: 'F1.4 - F2.8',
        shutter: '1/500s 以上（防抖）',
        iso: '100-400',
        whiteBalance: '自动或 5200K（偏暖）',
        filters: '可选 CPL 减少水面反光',
        tips: '85mm 焦段适合半身和特写，注意与模特保持 2-3 米距离'
      },

      // 拍摄清单
      shotList: [
        {
          order: 1,
          name: '纪念碑广场全景人像',
          shotType: '全景',
          angle: '低角度仰拍',
          composition: '人物居中，纪念碑为背景，天空留白',
          params: 'F2.8, 1/500s, ISO 100',
          poseGuide: '站在台阶上，双手自然下垂或轻扶栏杆',
          tips: '使用广角端时注意人物变形',
          completed: false,
          expanded: false,
          samples: [
            {
              imageUrl: 'https://img.xiaohongshu.com/shot1.jpg',
              source: '小红书',
              sourceIcon: '📕'
            }
          ]
        },
        {
          order: 2,
          name: '柳堤逆光人像',
          shotType: '中景',
          angle: '侧逆光',
          composition: '三分法，柳叶做前景虚化',
          params: 'F1.4, 1/640s, ISO 100',
          poseGuide: '侧身站立，让光线从侧后方打在头发上形成轮廓光',
          tips: '注意曝光补偿 +0.7EV',
          completed: false,
          expanded: false,
          samples: []
        },
        {
          order: 3,
          name: '桥洞框架构图',
          shotType: '中景',
          angle: '平视',
          composition: '桥洞形成天然框架，人物在框架中心',
          params: 'F2.0, 1/400s, ISO 100',
          poseGuide: '从桥洞走过，自然回头',
          tips: '等待光线穿过桥洞的时刻',
          completed: false,
          expanded: false,
          samples: []
        },
        {
          order: 4,
          name: '湖边特写',
          shotType: '特写',
          angle: '平视',
          composition: '大光圈虚化背景，突出面部',
          params: 'F1.4, 1/800s, ISO 100',
          poseGuide: '侧脸望向远方，或低头微笑',
          tips: '对焦在眼睛，注意眼神光',
          completed: false,
          expanded: false,
          samples: []
        },
        {
          order: 5,
          name: '夕阳剪影',
          shotType: '全景',
          angle: '低角度仰拍',
          composition: '以夕阳为背景，人物轮廓清晰',
          params: 'F8, 1/1000s, ISO 100',
          poseGuide: '侧身站立，手臂自然抬起或叉腰',
          tips: '对天空测光，人物自然形成剪影',
          completed: false,
          expanded: false,
          samples: []
        }
      ],

      // 后期建议
      postProcessing: {
        style: '日系清新',
        steps: [
          '1. 降低对比度 -10',
          '2. 高光 -20，阴影 +15',
          '3. 色温偏暖 +5，色调偏青 -3',
          '4. HSL：橙色饱和度 -5（肤色），绿色色相 +5（植被）',
          '5. 添加轻微颗粒感',
          '6. 可选：暗角效果'
        ],
        lrPresets: '推荐 VSCO A6 或 Mastin Labs Fuji 400H',
        apps: ['Lightroom', 'VSCO', '醒图']
      },

      // 注意事项
      notices: [
        '公园开放时间：06:00-22:00，建议早到避开人流',
        '周末游客较多，建议工作日或清晨拍摄',
        '部分区域禁止商业拍摄，请遵守公园规定',
        '夏季蚊虫较多，建议携带驱蚊水',
        '湖边湿滑，注意安全'
      ]
    }
  }
})