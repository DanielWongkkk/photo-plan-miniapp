/**
 * 工具函数
 */

/**
 * 格式化日期
 * @param {Date|string|number} date 日期
 * @param {string} format 格式
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化相对时间
 * @param {Date|string|number} date 日期
 */
function formatRelativeTime(date) {
  const now = new Date()
  const d = new Date(date)
  const diff = now - d
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  
  return formatDate(date, 'MM-DD')
}

/**
 * 显示 Toast
 * @param {string} title 提示文字
 * @param {string} icon 图标类型
 */
function showToast(title, icon = 'none') {
  wx.showToast({
    title,
    icon,
    duration: 2000
  })
}

/**
 * 显示 Loading
 * @param {string} title 提示文字
 */
function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  })
}

/**
 * 隐藏 Loading
 */
function hideLoading() {
  wx.hideLoading()
}

/**
 * 显示确认弹窗
 * @param {string} title 标题
 * @param {string} content 内容
 */
function showConfirm(title, content) {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      confirmColor: '#FF6B35',
      success(res) {
        if (res.confirm) {
          resolve(true)
        } else {
          resolve(false)
        }
      },
      fail: reject
    })
  })
}

/**
 * 防抖函数
 * @param {Function} fn 目标函数
 * @param {number} delay 延迟时间
 */
function debounce(fn, delay = 300) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn 目标函数
 * @param {number} interval 间隔时间
 */
function throttle(fn, interval = 300) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * 深拷贝
 * @param {*} obj 目标对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item))
  }
  
  const clone = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key])
    }
  }
  return clone
}

/**
 * 拍摄主题列表
 */
const THEMES = [
  { id: 'portrait', name: '人像', icon: '👤' },
  { id: 'landscape', name: '风景', icon: '🏔️' },
  { id: 'street', name: '街拍', icon: '🏙️' },
  { id: 'food', name: '美食', icon: '🍜' },
  { id: 'pet', name: '宠物', icon: '🐱' },
  { id: 'wedding', name: '婚礼', icon: '💒' },
  { id: 'graduation', name: '毕业', icon: '🎓' },
  { id: 'other', name: '其他', icon: '✨' }
]

/**
 * 拍摄时段列表
 */
const TIME_SLOTS = [
  { id: 'morning', name: '上午', time: '06:00-12:00' },
  { id: 'afternoon', name: '下午', time: '12:00-18:00' },
  { id: 'evening', name: '傍晚', time: '17:00-19:00' },
  { id: 'night', name: '夜晚', time: '19:00-23:00' }
]

/**
 * 风格偏好列表
 */
const STYLES = [
  '日系', '复古', '胶片', '清新', '暗调', '高对比', '电影感', '梦幻'
]

/**
 * 相机品牌列表
 */
const CAMERA_BRANDS = [
  { id: 'sony', name: '索尼 Sony' },
  { id: 'canon', name: '佳能 Canon' },
  { id: 'nikon', name: '尼康 Nikon' },
  { id: 'fuji', name: '富士 Fujifilm' },
  { id: 'panasonic', name: '松下 Panasonic' },
  { id: 'leica', name: '徕卡 Leica' },
  { id: 'other', name: '其他' }
]

/**
 * 画幅类型
 */
const SENSOR_TYPES = [
  { id: 'full_frame', name: '全画幅' },
  { id: 'aps_c', name: 'APS-C' },
  { id: 'm43', name: 'M4/3' },
  { id: 'medium', name: '中画幅' }
]

module.exports = {
  formatDate,
  formatRelativeTime,
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  debounce,
  throttle,
  deepClone,
  // 常量
  THEMES,
  TIME_SLOTS,
  STYLES,
  CAMERA_BRANDS,
  SENSOR_TYPES
}