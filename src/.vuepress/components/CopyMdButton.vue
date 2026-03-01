<template>
  <button @click="copyContent" class="copy-md-btn">
    {{ copied ? '✅ 已复制' : '📋 复制 MD 源码' }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePageData } from 'vuepress/client'

const page = usePageData()
const copied = ref(false)

async function copyContent() {
  const raw = page.value['rawContent'] as string
  if (!raw) {
    console.warn('未获取到 MD 原始内容')
    return
  }
  try {
    await navigator.clipboard.writeText(raw)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (e) {
    console.error('复制失败', e)
  }
}
</script>

<style scoped>
.copy-md-btn {
  padding: 6px 14px;
  border: 1px solid #3eaf7c;
  border-radius: 4px;
  background: transparent;
  color: #3eaf7c;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.copy-md-btn:hover {
  background: #3eaf7c;
  color: #fff;
}
</style>