import Bot from "../bot/bot";

export enum PlayerOnlineState {
    connecting,
    disconnecting
}

// ShimmeringPlayer，闪烁的玩家，意味着连接防抖。
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