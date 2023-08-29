import Bot from "./bot";
import {MMCMsg} from "./mmc_msg";
import {MCMsg} from "./protocol/mc_servertap_msg";

export type MC_MSG_CB = (bot_instance: Bot, m_mc_msg: MMCMsg) => void

export default class MCListener {
    message_pattern: RegExp
    action: MC_MSG_CB

    constructor(pattern: RegExp, act: MC_MSG_CB) {
        this.message_pattern = pattern
        this.action = act
    }

    // 每个mclistner在创建的时候都需要传一个正则表达式。这个表达式既是过滤器，又是匹配器。只有匹配成功的才会被执行。
    // 匹配成功之后，匹配结果中的groups(也就意味着，匹配参数必须是命名规则)会被传入MMCMsg中，构成完整的方法。
    public exec_on(bot_instance: Bot, mc_msg: MCMsg) {
        const message_match_result = mc_msg.message.match(this.message_pattern)
        if (message_match_result) {
            // 如果匹配成功
            const meta_mc_msg = new MMCMsg(mc_msg, message_match_result.groups)
            this.action(bot_instance, meta_mc_msg)
        }
    }
}