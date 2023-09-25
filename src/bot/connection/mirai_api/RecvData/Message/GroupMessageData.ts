import {MessageData} from "./MessageData";
import {GroupMessageSender} from "./MessageSender/GroupMessageSender";
import {RecvMessageChain} from "../../MessageChain/MessageChain";

export interface GroupMessageData extends MessageData {
    type: 'GroupMessage'
    sender: GroupMessageSender
    messageChain: RecvMessageChain
}

export function is_group_message_data(msg_data: MessageData): msg_data is GroupMessageData {
    return msg_data.type == 'GroupMessage'
}
