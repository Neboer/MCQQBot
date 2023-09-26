import {MessageSender} from "./MessageSender";

export interface FriendMessageSender extends MessageSender {
    id: number
    nickname: string
    remark: string
}
