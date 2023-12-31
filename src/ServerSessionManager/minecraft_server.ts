import {PlayerOnlineState, ShimmeringPlayer} from "./serverPlayer";
import Bot from "../bot/bot";

const login_timeout_sec = 10 // 玩家有10秒的时间登录

// 实现了防抖的逻辑。
// 玩家x秒内连接和断开的行为都防抖。
// 如果玩家断开连接后立即连接，机器人不会报告玩家断开连接。
// PlayerSessionManager是玩家登录状态的判断器。它可以根据日志中提供的信息，以极高的鲁棒性表达玩家登录进行到哪个阶段了。
// 通过PlayerSessionManager的过滤，玩家的登录过程会变得更加清晰，对玩家登录状态的判断会更加准确。
export default class PlayerSessionManager {
    public players: ShimmeringPlayer[] = []
    private bot: Bot

    constructor(bot: Bot) {
        this.bot = bot
    }

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
    private refresh_player_login_timeout_timer(player: ShimmeringPlayer) {
        clearTimeout(player.timer)
        player.timer = setTimeout(() => {
            // 玩家登录后一段时间内没有操作，在机器人判断里超时。
            // 如果这个timer被执行，那么就说明玩家没有任何在尝试登录的操作，并且一定还在连接服务器。
            // 如果玩家已退出，player_exit会把此回调清空，不会执行。
            this.bot.emit_event('player_login_continued', player.name)
            this.refresh_player_login_timeout_timer(player)
            // this.remove_player_by_name(player.name)
        }, login_timeout_sec * 1000)
    }


    // 玩家尝试连接服务器。如果玩家正在登出，则立即取消玩家的登出状态，改为登录。
    public player_connect(player_name: string) {
        const player = this.get_player_by_name(player_name)
        if (!player) {
            // 玩家不在存储区，说明玩家首次尝试连接服务器。
            const new_player = new ShimmeringPlayer(player_name)
            this.refresh_player_login_timeout_timer(new_player)
            this.players.push(new_player)
            this.bot.emit_event('player_connected', player_name)
        } else if (player.state == PlayerOnlineState.connecting) {
            // 玩家已经在连接服务器的过程中。
            this.refresh_player_login_timeout_timer(player)
        } else if (player.state == PlayerOnlineState.disconnecting) {
            // 玩家在登出服务器的时候重新连接：取消玩家的登出状态，改为登录。
            clearTimeout(player.timer)
            player.state = PlayerOnlineState.connecting
            this.refresh_player_login_timeout_timer(player)
        }
    }

    // 玩家成功登录！这是最好的结局，说明玩家与服务器建立了稳定的连接。
    public player_login(player_name: string) {
        this.bot.emit_event('player_login_success', player_name)
        const player = this.get_player_by_name(player_name)
        if (player) {
            clearTimeout(player.timer)
            this.remove_player_by_name(player_name)
        }
    }

    // 玩家登录是防抖的，我们希望对玩家登出也防抖。
    // 若收到玩家一个断开连接的包，则表明玩家处于登出状态。收到再多的此玩家登出的包也不会刷新登出状态计时器，除非登录。
    // 注意登出防抖和登陆防抖在刷新策略上的区别。
    // 如果正在登出的玩家正在尝试登录（状态为connecting）则忽略。
    public player_exit(player_name: string) {
        const player = this.get_player_by_name(player_name)
        if (!player) {
            // 玩家不在存储区，说明玩家首次退出。
            const disconnecting_player = new ShimmeringPlayer(player_name, PlayerOnlineState.disconnecting)
            disconnecting_player.timer = setTimeout(() => {
                // 玩家在规定时间内没有切换状态到重新连接，说明玩家彻底断开。
                const maybe_player = this.get_player_by_name(player_name)
                if (maybe_player && maybe_player.state == PlayerOnlineState.disconnecting) {
                    // 玩家状态没有任何改变，说明在断开连接期间，玩家没有任何重连行为，宣判死刑——玩家已经断线。
                    // 为什么这么说？一旦玩家重连，玩家会被登录逻辑限制，如果玩家不重连，则会被退出逻辑限制。
                    this.bot.emit_event('player_exit', player_name)
                    this.remove_player_by_name(player_name)
                }
            }, login_timeout_sec * 1000)
            this.players.push(disconnecting_player)
        } else if (player.state == PlayerOnlineState.connecting) {
            this.bot.emit_event('player_exit', player_name)
            clearTimeout(player.timer)
            this.remove_player_by_name(player_name)
        }
        // 不用考虑任何剩余情况。
        // 如果玩家的状态是connecting，则在此期间发生的所有disconnect事件都可以忽略
        // 如果玩家的状态是disconnecting，那继续以第一个表示玩家断开连接的包为准开始计时，不需要刷新计时器。
    }
}