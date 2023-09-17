import Bot from "../bot/bot";

export enum PlayerOnlineState {
    connecting,
    disconnected
}


export type PLAYER_LOGIN_CB = (player: WaitingForLoginPlayer) => any

export class WaitingForLoginPlayer {
    name: string
    state: PlayerOnlineState
    login_timer: NodeJS.Timeout

    // 玩家从来没有连接过服务器。如果session manager发现自己没有保存这个玩家的连接数据，可以直接创建。
    constructor(name: string) {
        this.name = name
        this.state = PlayerOnlineState.connecting
    }
}