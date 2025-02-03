import { defineStore } from 'pinia'
import { getOrderList, closeOrder, completeStocking, deliverOrder } from '@/api/order'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orderList: [],
    currentOrder: null,
    loading: false
  }),

  getters: {
    // 待支付订单
    unpaidOrders: (state) => state.orderList.filter(order => order.status === '待支付'),
    // 已支付订单
    paidOrders: (state) => state.orderList.filter(order => order.status === '已支付'),
    // 配货完成订单
    stockedOrders: (state) => state.orderList.filter(order => order.status === '配货完成')
  },

  actions: {
    // 获取订单列表
    async fetchOrders(params) {
      this.loading = true
      try {
        const res = await getOrderList(params)
        if (res.code === 200) {
          this.orderList = res.data.list
        }
      } finally {
        this.loading = false
      }
    },

    // 关闭订单
    async closeOrder(orderId) {
      const res = await closeOrder(orderId)
      if (res.code === 200) {
        await this.fetchOrders()
      }
      return res
    },

    // 配货完成
    async completeStocking(orderId) {
      const res = await completeStocking(orderId)
      if (res.code === 200) {
        await this.fetchOrders()
      }
      return res
    },

    // 出库
    async deliverOrder(orderId) {
      const res = await deliverOrder(orderId)
      if (res.code === 200) {
        await this.fetchOrders()
      }
      return res
    }
  },

  persist: true // 开启持久化
}) 