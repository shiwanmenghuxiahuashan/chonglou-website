# 账户域

## 账户资源 (account)

type: `account`

### attributes

| 字段        | 属性名称 | 属性描述       | 是否必填 | 数据类型 | 示例            | 备注 |
| ----------- | -------- | -------------- | -------- | -------- | --------------- | ---- |
| username    | 用户名   | 登录用户名     | 是       | string   | example@xxx.com |      |
| screen_name | 昵称     | 显示的用户名称 | 否       | string   | 用户名          |      |
| description | 描述     | 个人简介       | 否       | string   | 这是一个用户    |
| company     | 公司     | 工作单位       | 否       | string   | 某某公司        |
| location    | 位置     | 所在地         | 否       | string   | 中国            |
| job_title   | 职位     | 工作职位       | 否       | string   | 前端工程师      |
