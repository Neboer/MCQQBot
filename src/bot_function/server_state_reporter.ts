// 用来告知用户服务器状态的。
import Bot from "../bot/bot";
import TextBuilder from "../TextBuilder";
import logger from "../bot/logging";

export default function bind_state_reporter(bot: Bot, text_builder: TextBuilder) {
    bot.on_qq_group_command("mc", false, async (bot_instance, m_qq_msg) => {
        logger.info(`mc: query online players`)
        bot_instance.get_mc_online_players().then(players => {
            bot_instance.send_default_qqgroup_message(
                text_builder.build_random_translate_str('状态.在线玩家',
                    players.map(p => p.displayName)), true)
        })
    })
}