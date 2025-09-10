<template>
  <i 
    :class="iconClass" 
    :style="iconStyle"
    @click="handleClick"
  >
    <svg v-if="isSvgIcon" :width="size" :height="size" fill="currentColor">
      <use :href="`#icon-${name}`"></use>
    </svg>
  </i>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

interface Props {
  name: string
  size?: string | number
  color?: string
  type?: 'element' | 'svg' | 'custom'
  prefix?: string
  clickable?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  size: '16',
  type: 'element',
  prefix: 'el-icon',
  clickable: false
})

const emit = defineEmits<Emits>()

// 计算图标类名
const iconClass = computed(() => {
  const baseClass = props.clickable ? 'chonglou-icon chonglou-icon--clickable' : 'chonglou-icon'
  
  switch (props.type) {
    case 'element':
      return `${baseClass} ${props.prefix}-${props.name}`
    case 'custom':
      return `${baseClass} chonglou-icon--${props.name}`
    case 'svg':
      return `${baseClass} chonglou-icon--svg`
    default:
      return `${baseClass} ${props.prefix}-${props.name}`
  }
})

// 计算图标样式
const iconStyle = computed<CSSProperties>(() => {
  const styles: CSSProperties = {}
  
  if (props.size) {
    const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size
    styles.fontSize = sizeValue
    styles.width = sizeValue
    styles.height = sizeValue
  }
  
  if (props.color) {
    styles.color = props.color
  }
  
  return styles
})

// 判断是否为 SVG 图标
const isSvgIcon = computed(() => props.type === 'svg')

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as vars;
@use '@/styles/mixins' as mix;

.chonglou-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  transition: all var(--transition-fast);
  
  &.chonglou-icon--clickable {
    cursor: pointer;
    
    &:hover {
      opacity: 0.8;
      transform: scale(1.1);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  svg {
    display: block;
    fill: currentColor;
  }
}

// Element Plus 图标兼容
.chonglou-icon[class*="el-icon-"] {
  line-height: 1;
}

// 自定义图标字体兼容
.chonglou-icon[class*="chonglou-icon--"] {
  font-family: 'iconfont', sans-serif;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
