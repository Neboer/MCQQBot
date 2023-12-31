# 关于机器人能收到的所有来自Mirai的消息

Mirai能收到的所有消息，大概分为四类：
1. 连接 Session
    - 特点：有`session`字段。
    - 作用：在连接建立时用来报告整个连接的session，发送任何消息都需要带。
    - 举例：建立新连接
2. 事件 Event
    - 特点：有`type`字段，不过没有`messageChain`字段。
    - 作用：用来报告机器人所在环境的一些状态改变。
    - 举例：bot被挤下线、bot被禁言等等
3. 回报 Report
    - 特点：有`code`字段，不过没有`session`字段。
    - 作用：用来报告一个成功，或一个错误。通常与某个操作绑定。
    - 举例：无效参数
4. 消息 Message
    - 特点：有`messageChain`字段。
    - 作用：报告机器人收到了一个消息。
    - 举例：群聊消息、好友消息


注意，Mirai收到的消息并不直接是以上内容，而需要一层解包，解出data之后才是我们需要的RecvData类型。
此外，Mirai还可能收到不符合以上规范的“参数错误消息”，此类消息几乎不可能被机器人触发，忽略。

举例：
```json
{"syncId":"123","data":{"code":6,"msg":"指定操作不支持"}}
```
