<script setup>

</script>

<template>
  <el-container>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}

.el-container {
  height: 100%;
}

.el-main {
  padding: 0;
}
</style>
