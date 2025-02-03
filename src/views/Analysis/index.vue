<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useOrderStore } from '@/stores/order'
import { useGoodsStore } from '@/stores/goods'

const orderStore = useOrderStore()
const goodsStore = useGoodsStore()

// 统计数据
const statistics = ref({
  todayOrders: 1888,
  todayUsers: 36271,
  conversionRate: '20%',
  totalSales: '¥89,634'
})

// 图表实例
let trendChart = null
let pieChart = null
let barChart = null

// 初始化趋势图表
const initTrendChart = () => {
  const chartDom = document.getElementById('trend-chart')
  trendChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '系统数据趋势'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增注册', '付费用户', '活跃用户', '订单数', '当日收入']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增注册',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210]
      },
      {
        name: '付费用户',
        type: 'line',
        data: [220, 182, 191, 234, 290, 330, 310]
      },
      {
        name: '活跃用户',
        type: 'line',
        data: [150, 232, 201, 154, 190, 330, 410]
      },
      {
        name: '订单数',
        type: 'line',
        data: [320, 332, 301, 334, 390, 330, 320]
      },
      {
        name: '当日收入',
        type: 'line',
        data: [820, 932, 901, 934, 1290, 1330, 1320]
      }
    ]
  }

  trendChart.setOption(option)
}

// 初始化饼图
const initPieChart = () => {
  const chartDom = document.getElementById('pie-chart')
  pieChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '商品销售占比',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%'
    },
    series: [
      {
        name: '销售占比',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: [
          { value: 1048, name: '苹果' },
          { value: 735, name: '橙子' },
          { value: 580, name: '香蕉' },
          { value: 484, name: '葡萄' },
          { value: 300, name: '西瓜' }
        ]
      }
    ]
  }

  pieChart.setOption(option)
}

// 初始化柱状图
const initBarChart = () => {
  const chartDom = document.getElementById('bar-chart')
  barChart = echarts.init(chartDom)
  
  const option = {
    title: {
      text: '各时段订单量'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '订单量',
        type: 'bar',
        barWidth: '60%',
        data: [10, 52, 200, 334, 390, 330, 220, 110]
      }
    ]
  }

  barChart.setOption(option)
}

// 监听窗口大小变化
const handleResize = () => {
  trendChart?.resize()
  pieChart?.resize()
  barChart?.resize()
}

onMounted(() => {
  initTrendChart()
  initPieChart()
  initBarChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  pieChart?.dispose()
  barChart?.dispose()
})
</script>

<template>
  <div class="analysis-container">
    <!-- 数据概览 -->
    <div class="statistics-cards">
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>今日订单数</span>
          </div>
        </template>
        <div class="card-value">{{ statistics.todayOrders }}</div>
      </el-card>
      
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>今日活跃用户</span>
          </div>
        </template>
        <div class="card-value">{{ statistics.todayUsers }}</div>
      </el-card>
      
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>转化率</span>
          </div>
        </template>
        <div class="card-value">{{ statistics.conversionRate }}</div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>总销售额</span>
          </div>
        </template>
        <div class="card-value">{{ statistics.totalSales }}</div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 趋势图 -->
      <el-card class="chart-card full-width">
        <div id="trend-chart" style="height: 400px;"></div>
      </el-card>

      <!-- 饼图和柱状图 -->
      <div class="chart-row">
        <el-card class="chart-card">
          <div id="pie-chart" style="height: 400px;"></div>
        </el-card>
        
        <el-card class="chart-card">
          <div id="bar-chart" style="height: 400px;"></div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analysis-container {
  padding: 20px;
  background-color: #f5f7fa;
}

.statistics-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  text-align: center;
  padding: 20px 0;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background-color: #fff;
  border-radius: 4px;
}

.full-width {
  grid-column: 1 / -1;
}
</style> 