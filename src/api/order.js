import request from '@/utils/request'

// 获取订单列表
export function getOrderList(params = {}) {
  return request({
    url: '/orders',
    method: 'get'
  }).then(orders => {
    let result = [...orders]
    
    // 按订单号筛选
    if (params.orderId) {
      result = result.filter(item => item.id.includes(params.orderId))
    }
    
    // 按状态筛选
    if (params.status) {
      result = result.filter(item => item.status === params.status)
    }
    
    return {
      code: 200,
      data: {
        list: result,
        total: result.length
      }
    }
  })
}

// 关闭订单
export function closeOrder(orderId) {
  // 先获取原订单数据
  return request({
    url: '/orders',
    method: 'get'
  }).then(orders => {
    const order = orders.find(item => item.id === orderId)
    if (!order) {
      throw new Error('订单不存在')
    }

    // 更新状态，保留其他字段
    return request({
      url: `/orders/${orderId}`,
      method: 'put',
      data: {
        ...order,  // 保留原有字段
        status: '手动关闭'  // 更新状态
      }
    }).then(() => {
      return {
        code: 200,
        message: '订单关闭成功'
      }
    })
  })
}

// 配货完成
export function completeStocking(orderId) {
  // 先获取原订单数据
  return request({
    url: '/orders',
    method: 'get'
  }).then(orders => {
    const order = orders.find(item => item.id === orderId)
    if (!order) {
      throw new Error('订单不存在')
    }

    // 更新状态，保留其他字段
    return request({
      url: `/orders/${orderId}`,
      method: 'put',
      data: {
        ...order,  // 保留原有字段
        status: '配货完成'  // 更新状态
      }
    }).then(() => {
      return {
        code: 200,
        message: '配货完成'
      }
    })
  })
}

// 出库
export function deliverOrder(orderId) {
  // 先获取原订单数据
  return request({
    url: '/orders',
    method: 'get'
  }).then(orders => {
    const order = orders.find(item => item.id === orderId)
    if (!order) {
      throw new Error('订单不存在')
    }

    // 更新状态，保留其他字段
    return request({
      url: `/orders/${orderId}`,
      method: 'put',
      data: {
        ...order,  // 保留原有字段
        status: '出库成功'  // 更新状态
      }
    }).then(() => {
      return {
        code: 200,
        message: '出库成功'
      }
    })
  })
}

// 修改创建订单的方法
export function createOrder(data) {
  return request({
    url: '/orders',  // 改为与其他订单接口一致的路径
    method: 'post',
    data
  }).then(() => {
    return {
      code: 200,
      message: '创建订单成功'
    }
  })
} 