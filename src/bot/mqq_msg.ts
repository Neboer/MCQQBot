import {QQGroupMsg} from "./schema/cqhttp_msg";
import Config from "./config";


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

    private static unescape_cq_encoded_str(input_cqmsg_string: string): string {
        const replacements_table = {
            '&amp;': '&',
            '&#91;': '[',
            '&#93;': ']',
            '&#44;': ','
        };

        return input_cqmsg_string.replace(/&amp;|&#91;|&#93;|&#44;/g, match => replacements_table[match]);
    }

    constructor(ori_group_msg: QQGroupMsg, bot_config: Config) {
        // 将所有CQ码都简单转义。
        let no_cq_msg = ori_group_msg.raw_message.replace(/\[CQ:([a-z]+),.*?]/g, '[$1]');
        this.is_plain_text = no_cq_msg == ori_group_msg.raw_message

        this.message_text = MQQGroupMsg.unescape_cq_encoded_str(no_cq_msg)
        this.sender_name = ori_group_msg.sender.nickname
        this.sender_id = ori_group_msg.sender.user_id
        this.group_id = ori_group_msg.group_id

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