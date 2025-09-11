const isProd = process.env.NODE_ENV === 'production'
const projectConfig = {
  title: '李重楼',
  /**
   * 假设你的应用是被部署在一个域名的根路径上，例如 https://www.my-app.com/。如果应用被部署在一个子路径上，
   * 你就需要用这个选项指定这个子路径。
   * 例如:如果你的应用被部署在 https://www.my-app.com/my-app/，则设置 publicPath 为 /my-app/
   */
  basePath: './', // 等同于 './'
  /**
   * 接口地址
   */
  api: isProd ? 'https://api.lichonglou.com/' : 'http://localhost:8888/', // 测试
  /**
   * 本地服务 端口号
   */
  serverPort: 8888,
  /**
   * bearer token
   */
  token:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJFZTM3YUl0T1g5eU9xZ0FXUGdJOTFRIiwiYXVkIjoiRWUzN2FHUk5MVHlPcWdBV1BnSTkxUSIsIm5iZiI6MTc1NzQ0MDI1MSwiZXhwIjoxNzU3ODk5NDIyLCJ1aWQiOiJkbldObml3TlBldWxRcGdIbnUwRkNnIiwidXYiOjEzLCJzY29wZSI6Ii8vLy80In0.aDWjipNx8VBVBVwg1j-W9Z5GpZgnZ9WCsK8GeQCrSPXmG-5tgrX0B6zR4ec0mEPqqnoBFxUNnj4zuSlfZy2fMQ'
}

export { projectConfig }
