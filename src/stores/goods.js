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
    activeGoods: (state) => state.goodsList.filter((good) => good.status === 1),
    // 按分类统计商品数量
    goodsByCategory: (state) => {
      const result = {}
      state.goodsList.forEach((good) => {
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
          this.goodsList = res.data.list || []
        }
      } catch (error) {
        console.error('获取商品列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 添加商品
    async addGoods(data) {
      try {
        const res = await addGoods(data)
        if (res.code === 200) {
          // 添加成功后立即获取最新列表
          await this.fetchGoods()
        }
        return res
      } catch (error) {
        console.error('添加商品失败:', error)
        throw error
      }
    },

    // 编辑商品
    async editGoods(data) {
      try {
        const res = await editGoods(data)
        if (res.code === 200) {
          // 编辑成功后立即获取最新列表
          await this.fetchGoods()
        }
        return res
      } catch (error) {
        console.error('编辑商品失败:', error)
        throw error
      }
    },

    // 删除商品
    async deleteGoods(id) {
      try {
        const res = await deleteGoods(id)
        if (res.code === 200) {
          // 删除成功后立即获取最新列表
          await this.fetchGoods()
        }
        return res
      } catch (error) {
        console.error('删除商品失败:', error)
        throw error
      }
    }
  },

  persist: true
})
