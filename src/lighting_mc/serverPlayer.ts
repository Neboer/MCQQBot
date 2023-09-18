export enum PlayerOnlineState {
    connecting,
    disconnecting
}

// ShimmeringPlayer，闪烁的玩家，只是用来做连接防抖用的。这个玩家不保存真正的连接信息。
export class ShimmeringPlayer {
    name: string
    state: PlayerOnlineState
    timer: NodeJS.Timeout

    // 玩家从来没有连接过服务器。如果session manager发现自己没有保存这个玩家的连接数据，可以直接创建。
    constructor(name: string, state = PlayerOnlineState.connecting) {
        this.name = name
        this.state = state
    }
}

