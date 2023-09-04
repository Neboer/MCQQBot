export enum PlayerOnlineState {
    connecting,
    login
}

export class ServerPlayer {
    name: string
    state: PlayerOnlineState
    ip_addr: string
    uuid: string
    password: string

    constructor(name: string) {
        this.name = name
        this.state = PlayerOnlineState.connecting
    }
}