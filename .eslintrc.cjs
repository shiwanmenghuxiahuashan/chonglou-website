module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true
  },
  plugins: [
    '@typescript-eslint',
    'prettier',
    'unicorn',
    'vue',
    'eslint-comments',
    'import'
  ],
  extends: [
    '@element-plus/eslint-config',
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      },
      node: {
        extensions: ['.js', '.mjs', '.ts', '.d.ts', '.tsx', '.vue']
      }
    }
  },
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true
        }
      },
      rules: {
        'no-undef': 'off',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { disallowTypeAnnotations: false }
        ]
      }
    },
    {
      files: ['*.json', '*.json5', '*.jsonc'],
      parser: 'jsonc-eslint-parser'
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ],
  rules: {
    // 项目特定的规则覆盖
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',

    // TypeScript 规则
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // 通用规则
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'no-debugger': 'warn',

    // 导入排序规则（保留 Element Plus 的配置）
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          ['external', 'internal', 'parent', 'sibling', 'index', 'object'],
          'type'
        ],
        pathGroups: [
          {
            pattern: 'vue',
            group: 'external',
            position: 'before'
          },
          {
            pattern: '@vue/**',
            group: 'external',
            position: 'before'
          },
          {
            pattern: '@element-plus/**',
            group: 'internal'
          },
          {
            pattern: '@/**',
            group: 'internal'
          }
        ],
        pathGroupsExcludedImportTypes: ['type'],
        'newlines-between': 'never',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'import/newline-after-import': ['error', { count: 1 }],

    // Vue 特定规则
    'vue/padding-line-between-blocks': ['warn', 'always'],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always'
        },
        svg: 'always',
        math: 'always'
      }
    ],

    // 代码质量规则
    'sort-imports': [
      'warn',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false
      }
    ],

    // Unicorn 规则（选择性启用）
    'unicorn/prefer-array-find': 'error',
    'unicorn/prefer-array-some': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-string-starts-ends-with': 'error',
    'unicorn/prefer-string-trim-start-end': 'error',
    'unicorn/no-array-push-push': 'error',
    'unicorn/prefer-modern-dom-apis': 'error',

    // Prettier
    'prettier/prettier': 'error'
  }
}
