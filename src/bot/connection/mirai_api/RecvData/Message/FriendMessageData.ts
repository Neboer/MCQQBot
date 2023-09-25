import {MessageData} from "./MessageData";
import {RecvMessageChain} from "../../MessageChain/MessageChain";
import {FriendMessageSender} from "./MessageSender/FriendMessageSender";

export interface FriendMessageData extends MessageData {
    type: 'FriendMessage'
    sender: FriendMessageSender
    messageChain: RecvMessageChain
}
