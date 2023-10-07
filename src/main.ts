import Bot from "./bot/bot";
import logger from "./bot/logging";
import get_bot_version from "./version";
import TextBuilder from "./TextBuilder";
import bind_message_deliverer from "./bot_function/message_deliver";
import bind_state_reporter from "./bot_function/server_state_reporter";
import bind_session_reporter from "./bot_function/session_reporter";
import {load_config} from "./load_config";
import BotConfig from "./bot/BotConfig";
import BaiduTextFilter from "./baidu_text_filter";

const global_config = load_config()
const KyaruBot = new Bot(new BotConfig(global_config.bot))
const text_builder = new TextBuilder()

const ctx: any = {}
ctx.bot_version = get_bot_version()

const baidu_msg_filter = global_config.baidu_api.enable ?
    new BaiduTextFilter(global_config.baidu_api.client_id, global_config.baidu_api.client_secret, global_config.baidu_api.access_token) :
    null

// 绑定机器人的核心功能
bind_message_deliverer(KyaruBot, text_builder, baidu_msg_filter)
bind_state_reporter(KyaruBot, text_builder)
bind_session_reporter(KyaruBot, text_builder)

KyaruBot.on_qq_group_command("version", false, async (bot_instance, m_qq_msg) => {
    logger.info(`query bot version. current version is ${ctx.bot_version}`)
    await bot_instance.send_default_qqgroup_message(ctx.bot_version)
})

KyaruBot.on_qq_group_command("help", false, async (bot_instance, m_qq_msg) => {
    logger.info(`help packet`)
    await bot_instance.send_default_qqgroup_message(`#mc 查询当前在线人数\n#version 查询机器人版本\n#help 查看此帮助信息`)
})

KyaruBot.on_qq_group_command("neboer", false, async (bot_instance, m_qq_msg) => {
    logger.info(`help packet`)
    await bot_instance.send_default_qqgroup_message(`管理.彩蛋.触发Neboer`)
})

KyaruBot.run()




