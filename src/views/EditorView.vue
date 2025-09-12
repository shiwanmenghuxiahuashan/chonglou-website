<script setup lang="ts">
import { ref } from 'vue'
import { Editor } from '@bytemd/vue-next'
import math from '@bytemd/plugin-math'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import frontmatter from '@bytemd/plugin-frontmatter'
import zhHans from 'bytemd/locales/zh_Hans.json'

import 'bytemd/dist/index.css'
import 'katex/dist/katex.css'
import 'highlight.js/styles/default.css'
import 'juejin-markdown-themes/dist/juejin.min.css'

//  配置项
// https://codemirror.net/5/doc/manual.html#config
const content = ref('')

const plugins = [gfm(), frontmatter(), math(), highlight()]

const handleChange = (v: string) => {
  content.value = v
}
</script>

<template>
  <div class="chonglou-editor-layout">
    <Editor
      :locale="zhHans"
      :value="content"
      :plugins="plugins"
      class="chonglou-editor__instance"
      @change="handleChange"
    />
  </div>
</template>

<style lang="scss">
/* 预览区掘金主题 */
// @import 'bytemd/dist/themes/juejin.css';
.chonglou-editor-layout {
  height: 100%;
  margin: 0 auto;
  padding: 2rem;
  font-weight: normal;
  .chonglou-editor__instance {
    height: 100%;
    .bytemd {
      height: calc(100vh - 250px);
    }
  }
}
</style>
