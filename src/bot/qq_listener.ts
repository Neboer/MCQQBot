import {MQQGroupMsg} from "./mqq_msg";
// 重构：这里循环依赖。
import Bot from "./bot";
import {GroupMessageData} from "./connection/mirai_api/RecvMsg/RecvData/Message/GroupMessageData";

export type QQ_MSG_CB = (bot_instance: Bot, m_qq_msg: MQQGroupMsg) => void | Promise<void>

// 根据消息的不同特点提前过滤消息，这样就避免了在command_cb里过滤消息而引起的嵌套。
export interface MQQGroupMsgFilter {
    message_text?: string
    sender_id?: number
    sender_name?: string
    group_id?: number

    admin_message?: boolean
    sent_by_bot?: boolean

    is_command?: boolean
    command_name?: string
}

export default class QQListener {
    filter: MQQGroupMsgFilter
    action: QQ_MSG_CB

    constructor(filter: MQQGroupMsgFilter, act: QQ_MSG_CB) {
        this.filter = filter
        this.action = act
    }

    private is_matching(message: MQQGroupMsg): boolean {
        for (const key in this.filter) {
            if (this.filter.hasOwnProperty(key)) {
                if (message[key] !== this.filter[key]) {
                    return false;
                }
            }
        }
        return true;
    }

    public async exec_on_group(bot_instance: Bot, qq_group_msg: GroupMessageData) {
        const meta_qq_group_message = new MQQGroupMsg(qq_group_msg, bot_instance.bot_config)
        if (this.is_matching(meta_qq_group_message)) {
            return await this.action(bot_instance, meta_qq_group_message)
        }
    }
}