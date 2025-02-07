<script setup>
import MyMenu from './MyMenu.vue'
import Content from './Content.vue'
import { ref } from 'vue'
// 定义响应式变量
const isClose = ref(false)
// 定义方法
const change = (newValue) => {
  isClose.value = newValue
}
</script>

<template>
  <div class="menu">
    <MyMenu :isClose="isClose"></MyMenu>
  </div>
  <div class="content" :class="{ active: isClose }">
    <Content :isClose="isClose" @change="change"></Content>
  </div>
</template>

<style scoped>
.menu {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: #112f50;
}

.content {
  padding-left: 200px;
}
.active {
  padding-left: 64px;
}
</style>
