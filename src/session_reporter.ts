// 用来报告用户登录登出，上线下线的消息事务。
// 用户上线报告、下线报告、连接报告
import Bot from "./bot/bot";
import logger from "./bot/logging";
import PlayerLoginManager from "./lighting_mc/minecraft_server";

function bind_session_reporter(bot: Bot) {
    const player_login_manager = new PlayerLoginManager()

    // bind basic ev.
    bot.on_mc_log(/^UUID of player (?<name>.*?) is (?<uuid>.{36})$/, (bot_instance, m_mc_msg) => {
        logger.info(`uuid ${m_mc_msg.matched_groups.name}`)
        player_login_manager.player_connect(m_mc_msg.matched_groups.name)
    })

    bot.on_mc_log(/^(?<name>.*?)\[\/(?<ip_addr>.*?):\d+] logged in with entity id .*/, async (bot_instance, m_mc_msg) => {
        logger.info(`login ${m_mc_msg.matched_groups.name}`)
        player_login_manager.player_connect(m_mc_msg.matched_groups.name)
    })
}