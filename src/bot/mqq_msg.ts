import BotConfig from "./BotConfig";
import {GroupMessageData} from "./connection/mirai_api/RecvMsg/RecvData/Message/GroupMessageData";
import {is_plain_text_chain, message_chain_to_string} from "./connection/mirai_api/MessageChain/MessageChainString";


// MQQ*Msg表达从QQ中收到的某类消息。
export class MQQGroupMsg {
    message_text: string
    sender_id: number
    sender_name: string
    group_id: number

    admin_message: boolean
    sent_by_bot: boolean

    is_plain_text: boolean
    is_command: boolean
    command_name?: string
    command_parameters?: string[]

    constructor(ori_group_msg: GroupMessageData, bot_config: BotConfig) {
        // 将所有CQ码都简单转义。
        this.is_plain_text = is_plain_text_chain(ori_group_msg.messageChain)

        this.message_text = message_chain_to_string(ori_group_msg.messageChain)
        this.sender_name = ori_group_msg.sender.memberName
        this.sender_id = ori_group_msg.sender.id
        this.group_id = ori_group_msg.sender.group.id

        this.admin_message = bot_config.qq_admin_ids.findIndex(i => this.sender_id == i) != -1
        this.sent_by_bot = bot_config.qq_bot_id == this.sender_id

        if (this.message_text.startsWith("#") && this.is_plain_text) {
            // 以#开头的所有纯文本消息会被认为是指令。
            this.is_command = true
            let full_args: string[] = this.message_text.split(" ")
            this.command_name = full_args[0].slice(1)// 移除开始的#符号
            this.command_parameters = full_args.slice(1)
        } else {
            this.is_command = false
        }
    }
}
