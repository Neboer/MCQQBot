import Bot from "./bot/bot";
import Config, {load_config} from "./bot/config";
import {MQQGroupMsg} from "./bot/mqq_msg";
import logger from "./bot/logging";


const bot_config = load_config()
const KyaruBot = new Bot(bot_config)


KyaruBot.on_qq_group_chat(async (bot_instance: Bot, m_qq_msg: MQQGroupMsg) => {
    logger.info(`qq chat message ${m_qq_msg.message_text}`)
    await bot_instance.broadcast_mc_message(`[来自群聊] <${m_qq_msg.sender_name}> ${m_qq_msg.message_text}`)
    // await bot_instance.send_mc_message(`say ${m_qq_msg.message_text}`)
})

KyaruBot.on_mc_log(/^<(?<name>.*?)> (?<message>.*)$/, async (bot_instance, m_mc_msg) => {
    logger.info(`player say ${m_mc_msg.matched_groups.message}`)
    await bot_instance.send_default_qqgroup_message(`<${m_mc_msg.matched_groups.name}>${m_mc_msg.matched_groups.message}`)
})

KyaruBot.on_mc_log(/^\[Not Secure] \[Server] (?<message>.*)$/, (bot_instance, m_mc_msg) => {
    logger.info(`receive server msg: ${m_mc_msg.matched_groups.message}`)
})

KyaruBot.do_event_loop()