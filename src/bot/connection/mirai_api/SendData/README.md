# 发送消息
Mirai发送消息和解包类似，只有一种结构。
```json
{
  "syncId": 123,
  "command": "sendGroupMessage",
  "subCommand": null,
  "content": {
    "sessionKey": "15sdf59",
    "target": 456,
    "messageChain": [
      {
        "type": "Plain",
        "text": "hello"
      }
    ]
  }
}
```

这里描述的结构，是没有syncId的普通结构。

```typescript
export interface SendMessageStructure {
    command: string
    subCommand?: string
    content: SendContent
}
```
