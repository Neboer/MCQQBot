import Bot from "./bot/bot";
import {load_config} from "./bot/config";
import {MQQGroupMsg} from "./bot/mqq_msg";
import logger from "./bot/logging";
import MCServer from "./lighting_mc/minecraft_server";
import {PlayerOnlineState} from "./lighting_mc/serverPlayer";
import get_bot_version from "./version";


const bot_config = load_config()
const KyaruBot = new Bot(bot_config)
const LightingMCServer = new MCServer()

const ctx: any = {}
KyaruBot.get_mc_online_players().then(players => {
    LightingMCServer.updatePlayersListFromServerTap(players)
    ctx.bot_version = get_bot_version()
}).then(() => {

    KyaruBot.on_qq_group_chat(async (bot_instance: Bot, m_qq_msg: MQQGroupMsg) => {
        logger.info(`qq chat message ${m_qq_msg.message_text}`)
        await bot_instance.broadcast_mc_message(`[来自群聊] <${m_qq_msg.sender_name}> ${m_qq_msg.message_text}`)
    })

    KyaruBot.on_mc_log(/^<(?<name>.*?)> (?<message>.*)$/, async (bot_instance, m_mc_msg) => {
        logger.info(`player say ${m_mc_msg.matched_groups.message}`)
        await bot_instance.send_default_qqgroup_message(`<${m_mc_msg.matched_groups.name}> ${m_mc_msg.matched_groups.message}`)
    })

    KyaruBot.on_mc_log(/^UUID of player (?<name>.*?) is (?<uuid>.{36})$/, (bot_instance, m_mc_msg) => {
        logger.info(`uuid packet`)
        const just_login_user = LightingMCServer.player_login(m_mc_msg.matched_groups.name)
        just_login_user.uuid = m_mc_msg.matched_groups.uuid
    })

    KyaruBot.on_mc_log(/^(?<name>.*?)\[\/(?<ip_addr>.*?):\d+] logged in with entity id .*/, async (bot_instance, m_mc_msg) => {
        logger.info(`login packet`)
        const just_login_user = LightingMCServer.player_login(m_mc_msg.matched_groups.name)
        just_login_user.ip_addr = m_mc_msg.matched_groups.ip_addr
        await bot_instance.broadcast_mc_message(`欢迎${m_mc_msg.matched_groups.name}连接服务器`)
    })

    KyaruBot.on_mc_log(/^(?<name>.*?) issued server command: \/auth .*? (?<password>.*)$/, (bot_instance, m_mc_msg) => {
        logger.info(`auth packet`)
        let just_login_user = LightingMCServer.get_player_by_name(m_mc_msg.matched_groups.name)
        if (just_login_user) {
            just_login_user.password = m_mc_msg.matched_groups.password
        }
    })

    KyaruBot.on_mc_log(/^(?<name>.*?) joined the game/, async (bot_instance, m_mc_msg) => {
        logger.info(`join packet`)
        const just_login_user = LightingMCServer.player_login(m_mc_msg.matched_groups.name)
        just_login_user.state = PlayerOnlineState.login
        await bot_instance.send_default_qqgroup_message(`玩家${m_mc_msg.matched_groups.name}已登录`)
    })

    KyaruBot.on_mc_log(/^(?<name>.*?) lost connection/, async (bot_instance, m_mc_msg) => {
        logger.info(`lost connection packet`)
        if (LightingMCServer.player_logout(m_mc_msg.matched_groups.name)) {
            await bot_instance.send_default_qqgroup_message(`玩家${m_mc_msg.matched_groups.name}已下线`)
        }
    })

    KyaruBot.on_mc_log(/^(?<name>.*?) left the game$/, async (bot_instance, m_mc_msg) => {
        if (LightingMCServer.player_logout(m_mc_msg.matched_groups.name)) {
            await bot_instance.send_default_qqgroup_message(`玩家${m_mc_msg.matched_groups.name}已下线`)
        }
    })

    KyaruBot.on_qq_group_command("mc", false, async (bot_instance, m_qq_msg) => {
        logger.info(`query online players`)
        await bot_instance.send_default_qqgroup_message(
            `当前服务器总人数${LightingMCServer.players.length}：\n` +
            LightingMCServer.players.map(server_p => server_p.name).join('\n')
        )
    })

    KyaruBot.on_qq_group_command("version", false, async (bot_instance, m_qq_msg) => {
        logger.info(`query bot version. current version is ${ctx.bot_version}`)
        await bot_instance.send_default_qqgroup_message(ctx.bot_version)
    })

    KyaruBot.on_qq_group_command("help", false, async (bot_instance, m_qq_msg) => {
        logger.info(`help packet`)
        await bot_instance.send_default_qqgroup_message(`#mc 查询当前在线人数
        #version 查询机器人版本`)
    })

    return KyaruBot.run()
})




