import {MCMsg} from "./protocol/mc_servertap_msg";
import {AnyAaaaRecord} from "dns";

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
    message: string
    logger_name: string
    level: string
    matched_groups: any

    // matched_groups是传入的消息匹配结果。这个结果并不直接来自消息，而是需要匹配器提供表达式信息对消息的message解析后得到的。
    // 具体解析方法见mc_listener.ts
    constructor(msg: MCMsg, matched_groups: Object) {
        this.message = msg.message
        this.logger_name = msg.loggerName
        this.level = msg.level
        this.matched_groups = matched_groups
    }
}
