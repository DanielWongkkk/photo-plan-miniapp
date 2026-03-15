/**
 * 微信登录逻辑
 */
const api = require('./api')

/**
 * 获取微信登录 code
 */
function getWxCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) {
          resolve(res.code)
        } else {
          reject(new Error('获取登录凭证失败'))
        }
      },
      fail(err) {
        reject(new Error('微信登录失败'))
      }
    })
  })
}

/**
 * 选择头像
 * 使用微信新版头像选择能力
 */
function chooseAvatar() {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath
        resolve(tempFilePath)
      },
      fail(err) {
        reject(new Error('选择头像失败'))
      }
    })
  })
}

/**
 * 上传头像到服务器
 * @param {string} filePath 本地文件路径
 */
function uploadAvatar(filePath) {
  return new Promise((resolve, reject) => {
    const app = getApp()
    
    wx.uploadFile({
      url: `${app.globalData.baseUrl}/user/avatar`,
      filePath,
      name: 'avatar',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success(res) {
        const data = JSON.parse(res.data)
        if (data.code === 0) {
          resolve(data.data.url)
        } else {
          reject(new Error(data.message || '上传失败'))
        }
      },
      fail(err) {
        reject(new Error('上传头像失败'))
      }
    })
  })
}

/**
 * 完整登录流程
 * @param {string} nickname 用户昵称
 * @param {string} avatarUrl 头像 URL（可选）
 */
async function doLogin(nickname, avatarUrl) {
  try {
    // 1. 获取微信登录 code
    const code = await getWxCode()
    
    // 2. 调用后端登录接口
    const result = await api.wechatLogin(code, nickname, avatarUrl)
    
    // 3. 保存登录状态
    const app = getApp()
    app.globalData.token = result.token
    app.globalData.userInfo = result.user
    
    wx.setStorageSync('token', result.token)
    wx.setStorageSync('userInfo', result.user)
    
    return result
  } catch (error) {
    throw error
  }
}

/**
 * 检查登录状态
 */
function checkLogin() {
  const app = getApp()
  return !!(app.globalData.token && app.globalData.userInfo)
}

/**
 * 退出登录
 */
function logout() {
  const app = getApp()
  app.logout()
}

module.exports = {
  getWxCode,
  chooseAvatar,
  uploadAvatar,
  doLogin,
  checkLogin,
  logout
}