import request from '@/utils/request'
import { ElMessage } from 'element-plus'

// 登录接口
export function login(data) {
  // 先检查用户名和密码是否为空
  if (!data.username || !data.password) {
    // 先显示消息
    ElMessage({
      message: '用户名和密码不能为空',
      type: 'error',
      duration: 2000
    })
    // 然后再返回 Promise.reject
    return Promise.reject(new Error('用户名和密码不能为空'))
  }

  // 先获取管理员列表
  return request({
    url: '/admins',
    method: 'get',
    headers: {
      noToken: true
    }
  }).then(admins => {
    // 查找匹配的管理员
    const admin = admins.find(
      admin => admin.username === data.username && admin.password === data.password
    )

    if (admin) {
      // 登录成功
      ElMessage({
        message: '登录成功',
        type: 'success',
        duration: 2000,
      })
      // 保存用户信息到 localStorage
      localStorage.setItem('username', admin.username)
      localStorage.setItem('nickname', admin.nickname)
      return {
        code: 200,
        data: {
          token: 'mock-token-' + Date.now(),
          username: admin.username,
          nickname: admin.nickname
        },
        message: '登录成功'
      }
    } else {
      // 登录失败
      ElMessage({
        message: '用户名或密码错误',
        type: 'error',
        duration: 2000,
      })
      return Promise.reject(new Error('用户名或密码错误'))
    }
  }).catch(error => {
    // 捕获并处理所有错误
    ElMessage.error(error.message || '登录失败，请重试')
    return Promise.reject(error)
  })
}

// 获取用户信息接口
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

// Mock 退出登录接口
export function logout() {
  return request({
    url: '/logout',
    method: 'get'
  }).then(() => {
    return {
      code: 200,
      message: '退出成功'
    }
  }).catch(error => {
    console.error('退出失败:', error)
    return Promise.reject(error)
  })
}

// 获取用户列表
export function getUserList() {
  return request({
    url: '/users',
    method: 'get'
  }).then(users => {
    return {
      code: 200,
      data: {
        list: users,
        total: users.length
      }
    }
  })
}

// 更新用户状态
export function updateUserStatus(userId, status) {
  return request({
    url: '/users',  // 先获取所有用户
    method: 'get'
  }).then(users => {
    const user = users.find(item => item.id === userId)
    if (!user) {
      throw new Error('用户不存在')
    }

    // 更新用户状态
    return request({
      url: `/users/${userId}`,
      method: 'put',
      data: {
        ...user,  // 保留用户其他信息
        status: status  // 更新状态
      }
    }).then(() => {
      return {
        code: 200,
        message: '更新成功'
      }
    })
  })
} 