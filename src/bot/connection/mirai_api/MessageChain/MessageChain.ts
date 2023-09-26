import {QQMessage} from "./QQMessage/QQMessage";

export interface PlainTextQQMessage extends QQMessage {
    type: 'Plain',
    text: string
}

export interface SourceQQMessage extends QQMessage {
    type: 'Source'
    id: number
    time: number
}

export type MessageChain = QQMessage[]
export type RecvMessageChain = [SourceQQMessage, ...QQMessage[]];

export function is_plain_text_qq_message(qq_msg: QQMessage):qq_msg is PlainTextQQMessage {
    return qq_msg.type == 'Plain'
}