import {MessageSender} from "./MessageSender";
import {Group} from "./Group/Group";

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
