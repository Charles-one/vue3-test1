import { defineStore } from 'pinia'
import { getGoodsList, addGoods, editGoods, deleteGoods } from '@/api/goods'

export const useGoodsStore = defineStore('goods', {
  state: () => ({
    goodsList: [],
    loading: false,
    categories: [] // 商品分类
  }),

  getters: {
    // 上架商品
    activeGoods: (state) => state.goodsList.filter(good => good.status === 1),
    // 按分类统计商品数量
    goodsByCategory: (state) => {
      const result = {}
      state.goodsList.forEach(good => {
        if (!result[good.category]) {
          result[good.category] = 0
        }
        result[good.category]++
      })
      return result
    }
  },

  actions: {
    // 获取商品列表
    async fetchGoods() {
      this.loading = true
      try {
        const res = await getGoodsList()
        if (res.code === 200) {
          this.goodsList = res.data.list
        }
      } finally {
        this.loading = false
      }
    },

    // 添加商品
    async addGoods(data) {
      const res = await addGoods(data)
      if (res.code === 200) {
        await this.fetchGoods()
      }
      return res
    },

    // 编辑商品
    async editGoods(data) {
      const res = await editGoods(data)
      if (res.code === 200) {
        await this.fetchGoods()
      }
      return res
    },

    // 删除商品
    async deleteGoods(id) {
      const res = await deleteGoods(id)
      if (res.code === 200) {
        await this.fetchGoods()
      }
      return res
    }
  },

  persist: true
}) 