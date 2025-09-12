const headerData = {
  title: 'LiChonglou',
  navItems: [
    { path: '/', label: '首页' },
    { path: '/about', label: '关于' },
    { path: '/contact', label: '联系' }
  ]
}

const footerData = [
  {
    title: '产品与服务',
    links: [
      { label: '首页', href: '/' },
      { label: '文章', href: '/articles' },
      { label: '关于我们', href: '/about' },
      { label: '联系我们', href: '/contact' }
    ]
  },
  {
    title: '开发资源',
    links: [
      {
        label: 'GitHub',
        href: 'https://github.com/shiwanmenghuxiahuashan/chonglou-website',
        external: true
      },
      { label: 'API 文档', href: '/api-docs' },
      { label: '开发指南', href: '/dev-guide' },
      { label: '更新日志', href: '/changelog' }
    ]
  },
  {
    title: '支持与帮助',
    links: [
      { label: '常见问题', href: '/faq' },
      { label: '技术支持', href: '/support' },
      { label: '用户反馈', href: '/feedback' },
      { label: '社区论坛', href: '/community' }
    ]
  },
  {
    title: '法律信息',
    links: [
      { label: '隐私政策', href: '/privacy' },
      { label: '使用条款', href: '/terms' },
      { label: 'Cookie 政策', href: '/cookies' },
      { label: '法律声明', href: '/legal' }
    ]
  }
]
const mockData = {
  headerData,
  footerData
}
export { mockData }
