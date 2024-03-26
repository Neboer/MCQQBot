// 用来报告用户登录登出，上线下线的消息事务。
// 用户上线报告、下线报告、连接报告
import Bot from "../bot/bot";
import logger from "../bot/logging";
import PlayerSessionManager from "../ServerSessionManager/minecraft_server";
import TextBuilder from "../TextBuilder";
import {MsgFilter} from "../bot/mc_msg_censorer";

// 过滤掉明显不正确的用户名。
function test_username(username: string): boolean {
    if (username.startsWith(`com.mojang.authlib.GameProfile@`)) return false
    else {
        // IPv4 地址的正则表达式
        const ipv4Regex = /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/;
        // IPv6 地址的正则表达式
        const ipv6Regex = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/;
        // 只有在值中既不含有ipv4地址，又不含有ipv6地址的时候，才会返回true。
        return !(ipv4Regex.test(username) || ipv6Regex.test(username))
    }
}

export default function bind_session_reporter(bot: Bot, text_builder: TextBuilder, msg_filter?: MsgFilter) {
    const player_session_manager = new PlayerSessionManager(bot)

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

    // 不处理此事件，机器人太吵了
    // bot.on_event('player_login_continued', (player_name) => {
    //     logger.info(`player_login_continued ${player_name}`)
    //     const broadcast_msg = text_builder.build_random_translate_str('玩家.登录.玩家登录超时广播', {name: player_name})
    //     bot.broadcast_mc_message(broadcast_msg)
    //     bot.send_default_qqgroup_message(broadcast_msg)
    // })

    bot.on_event('player_connected', (player_name: string) => {
        // 新玩家检测。
        if (test_username(player_name)) {
            logger.info(`player_connected ${player_name}`)
            // TODO: 新玩家检测
            const broadcast_msg = text_builder.build_random_translate_str('玩家.连接.老玩家连接广播', {name: player_name})
            bot.broadcast_mc_message(broadcast_msg)
            bot.send_default_qqgroup_message(broadcast_msg)
        } else {
            logger.info(`player_connected invalid username: ${player_name}`)
        }
    })

    bot.on_event('player_login_success', (player_name: string) => {
        if (test_username(player_name)) {
            logger.info(`player_login_success ${player_name}`)
            const broadcast_msg = text_builder.build_random_translate_str('玩家.登录.玩家登录广播', {name: player_name})
            bot.broadcast_mc_message(broadcast_msg)
            bot.send_default_qqgroup_message(broadcast_msg)
        } else {
            logger.info(`player_connected invalid username: ${player_name}`)
        }
    })

    bot.on_event('player_exit', (player_name: string) => {
        if (test_username(player_name)) {
            logger.info(`player_exit ${player_name}`)
            const broadcast_msg = text_builder.build_random_translate_str('玩家.登出.玩家登出广播', {name: player_name})
            bot.broadcast_mc_message(broadcast_msg)
            bot.send_default_qqgroup_message(broadcast_msg)
        } else {
            logger.info(`player_connected invalid username: ${player_name}`)
        }
    })
}
