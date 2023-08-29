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