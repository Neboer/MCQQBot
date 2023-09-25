// 发送消息的基本类型，注意，只能发送基本文字消息。
import {QQMessage} from "./MessageChain/MessageChain";

export interface MiraiSendMsg {
    syncId: number
    command: string
    subCommand: any // 不重要
    content: SendMessageContent // 未来可能会有SendFriend之类的名字
}

export interface SendMessageContent {
    sessionKey: string
    messageChain: QQMessage[]
}

export interface SendGroupMessageContent extends SendMessageContent {
    sessionKey: string
    target: number // 群号
    messageChain: QQMessage[]
}

export interface SendFriendMessageContent extends SendMessageContent {
    sessionKey: string
    target: number // 发送消息目标好友的QQ号
    messageChain: QQMessage[]
}

export interface SendTempMessageContent extends SendMessageContent {
    sessionKey: string
    qq: number
    group: number
    messageChain: QQMessage[]
}
