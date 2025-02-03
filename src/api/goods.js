import request from '@/utils/request'

// 获取商品列表
export function getGoodsList() {
  return request({
    url: '/goods',
    method: 'get'
  }).then(res => {
    // 对数据按照 id 进行排序
    const sortedList = res.sort((a, b) => {
      // 将字符串 id 转换为数字进行比较
      return parseInt(a.id) - parseInt(b.id)
    })
    
    return {
      code: 200,
      message: '获取成功',
      data: {
        list: sortedList
      }
    }
  })
}

// 添加商品
export function addGoods(data) {
  return request({
    url: '/goods',
    method: 'get'  // 先获取所有商品
  }).then(goods => {
    // 获取所有已使用的 ID
    const usedIds = goods.map(good => parseInt(good.id))
    
    // 找出最小的未使用 ID
    let newId = 1
    while (usedIds.includes(newId)) {
      newId++
    }
    
    // 新商品的数据
    const newData = {
      ...data,
      id: newId.toString()  // 转为字符串，保持类型一致
    }
    
    // 添加新商品
    return request({
      url: '/goods',
      method: 'post',
      data: newData
    }).then(res => {
      return {
        code: 200,
        message: '添加成功',
        data: res
      }
    })
  })
}

// 编辑商品
export function editGoods(data) {
  return request({
    url: `/goods/${data.id}`,
    method: 'put',
    data
  }).then(res => {
    return {
      code: 200,
      message: '编辑成功',
      data: res
    }
  })
}

// 删除商品
export function deleteGoods(id) {
  return request({
    url: `/goods/${id}`,
    method: 'delete'
  }).then(() => {
    return {
      code: 200,
      message: '删除成功',
      data: null
    }
  })
}

// 上传图片
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => {
    if (res.code === 200) {
      return res.data
    } else {
      throw new Error(res.message || '上传失败')
    }
  })
}

// 获取分类列表
export function getCategoryList() {
  return request({
    url: '/categories',
    method: 'get'
  }).then(res => {
    // 确保返回的是数组
    if (Array.isArray(res)) {
      return res
    } else {
      console.error('获取分类列表失败:', res)
      throw new Error('获取分类列表失败')
    }
  }).catch(error => {
    console.error('获取分类列表请求失败:', error)
    throw error
  })
}

// 获取子分类列表
export function getSubCategoryList() {
  return request({
    url: '/subcategories',
    method: 'get'
  }).then(res => {
    // 确保返回的是数组
    if (Array.isArray(res)) {
      return res
    } else {
      console.error('获取子分类列表失败:', res)
      throw new Error('获取子分类列表失败')
    }
  }).catch(error => {
    console.error('获取子分类列表请求失败:', error)
    throw error
  })
}

// 添加分类
export function addCategory(data) {
  return request({
    url: '/categories',
    method: 'get'  // 先获取所有分类
  }).then(categories => {
    // 获取所有已使用的 ID
    const usedIds = categories.map(category => parseInt(category.id))
    
    // 找出最小的未使用 ID
    let newId = 1
    while (usedIds.includes(newId)) {
      newId++
    }
    
    // 新分类的数据
    const newData = {
      ...data,
      id: newId.toString(),  // 转为字符串，保持类型一致
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
    
    // 添加新分类
    return request({
      url: '/categories',
      method: 'post',
      data: newData
    }).then(res => {
      return {
        code: 200,
        message: '添加成功',
        data: res
      }
    })
  })
}

// 编辑分类
export function editCategory(data) {
  return request({
    url: `/categories/${data.id}`,
    method: 'put',
    data
  }).then(res => {
    return {
      code: 200,
      message: '编辑成功',
      data: res
    }
  })
}

// 删除分类
export function deleteCategory(id) {
  return request({
    url: `/categories/${id}`,
    method: 'delete'
  }).then(() => {
    return {
      code: 200,
      message: '删除成功',
      data: null
    }
  })
}

// 添加子分类
export function addSubCategory(data) {
  return request({
    url: '/subcategories',
    method: 'post',
    data
  }).then(res => {
    return {
      code: 200,
      message: '添加成功',
      data: res
    }
  })
}

// 删除子分类
export function deleteSubCategory(id) {
  return request({
    url: `/subcategories/${id}`,
    method: 'delete'
  }).then(() => {
    return {
      code: 200,
      message: '删除成功',
      data: null
    }
  })
}

// 编辑子分类
export function editSubCategory(data) {
  return request({
    url: `/subcategories/${data.id}`,
    method: 'put',
    data
  }).then(res => {
    return {
      code: 200,
      message: '编辑成功',
      data: res
    }
  })
} 