# 文章域

## 文章资源（article）

type: `article`

### attributes

| 字段        | 属性名称 | 属性描述             | 是否必填 | 数据类型 | 示例               | 备注 |
| ----------- | -------- | -------------------- | -------- | -------- | ------------------ | ---- |
| title       | 文章标题 |                      | 是       | string   | '示例标题'         |      |
| summary     | 文章摘要 | 默认从正文非标题截取 | 是       | string   | '这是一个示例摘要' |      |
| content     | 文章内容 | markdown正文         | 是       | string   | '这是文章的正文'   |      |
| create_time | 创建时间 | 秒时间戳             | 是       | string   | '1757661031'       |      |
| update_time | 更新时间 | 秒时间戳             | 是       | string   | '1757661031'       |      |
| like_count  | 点赞数   |                      | 否       | number   | 100                |      |
| view_count  | 浏览数   |                      | 否       | number   |                    | 250  |

### relationships

| 字段   | 属性名称 | 属性描述   | 是否必填 | 数据类型 | 示例 | 备注 |
| ------ | -------- | ---------- | -------- | -------- | ---- | ---- |
| author | 作者     |            | 是       | object[] |      |      |
| media  | 媒体文件 | video ,pic | 否       | object[] |      |      |
| tags   | 文章标签 |            | 否       | object[] |      |      |

### 示例

```json
{
  "data": [
    {
      "type": "article",
      "id": "1",
      "attributes": {
        "title": "示例标题",
        "summary": "这是一个示例摘要",
        "content": "这是文章的正文",
        "create_time": "1757661031",
        "update_time": "1757661031",
        "like_count": 100,
        "view_count": 250
      },
      "relationships": {
        "author": [
          {
            "type": "account",
            "id": "1"
          }
        ],
        "media": [
          {
            "type": "media",
            "id": "1"
          }
        ],
        "tags": [
          {
            "type": "tag",
            "id": "1"
          }
        ]
      }
    }
  ]
}
```

## 标签资源（tag）

type: `tag`

### attributes

| 字段  | 属性名称 | 属性描述 | 是否必填 | 数据类型 | 示例       | 备注 |
| ----- | -------- | -------- | -------- | -------- | ---------- | ---- |
| label | 标签名称 |          | 是       | string   | '示例标签' |      |
| color | 标签颜色 |          | 否       | string   | '#ff0000'  |      |
| desc  | 标签描述 |          | 否       | string   | '这是标签' |      |

### media 资源

见 [媒体域](design/resouce/media.md)

## account 资源

见 [用户域](design/resouce/account.md)
