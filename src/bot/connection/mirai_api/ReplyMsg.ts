export interface ReplyMsg {
    code: number
    msg: string // success或错误
    messageId?: number // 发送成功才有这个东西
}
