/**
 * API 接口封装
 */
const app = getApp()

/**
 * 请求封装
 * @param {Object} options 请求配置
 * @returns {Promise} 请求结果
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data, header = {} } = options
    
    // 添加 token
    if (app.globalData.token) {
      header['Authorization'] = `Bearer ${app.globalData.token}`
    }
    
    wx.request({
      url: `${app.globalData.baseUrl}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success(res) {
        if (res.data.code === 0) {
          resolve(res.data.data)
        } else if (res.data.code === 1003) {
          // Token 过期，清除登录状态
          app.logout()
          wx.navigateTo({ url: '/pages/login/login' })
          reject(new Error('登录已过期，请重新登录'))
        } else {
          reject(new Error(res.data.message || '请求失败'))
        }
      },
      fail(err) {
        reject(new Error('网络异常，请检查网络连接'))
      }
    })
  })
}

/**
 * GET 请求
 */
function get(url, data = {}) {
  return request({ url, method: 'GET', data })
}

/**
 * POST 请求
 */
function post(url, data = {}) {
  return request({ url, method: 'POST', data })
}

/**
 * PUT 请求
 */
function put(url, data = {}) {
  return request({ url, method: 'PUT', data })
}

/**
 * DELETE 请求
 */
function del(url, data = {}) {
  return request({ url, method: 'DELETE', data })
}

// ==================== 认证接口 ====================

/**
 * 微信登录
 * @param {string} code wx.login 返回的 code
 * @param {string} nickname 用户昵称
 * @param {string} avatar 用户头像 URL
 */
function wechatLogin(code, nickname, avatar) {
  return post('/auth/wechat-login', { code, nickname, avatar })
}

/**
 * 刷新 Token
 */
function refreshToken() {
  return post('/auth/refresh-token')
}

/**
 * 获取用户信息
 */
function getUserInfo() {
  return get('/auth/me')
}

// ==================== 用户接口 ====================

/**
 * 更新用户资料
 */
function updateProfile(data) {
  return put('/user/profile', data)
}

/**
 * 添加设备
 */
function addEquipment(data) {
  return post('/user/equipment', data)
}

/**
 * 更新设备
 */
function updateEquipment(id, data) {
  return put(`/user/equipment/${id}`, data)
}

/**
 * 删除设备
 */
function deleteEquipment(id) {
  return del(`/user/equipment/${id}`)
}

/**
 * 设置默认设备
 */
function setDefaultEquipment(id) {
  return put(`/user/equipment/${id}/default`)
}

// ==================== 策划接口 ====================

/**
 * 生成策划
 */
function generatePlan(data) {
  return post('/plan/generate', data)
}

/**
 * 获取策划详情
 */
function getPlanDetail(id) {
  return get(`/plan/${id}`)
}

/**
 * 获取历史策划列表
 */
function getPlanHistory(page = 1, pageSize = 10) {
  return get('/plan/history', { page, pageSize })
}

/**
 * 删除策划
 */
function deletePlan(id) {
  return del(`/plan/${id}`)
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  // 认证
  wechatLogin,
  refreshToken,
  getUserInfo,
  // 用户
  updateProfile,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  setDefaultEquipment,
  // 策划
  generatePlan,
  getPlanDetail,
  getPlanHistory,
  deletePlan
}