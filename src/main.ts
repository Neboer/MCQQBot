import Bot from "./bot/bot";
import {load_config} from "./bot/config";
import logger from "./bot/logging";
import get_bot_version from "./version";
import TextBuilder from "./TextBuilder";
import bind_message_deliverer from "./message_deliver";
import bind_state_reporter from "./server_state_reporter";
import bind_session_reporter from "./session_reporter";


const bot_config = load_config()
const KyaruBot = new Bot(bot_config)
const text_builder = new TextBuilder()

const ctx: any = {}
ctx.bot_version = get_bot_version()

// 绑定机器人的核心功能
bind_message_deliverer(KyaruBot, text_builder)
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

KyaruBot.run()





