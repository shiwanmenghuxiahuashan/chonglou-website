# 媒体域

## 媒体资源 (media)

type: `media`

### attributes

| 字段         | 属性名称 | 属性描述                   | 是否必填 | 数据类型 | 示例                                      | 备注 |
| ------------ | -------- | -------------------------- | -------- | -------- | ----------------------------------------- | ---- |
| url          | URL      | 媒体文件链接               | 是       | string   | 'https://...'                             |      |
| filename     | 文件名   | 媒体文件的名称             | 是       | string   | 'example.mp4'                             |      |
| size         | 大小     | 媒体文件的大小，单位为字节 | 否       | number   | 204800                                    |      |
| mime_type    | 类型     | 代表数据类型所属的大致分类 | 是       | string   | 'video', 'image'                          |      |
| mime_subtype | 子类型   | 代表数据类型所属的具体分类 | 是       | string   | 'mp4', 'png'                              |      |
| description  | 描述     | 媒体文件的描述             | 否       | string   | 'xxx第十次修改 ，xxx参赛作品《万山红遍》' |      |
| cover_url    | 封面URL  | 视频封面/图片缩略          | 否       | string   | 'https://...'                             |      |

### 示例

```json
{
  "data": [
    {
      "type": "media",
      "id": "1",
      "attributes": {
        "url": "https://...",
        "filename": "example.mp4",
        "size": 204800,
        "mime_type": "video",
        "mime_subtype": "mp4",
        "description": "xxx第十次修改 ，xxx参赛作品《万山红遍》",
        "cover_url": "https://..."
      }
    }
  ]
}
```

## 媒体类型枚举 (media_type)

type: `enum`

### values

| 值    | 描述 | 备注 |
| ----- | ---- | ---- |
| video | 视频 |      |
| image | 图片 |      |
| audio | 音频 |      |
| file  | 文件 |      |
| other | 其他 |      |
