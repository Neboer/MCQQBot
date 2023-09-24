// 刚刚建立连接时，Mirai的返回内容。
export interface MiraiSessionMsg {
    syncId: string
    data: SessionData
}

export interface SessionData {
    code: number
    session: string
}