module.exports = {
  root: true,
  extends: ['@element-plus/eslint-config'],
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        // 项目特定需求
        'vue/multi-word-component-names': 'off'
      }
    }
  ],
  rules: {
    // 项目特定需求覆盖
    'vue/multi-word-component-names': 'off'
  }
}
