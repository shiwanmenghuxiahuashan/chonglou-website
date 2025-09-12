<script setup>
import { articleService } from '@/domain/article'

const createHandler = () => {
  articleService
    .createArticle({
      title: '测试文章',
      summary: '这是一篇测试文章',
      content: '## 测试内容\n\n这是文章的主要内容。'
    })
    .then(response => {
      console.log('文章创建成功:', response.data)
    })
    .catch(error => {
      console.error('文章创建失败:', error)
    })
}
</script>

<template>
  <el-button type="primary" @click="createHandler"> 创建测试文章 </el-button>
</template>
