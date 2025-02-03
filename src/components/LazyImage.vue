<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  }
})

const imgRef = ref(null)
const isLoaded = ref(false)
const observer = ref(null)

onMounted(() => {
  observer.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadImage()
        observer.value.unobserve(imgRef.value)
      }
    })
  })

  if (imgRef.value) {
    observer.value.observe(imgRef.value)
  }
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})

const loadImage = () => {
  const img = new Image()
  img.src = props.src
  img.onload = () => {
    isLoaded.value = true
  }
}
</script>

<template>
  <div class="lazy-image-container">
    <img
      ref="imgRef"
      :src="isLoaded ? src : 'loading-placeholder.png'"
      :alt="alt"
      :class="{ 'is-loaded': isLoaded }"
    />
  </div>
</template>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
}

img {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s;
}

img:not(.is-loaded) {
  opacity: 0.2;
}

img.is-loaded {
  opacity: 1;
}
</style> 