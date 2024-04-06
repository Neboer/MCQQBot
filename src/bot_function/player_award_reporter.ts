import Bot from "../bot/bot";
import TextBuilder from "../TextBuilder";

export default function bind_player_award_reporter(bot: Bot, text_builder: TextBuilder) {
    bot.on_mc_log(/^(?<name>\w+?) has made the advancement \[(?<advancement>.*?)]$/, async (bot_instance, m_mc_msg) => {
        await bot_instance.send_default_qqgroup_message(text_builder.build_random_translate_str('玩家.进度.玩家达成进度', {
            name: m_mc_msg.matched_groups.name,
            advancement: m_mc_msg.matched_groups.advancement
        }))
    })

    bot.on_mc_log(/^(?<name>\w+?) has reached the goal \[(?<advancement>.*?)]$/, async (bot_instance, m_mc_msg) => {
        await bot_instance.send_default_qqgroup_message(text_builder.build_random_translate_str('玩家.进度.玩家达成目标', {
            name: m_mc_msg.matched_groups.name,
            advancement: m_mc_msg.matched_groups.advancement
        }))
    })

    // Neboer has completed the challenge [Return to Sender]
    bot.on_mc_log(/^(?<name>\w+?) has completed the challenge \[(?<advancement>.*?)]$/, async (bot_instance, m_mc_msg) => {
        await bot_instance.send_default_qqgroup_message(text_builder.build_random_translate_str('玩家.进度.玩家达成挑战', {
            name: m_mc_msg.matched_groups.name,
            advancement: m_mc_msg.matched_groups.advancement
        }))
    })
}
