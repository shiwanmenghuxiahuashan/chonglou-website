<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<template>
  <div class="chonglou-notfound">
    <div class="chonglou-notfound__container">
      <!-- 404 数字 -->
      <div class="chonglou-notfound__number">
        <span class="chonglou-notfound__digit">4</span>
        <span class="chonglou-notfound__digit">0</span>
        <span class="chonglou-notfound__digit">4</span>
      </div>

      <!-- 错误信息 -->
      <div class="chonglou-notfound__content">
        <h1 class="chonglou-notfound__title">页面未找到</h1>
        <p class="chonglou-notfound__description">
          抱歉，您访问的页面不存在或已被移除。
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="chonglou-notfound__actions">
        <el-button
          type="primary"
          size="large"
          class="chonglou-notfound__button"
          @click="goHome"
        >
          <el-icon class="chonglou-notfound__button-icon">
            <House />
          </el-icon>
          返回首页
        </el-button>

        <el-button
          size="large"
          class="chonglou-notfound__button chonglou-notfound__button--secondary"
          @click="goBack"
        >
          <el-icon class="chonglou-notfound__button-icon">
            <ArrowLeft />
          </el-icon>
          返回上页
        </el-button>
      </div>

      <!-- 装饰性元素 -->
      <div class="chonglou-notfound__decoration">
        <div class="chonglou-notfound__circle chonglou-notfound__circle--1" />
        <div class="chonglou-notfound__circle chonglou-notfound__circle--2" />
        <div class="chonglou-notfound__circle chonglou-notfound__circle--3" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chonglou-notfound {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;

  &__container {
    text-align: center;
    position: relative;
    z-index: 2;
    max-width: 600px;
    padding: var(--spacing-2xl);
  }

  &__number {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-2xl);
    perspective: 1000px;
  }

  &__digit {
    font-size: 8rem;
    font-weight: var(--font-weight-bold);
    color: var(--primary-color);
    text-shadow: 0 4px 8px rgba(79, 192, 141, 0.3);
    transform: rotateY(0deg);
    transition: transform 0.6s ease;

    &:nth-child(1) {
      animation: float 3s ease-in-out infinite;
    }

    &:nth-child(2) {
      animation: float 3s ease-in-out infinite 0.5s;
    }

    &:nth-child(3) {
      animation: float 3s ease-in-out infinite 1s;
    }
  }

  &__content {
    margin-bottom: var(--spacing-3xl);
  }

  &__title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin: 0 0 var(--spacing-md) 0;
    line-height: var(--line-height-tight);
  }

  &__description {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
    margin: 0;
    line-height: var(--line-height-normal);
  }

  &__actions {
    display: flex;
    gap: var(--spacing-lg);
    justify-content: center;
    flex-wrap: wrap;
    .el-button + .el-button {
      margin-left: 0;
    }
  }

  &__button {
    min-width: 160px;
    height: 48px;
    border-radius: var(--border-radius-lg);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-base);
    transition: all var(--transition-normal);

    &--secondary {
      --el-button-bg-color: transparent;
      --el-button-border-color: var(--border-color);
      --el-button-text-color: var(--text-secondary);

      &:hover {
        --el-button-bg-color: var(--bg-hover);
        --el-button-border-color: var(--primary-color);
        --el-button-text-color: var(--primary-color);
      }
    }
  }

  &__button-icon {
    margin-right: var(--spacing-xs);
    font-size: 18px;
  }

  &__decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 1;
  }

  &__circle {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      rgba(79, 192, 141, 0.1),
      rgba(66, 184, 131, 0.05)
    );
    animation: drift 20s linear infinite;

    &--1 {
      width: 200px;
      height: 200px;
      top: 10%;
      left: 10%;
      animation-delay: 0s;
    }

    &--2 {
      width: 150px;
      height: 150px;
      top: 60%;
      right: 15%;
      animation-delay: -7s;
    }

    &--3 {
      width: 100px;
      height: 100px;
      bottom: 20%;
      left: 20%;
      animation-delay: -14s;
    }
  }
}

/* 动画效果 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotateY(0deg);
  }
  50% {
    transform: translateY(-20px) rotateY(10deg);
  }
}

@keyframes drift {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
  100% {
    transform: translate(0, 0) rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chonglou-notfound {
    &__container {
      padding: var(--spacing-lg);
    }

    &__digit {
      font-size: 6rem;
    }

    &__title {
      font-size: var(--font-size-2xl);
    }

    &__description {
      font-size: var(--font-size-base);
    }

    &__actions {
      flex-direction: column;
      align-items: center;
    }

    &__button {
      width: 100%;
      max-width: 280px;
    }
  }
}

@media (max-width: 480px) {
  .chonglou-notfound {
    &__digit {
      font-size: 4rem;
      gap: var(--spacing-md);
    }

    &__title {
      font-size: var(--font-size-xl);
    }

    &__description {
      font-size: var(--font-size-sm);
    }
  }
}

/* 暗黑模式适配 */
:deep(.dark) .chonglou-notfound {
  background: var(--bg-primary);

  &__digit {
    color: var(--primary-color);
    text-shadow: 0 4px 8px rgba(79, 192, 141, 0.4);
  }

  &__title {
    color: var(--text-primary);
  }

  &__description {
    color: var(--text-secondary);
  }
}
</style>
