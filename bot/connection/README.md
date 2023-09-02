# 底层连接

`async_ws`中的`AsyncWebSocketConnection`是对TypeScript中`WebSocket`类的重载，让WebSocket支持Async的写法。

`basic_connection`是对`async_ws`的重连实现，对外提供稳定的`must_read`和`must_send`方法，可以保证在底层连接断开时，顶层可以无感的等待重连而无需异常处理。

同时，`basic_connection`还重载了`EvemtEmitter`（之前需要把机器人的emitter传入，是错误的设计），重连逻辑的实现依赖于绑定在这个emitter上的通信。

`cqhttp_connection`和`mcsvtap_connection`是对`basic_connection`的重载，让它适应两个不同的协议。

`mcsvtap_api`实现了ServerTap的一些HTTP API，目前打算只支持broadcast_message方法，也就是向服务器发送广播消息，请求`/v1/chat/broadcast`节点。

