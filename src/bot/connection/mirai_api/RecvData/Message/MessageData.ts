import {RecvData} from "../RecvData";
import {RecvMessageChain} from "../../MessageChain/MessageChain";
import {MessageSender} from "./MessageSender/MessageSender";

export interface MessageData extends RecvData {
    type: string
    messageChain: RecvMessageChain
    sender: MessageSender
}

export function is_message_data(msg: RecvData): msg is MessageData {
    return 'messageChain' in msg
}
