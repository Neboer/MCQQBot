import {PlayerOnlineState, WaitingForLoginPlayer} from "./serverPlayer";
import OnlinePlayer from "../bot/schema/mcsvtap_api/OnlinePlayer";
import logger from "../bot/logging";
import Bot from "../bot/bot";

const login_timeout_sec = 10 // 玩家有10秒的时间登录

// 实现了防抖的逻辑。
// 防抖是怎么实现的？
export default class PlayerLoginManager {
    public players: WaitingForLoginPlayer[] = []
    private bot: Bot

    public get_player_by_name(name: string) {
        return this.players.find(v => v.name == name)
    }

    public remove_player_by_name(name: string) {
        this.players.forEach((value, index) => {
            if (value.name == name) {
                this.players.splice(index, 1)
                return
            }
        })
    }

    // 刷新控制玩家登录超时的计时器
    private refresh_player_login_timeout_timer(player: WaitingForLoginPlayer) {
        clearTimeout(player.login_timer)
        player.login_timer = setTimeout(() => {
            this.bot.emit_event('player_login_failed', player.name)
            this.remove_player_by_name(player.name)
        }, login_timeout_sec * 1000)
    }


    // 玩家尝试连接服务器。
    public player_connect(player_name: string) {
        const player = this.get_player_by_name(player_name)
        if (!player) {
            // 玩家不在存储区，说明玩家首次尝试连接服务器。
            const new_player = new WaitingForLoginPlayer(player_name)
            this.refresh_player_login_timeout_timer(new_player)
            this.players.push(new_player)
            this.bot.emit_event('player_login_connected', player_name)
        } else {
            this.refresh_player_login_timeout_timer(player)
            this.bot.emit_event('player_login_continued', player_name)
        }
    }

    // 玩家成功登录！
    public player_login(player_name: string) {
        this.bot.emit_event('player_login_success', player_name)
        const player = this.get_player_by_name(player_name)
        if (player) {
            clearTimeout(player.login_timer)
            this.remove_player_by_name(player_name)
        }
    }
}