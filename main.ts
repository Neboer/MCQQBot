import Bot from "./bot/bot";
import Config, {load_config} from "./bot/config";
import {MQQGroupMsg} from "./bot/mqq_msg";
import { default as Pino } from 'pino';


const logger = Pino();

const bot_config = load_config()
const mc_qq_bot = new Bot(bot_config)

mc_qq_bot.on_qq_group_chat((bot_instance: Bot, m_qq_msg: MQQGroupMsg) => {
    bot_instance.send_mc_message(m_qq_msg.message_text)
})