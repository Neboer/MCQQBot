// 用来报告用户登录登出，上线下线的消息事务。
// 用户上线报告、下线报告、连接报告
import Bot from "./bot/bot";
import logger from "./bot/logging";
import PlayerSessionManager from "./lighting_mc/minecraft_server";
import TextBuilder from "./TextBuilder";

export default function bind_session_reporter(bot: Bot, text_builder: TextBuilder) {
    const player_session_manager = new PlayerSessionManager()

    bot.on_mc_log(/^UUID of player (?<name>.*?) is (?<uuid>.{36})$/, (bot_instance, m_mc_msg) => {
        logger.info(`uuid ${m_mc_msg.matched_groups.name}`)
        player_session_manager.player_connect(m_mc_msg.matched_groups.name)
    })

    bot.on_mc_log(/^(?<name>.*?)\[\/(?<ip_addr>.*?):\d+] logged in with entity id .*/, async (bot_instance, m_mc_msg) => {
        logger.info(`login ${m_mc_msg.matched_groups.name}`)
        player_session_manager.player_connect(m_mc_msg.matched_groups.name)
    })

    bot.on_mc_log(/^(?<name>.*?) joined the game/, async (bot_instance, m_mc_msg) => {
        logger.info(`join ${m_mc_msg.matched_groups.name}`)
        player_session_manager.player_login(m_mc_msg.matched_groups.name)
    })

    bot.on_mc_log(/^(?<name>.*?) lost connection/, async (bot_instance, m_mc_msg) => {
        logger.info(`lost connection ${m_mc_msg.matched_groups.name}`)
        player_session_manager.player_exit(m_mc_msg.matched_groups.name)
    })

    bot.on_mc_log(/^(?<name>.*?) left the game$/, async (bot_instance, m_mc_msg) => {
        logger.info(`lost connection ${m_mc_msg.matched_groups.name}`)
        player_session_manager.player_exit(m_mc_msg.matched_groups.name)
    })

    bot.on_event('player_login_failed', (player_name) => {
        logger.info(`player_login_failed ${player_name}`)
        const broadcast_msg = text_builder.build_random_translate_str('玩家.登录.玩家登录失败广播', {name: player_name})
        bot.broadcast_mc_message(broadcast_msg)
        bot.send_default_qqgroup_message(broadcast_msg)
    })

    bot.on_event('player_connected', player_name => {
        logger.info(`player_connected ${player_name}`)
        const broadcast_msg = text_builder.build_random_translate_str('玩家.连接.老玩家连接广播', {name: player_name})
        bot.broadcast_mc_message(broadcast_msg)
        bot.send_default_qqgroup_message(broadcast_msg)
    })

    bot.on_event('player_login_success', player_name => {
        logger.info(`player_login_success ${player_name}`)
        const broadcast_msg = text_builder.build_random_translate_str('玩家.登录.玩家登录广播', {name: player_name})
        bot.broadcast_mc_message(broadcast_msg)
        bot.send_default_qqgroup_message(broadcast_msg)
    })

    bot.on_event('player_exit', player_name => {
        logger.info(`player_exit ${player_name}`)
        const broadcast_msg = text_builder.build_random_translate_str('玩家.登出.玩家登出广播', {name: player_name})
        bot.broadcast_mc_message(broadcast_msg)
        bot.send_default_qqgroup_message(broadcast_msg)
    })
}
