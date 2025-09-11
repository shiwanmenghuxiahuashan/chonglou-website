<script setup lang="ts">
interface Props {
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  title: '暂无数据',
  description: '当前没有可显示的内容'
})
</script>

<template>
  <div class="chonglou-empty">
    <div class="chonglou-empty__image">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8zM32 12c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20z"
          fill="var(--text-placeholder)"
        />
        <circle cx="24" cy="28" r="2" fill="var(--text-placeholder)" />
        <circle cx="40" cy="28" r="2" fill="var(--text-placeholder)" />
        <path
          d="M24 40c2.5-3 5.5-3 8-3s5.5 0 8 3"
          stroke="var(--text-placeholder)"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <div class="chonglou-empty__content">
      <h3 class="chonglou-empty__title">{{ title }}</h3>
      <p class="chonglou-empty__description">{{ description }}</p>
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as vars;
@use '@/styles/mixins' as mix;

.chonglou-empty {
  @include mix.flex-column-center;
  padding: var(--spacing-3xl) var(--spacing-xl);
  text-align: center;
  color: var(--text-secondary);
}

.chonglou-empty__image {
  margin-bottom: var(--spacing-lg);
  opacity: 0.6;

  svg {
    width: 64px;
    height: 64px;
  }
}

.chonglou-empty__content {
  max-width: 300px;
}

.chonglou-empty__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.chonglou-empty__description {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-lg);
}

// 响应式适配
@include mix.mobile {
  .chonglou-empty {
    padding: var(--spacing-2xl) var(--spacing-md);
  }

  .chonglou-empty__image svg {
    width: 48px;
    height: 48px;
  }

  .chonglou-empty__title {
    font-size: var(--font-size-base);
  }

  .chonglou-empty__description {
    font-size: var(--font-size-xs);
  }
}
</style>
