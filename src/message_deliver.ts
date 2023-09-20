// 用来转发消息到QQ，转发消息到MC的。
import Bot from "./bot/bot";
import TextBuilder from "./TextBuilder";
import {MQQGroupMsg} from "./bot/mqq_msg";
import logger from "./bot/logging";

export default function bind_message_deliverer(bot: Bot, text_builder: TextBuilder) {
    bot.on_qq_group_chat((bot_instance: Bot, m_qq_msg: MQQGroupMsg) => {
        logger.info(`on_qq_group_chat ${m_qq_msg.sender_name}:${m_qq_msg.message_text}`)
        bot_instance.broadcast_mc_message(text_builder.build_random_translate_str('消息.转发QQ消息到MC', {
            name: m_qq_msg.sender_name,
            message: m_qq_msg.message_text
        }))
    })

    bot.on_mc_log(/^<(?<name>.*?)> (?<message>.*)$/, (bot_instance, m_mc_msg) => {
        // TODO: 增加消息审核过滤机制
        logger.info(`player say ${m_mc_msg.matched_groups.message}`)
        bot_instance.send_default_qqgroup_message(text_builder.build_random_translate_str('消息.转发MC消息到QQ', {
            name: m_mc_msg.matched_groups.name,
            message: m_mc_msg.matched_groups.message
        }))
    })
}