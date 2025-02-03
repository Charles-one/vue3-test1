import request from '@/utils/request'

// 获取管理员列表
export function getAdminList() {
  return request({
    url: '/admins',
    method: 'get'
  }).then(admins => {
    return {
      code: 200,
      data: admins // 直接返回数组,不需要包装 list 和 total
    }
  })
}

// 添加管理员
export function addAdmin(data) {
  return request({
    url: '/admins',
    method: 'post',
    data: {
      ...data,
      id: Date.now(),
      createTime: new Date().toLocaleString()
    }
  }).then(() => {
    return {
      code: 200,
      message: '添加成功'
    }
  })
}

// 编辑管理员
export function editAdmin(data) {
  return request({
    url: `/admins/${data.id}`,
    method: 'put',
    data: {
      ...data, // 保留所有原有数据
      nickname: data.nickname, // 确保包含昵称
      password: data.password,
      username: data.username
    }
  }).then(() => {
    return {
      code: 200,
      message: '更新成功'
    }
  }).catch(error => {
    console.error('编辑管理员失败:', error)
    return Promise.reject(error)
  })
}

// 删除管理员
export function deleteAdmin(id) {
  return request({
    url: `/admins/${id}`,  // 直接使用 ID 定位要删除的管理员
    method: 'delete'
  }).then(() => {
    return {
      code: 200,
      message: '删除成功'
    }
  })
} 