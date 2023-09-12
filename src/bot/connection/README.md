# 底层连接

`async_ws`中的`AsyncWebSocketConnection`是对TypeScript中`WebSocket`类的重载，让WebSocket支持Async的写法。

`basic_connection`是对`async_ws`的重连实现，对外提供稳定的`must_read`和`must_send`方法，可以保证在底层连接断开时，顶层可以无感的等待重连而无需异常处理。

同时，`basic_connection`还重载了`EvemtEmitter`（之前需要把机器人的emitter传入，是错误的设计），重连逻辑的实现依赖于绑定在这个emitter上的通信。

`cqhttp_connection`和`mcsvtap_connection`是对`basic_connection`的重载，让它适应两个不同的协议。

`mcsvtap_api`实现了ServerTap的一些HTTP API，目前打算只支持broadcast_message方法，也就是向服务器发送广播消息，请求`/v1/chat/broadcast`节点。

# 底层连接2

顶层才不关心底层实际的连接情况，它们只想要做两件事——发送数据和接收数据。

底层对外暴露两个方法：async read() 和 async send()

CQHTTP connection，可以从里面读出相当多的信息。所有到达的消息都会分好类，等待读取，读取后可以根据instanceof的结果进行分类。

其中有两个特殊的消息：`QQConfirmMsg`和`HeartbeatPacket`，这个消息不会被添加到消息列表中，被顶层读取到。
其中`QQConfirmMsg`会作为消息发送状态指示，用来结束对应的正在等待消息返回的send_msg方法。至于`HeartbeatPacket`，心跳包就可以忽略了。
建议出于节省流量角度考虑，把心跳包关了，没啥用。