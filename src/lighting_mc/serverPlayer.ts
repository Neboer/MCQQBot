
export enum PlayerOnlineState {
    connecting,
    login
}

export class ServerPlayer {
    name: string
    state?: PlayerOnlineState
    ip_addr?: string
    uuid?: string
    password?: string
    connect_time?: number // 首次连接时间。同名玩家在首次连接服务器后有30秒的时间正式登录服务器，在此期间发生的一切消息都被忽略。

    constructor(name: string) {
        this.name = name
        this.state = PlayerOnlineState.connecting
    }
}