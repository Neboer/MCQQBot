# QQ-MC 单点消息转发机器人

- 支持一个mc服务器绑定到一个QQ群。
- 将mc服务器中的玩家消息转发到QQ群，附带消息过滤机制，遵守特定的schema。
  - 玩家加入
  - 玩家退出
  - 玩家聊天
  - 玩家成就
- 将qq群中玩家发送的信息转发到mc，根据特定的schema发送。
- qq群中，玩家可以发送指令。
  - #mc，查询当前在线玩家和人数
  - #bind xx，将自己的QQ号码和mc里的xx id绑定起来（允许多个mc账号对1个qq号）
  - #unbind xx，将mc中的xx id和自己的QQ号码取消绑定。
  - #lsbind，显示服务器中所有bind列表
  - #lsbind xx/me，显示某个QQ号绑定的所有mc_id
  - #help，打印帮助
  - #sbind qqxx mcxx 强行绑定某个QQ号到mc_id上*管理权限*
  - #sunbind qqxx mcxx 强行取消某个QQ号到mc_id的绑定*管理权限*
- mc里，玩家可以发送指令
  - #bind xx，将自己的mc id和xx QQ号绑定起来，一个mc账号只能对应一个QQ号。

## botlib

这个机器人有一个bot核心框架，这个框架也是一个MC-QQ机器人的库框架。它通过交换cqhttp和servertap的数据以及请求
servertap端点的API来工作。它对外抽象出高质量的可编程接口，用户可以直接用这套接口实现高质量的消息转发功能。

机器人支持注册监听器来监听mc和qq的消息，用户可以针对不同的消息做出不同的操作。同时机器人还支持向MC和QQ发送消息，
通过websocket与cqhttp和servertap后端连接，同时也可以通过直接请求servertap API的方法直接向MC发送广播消息。
