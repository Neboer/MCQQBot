import {QQMessage, SourceQQMessage} from "./MessageChain";

type RecvMessageChain = [SourceQQMessage, ...QQMessage[]];

// Mirai回报，表示一个有意义的消息，通常是群组或好友消息等。
export interface MiraiRecvMsg {
    syncId: string
    data: RecvMessageData // 未来可能会有RecvFriend之类的名字
}


export interface RecvMessageData {
    type: string
    messageChain: RecvMessageChain
    sender: MessageSender
}

export interface RecvGroupMessageData extends RecvMessageData{
    type: string
    messageChain: RecvMessageChain
    sender: GroupMessageSender
}

export interface MessageSender {
    id: number
}

export interface GroupMessageSender extends MessageSender {
    id: number
    memberName: string
    specialTitle: string
    permission: string
    joinTimestamp: number
    lastSpeakTimestamp: number
    muteTimeRemaining: number
    group: Group
}

export interface FriendMessageSender extends MessageSender {
    id: number
    nickname: string
    remark: string
}

export interface Group {
    id: number
    name: string
    permission: string
}


