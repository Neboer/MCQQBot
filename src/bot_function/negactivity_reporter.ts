// 用来转发消息到QQ，转发消息到MC的。
import Bot from "../bot/bot";
import TextBuilder from "../TextBuilder";
import {MQQGroupMsg} from "../bot/mqq_msg";
import logger from "../bot/logging";
import {MsgFilter} from "../bot/mc_msg_censorer";

export default function bind_negactivity_listener(bot: Bot, text_builder: TextBuilder) {
    bot.on_mc_log(/^(?<name>\w+?) lost connection: 被 Negativity 以 (?<reason>.*?) 封禁至 (?<time>.*?)。$/, async (bot_instance, m_mc_msg) => {
        logger.info(`negactivity_listener player ${m_mc_msg.matched_groups.name} banned with reason ${m_mc_msg.matched_groups.reason} until ${m_mc_msg.matched_groups.time}`)
        await bot_instance.send_default_qqgroup_message(text_builder.build_random_translate_str('Negactivity.作弊封禁', {
            name: m_mc_msg.matched_groups.name,
            reason: m_mc_msg.matched_groups.reason,
            time: m_mc_msg.matched_groups.time
        }))
    })
}