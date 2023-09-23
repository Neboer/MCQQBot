// 用来转发消息到QQ，转发消息到MC的。
import Bot from "../bot/bot";
import TextBuilder from "../TextBuilder";
import {MQQGroupMsg} from "../bot/mqq_msg";
import logger from "../bot/logging";
import {MsgFilter} from "../bot/mc_msg_censorer";

export default function bind_message_deliverer(bot: Bot, text_builder: TextBuilder, msg_filter?: MsgFilter) {
    bot.on_qq_group_chat((bot_instance: Bot, m_qq_msg: MQQGroupMsg) => {
        logger.info(`on_qq_group_chat ${m_qq_msg.sender_name}:${m_qq_msg.message_text}`)
        bot_instance.broadcast_mc_message(text_builder.build_random_translate_str('消息.转发QQ消息到MC', {
            name: m_qq_msg.sender_name,
            message: m_qq_msg.message_text
        }))
    })

    bot.on_mc_log(/^<(?<name>.*?)> (?<message>.*)$/, async (bot_instance, m_mc_msg) => {
        const msg = m_mc_msg.matched_groups.message
        if (msg_filter) {
            const check_result = await msg_filter.check_msg(msg)
            if (check_result.is_blocked) {
                // 玩家消息被审查拦截。
                logger.warn(`message_deliverer player ${m_mc_msg.matched_groups.name} message ${msg} has been blocked by system!`)
                bot_instance.broadcast_mc_message(text_builder.build_random_translate_str('消息.转发到QQ被拦截广播', {
                    name: m_mc_msg.matched_groups.name,
                    reason: check_result.block_reason
                }))
                return
            }
            // 如果没有拦截，继续执行下面的代码。函数不会退出。
        }

        logger.info(`message_deliverer player ${m_mc_msg.matched_groups.name} say ${msg}`)
        bot_instance.send_default_qqgroup_message(text_builder.build_random_translate_str('消息.转发MC消息到QQ', {
            name: m_mc_msg.matched_groups.name,
            message: m_mc_msg.matched_groups.message
        }))
    })
}