import {MCMsg} from "./schema/mc_servertap_msg";
import {remove_ANSI_color} from "./utils";

const LoggerName = {
    MinecraftServer: "net.minecraft.server.MinecraftServer",// 正常聊天记录出口
    network: {
        PlayerConnection: "net.minecraft.server.network.PlayerConnection",
        LoginListener: "net.minecraft.server.network.LoginListener"
    },
    players: {
        PlayerList: "net.minecraft.server.players.PlayerList"
    }
}

export class MMCMsg {
    message_no_color: string
    logger_name: string
    level: string
    matched_groups: any

    // matched_groups是传入的消息匹配结果。这个结果并不直接来自消息，而是需要匹配器提供表达式信息对消息的message解析后得到的。
    // 具体解析方法见mc_listener.ts
    constructor(msg: MCMsg, matched_groups: Object) {
        // servertap传递的mc日志带有ANSI颜色，这里对这些烦人的颜色代码集中过滤。
        // 过滤掉ANSI颜色并不影响对minecraft日志内容的识别，因为仅凭内容完全可以继续区分MC日志。
        this.message_no_color = remove_ANSI_color(msg.message)
        this.logger_name = msg.loggerName
        this.level = msg.level
        this.matched_groups = matched_groups
    }
}
