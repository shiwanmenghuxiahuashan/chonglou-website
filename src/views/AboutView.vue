<script setup lang="ts">
import { ref } from 'vue'

const techStack = ref([
  'Vue 3',
  'TypeScript',
  'Vite',
  'Pinia',
  'Vue Router',
  'Element Plus',
  'SCSS',
  'ESLint',
  'Prettier',
  'PWA'
])

const features = ref([
  {
    icon: '⚡',
    title: '现代技术栈',
    description:
      '采用 Vue 3 + TypeScript + Vite 构建，确保最佳的开发体验和性能。',
    color: '#4fc08d'
  },
  {
    icon: '📱',
    title: '响应式设计',
    description: '完美适配桌面端和移动端，提供一致的用户体验。',
    color: '#42b883'
  },
  {
    icon: '🌙',
    title: '深色模式',
    description: '支持明暗主题切换，保护用户视力，提升阅读体验。',
    color: '#35495e'
  },
  {
    icon: '🚀',
    title: 'PWA 支持',
    description: '支持离线访问和安装到桌面，提供类原生应用体验。',
    color: '#6dd4a3'
  }
])
</script>

<template>
  <div class="chonglou-about">
    <div class="chonglou-about__hero">
      <div class="chonglou-about__hero-content">
        <h1>关于重楼前端技术分享</h1>
        <p class="chonglou-about__hero-description">
          专注于现代前端技术分享与交流的个人网站，记录学习过程，分享技术心得。
        </p>
      </div>
    </div>

    <div class="chonglou-about__content">
      <el-row :gutter="24">
        <el-col :xs="24" :md="12">
          <el-card class="chonglou-about__card">
            <template #header>
              <h3>👤 关于我</h3>
            </template>
            <div class="chonglou-about__card-content">
              <p>我是重楼，一名前端开发工程师，热爱技术，喜欢分享。</p>
              <p>
                专注于 Vue.js 生态系统、TypeScript、现代构建工具等前端技术领域。
              </p>
              <p>希望通过这个网站记录自己的学习过程，也能帮助到其他开发者。</p>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-card class="chonglou-about__card">
            <template #header>
              <h3>💻 技术栈</h3>
            </template>
            <div class="chonglou-about__card-content">
              <div class="chonglou-about__tech-stack">
                <el-tag
                  v-for="tech in techStack"
                  :key="tech"
                  class="chonglou-about__tech-tag"
                >
                  {{ tech }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="24" class="chonglou-about__section">
        <el-col :xs="24" :md="12">
          <el-card class="chonglou-about__card">
            <template #header>
              <h3>🎯 网站目标</h3>
            </template>
            <div class="chonglou-about__card-content">
              <ul class="chonglou-about__goal-list">
                <li>记录前端技术学习心得</li>
                <li>分享实用的开发技巧</li>
                <li>探索最新的前端技术趋势</li>
                <li>构建开发者交流社区</li>
              </ul>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-card class="chonglou-about__card">
            <template #header>
              <h3>📞 联系方式</h3>
            </template>
            <div class="chonglou-about__card-content">
              <div class="chonglou-about__contact-item">
                <span>📧 邮箱：contact@example.com</span>
              </div>
              <div class="chonglou-about__contact-item">
                <span>⭐ GitHub：github.com/example</span>
              </div>
              <div class="chonglou-about__contact-item">
                <span>💬 微信：example_wechat</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="chonglou-about__features">
      <h2>网站特色</h2>
      <el-row :gutter="24">
        <el-col
          v-for="feature in features"
          :key="feature.title"
          :xs="24"
          :sm="12"
          :lg="6"
        >
          <div class="chonglou-about__feature-card">
            <div
              class="chonglou-about__feature-icon"
              :style="{ backgroundColor: feature.color }"
            >
              {{ feature.icon }}
            </div>
            <h4>{{ feature.title }}</h4>
            <p>{{ feature.description }}</p>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as vars;
@use '@/styles/mixins' as mix;

.chonglou-about {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.chonglou-about__hero {
  text-align: center;
  padding: var(--spacing-3xl) 0;
  background: linear-gradient(
    135deg,
    var(--primary-color-light) 0%,
    var(--primary-color) 100%
  );
  border-radius: var(--border-radius-lg);
  color: white;
  margin-bottom: var(--spacing-2xl);

  .chonglou-about__hero-content {
    max-width: 600px;
    margin: 0 auto;

    h1 {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--spacing-lg);
    }

    .chonglou-about__hero-description {
      font-size: var(--font-size-lg);
      line-height: var(--line-height-relaxed);
      opacity: 0.9;
    }
  }
}

.chonglou-about__content {
  margin-bottom: var(--spacing-2xl);
}

.chonglou-about__card {
  height: 100%;

  .chonglou-about__card-content {
    line-height: var(--line-height-relaxed);

    p {
      margin-bottom: var(--spacing-md);
      color: var(--text-secondary);

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  h3 {
    @include mix.flex-center;
    gap: var(--spacing-sm);
    margin: 0;
    color: var(--primary-color);
  }
}

.chonglou-about__tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.chonglou-about__tech-tag {
  margin: 0;
}

.chonglou-about__goal-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    @include mix.flex-center;
    justify-content: flex-start;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    color: var(--text-secondary);

    &:before {
      content: '✓';
      color: var(--success-color);
      font-weight: var(--font-weight-bold);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.chonglou-about__contact-item {
  @include mix.flex-center;
  justify-content: flex-start;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);

  &:last-child {
    margin-bottom: 0;
  }
}

.chonglou-about__features {
  text-align: center;

  h2 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-2xl);
    font-size: var(--font-size-2xl);
  }
}

.chonglou-about__feature-card {
  padding: var(--spacing-xl);
  text-align: center;
  border-radius: var(--border-radius-md);
  background: var(--bg-elevated);
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal);
  height: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .chonglou-about__feature-icon {
    @include mix.flex-center;
    width: 64px;
    height: 64px;
    margin: 0 auto var(--spacing-lg);
    border-radius: var(--border-radius-round);
    color: white;
    font-size: 1.5rem;
    box-shadow: var(--shadow-light);
  }

  h4 {
    font-size: var(--font-size-lg);
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
  }

  p {
    color: var(--text-secondary);
    line-height: var(--line-height-relaxed);
    margin: 0;
  }
}

.chonglou-about__section {
  margin-top: var(--spacing-lg);
}

// 响应式适配
@include mix.mobile {
  .chonglou-about__hero {
    padding: var(--spacing-2xl) var(--spacing-lg);

    .chonglou-about__hero-content h1 {
      font-size: var(--font-size-2xl);
    }

    .chonglou-about__hero-description {
      font-size: var(--font-size-base);
    }
  }

  .chonglou-about__feature-card {
    margin-bottom: var(--spacing-lg);
  }

  .chonglou-about__tech-stack {
    justify-content: center;
  }
}
</style>
