import {ServerPlayer, PlayerOnlineState} from "./serverPlayer";
import OnlinePlayer from "../bot/schema/mcsvtap_api/OnlinePlayer";
import logger from "../bot/logging";

export default class MCServer {
    public players: ServerPlayer[] = []

    public get_player_by_name(name: string) {
        return this.players.find(v => v.name == name)
    }

    public player_login(name: string): ServerPlayer {
        const player_found = this.get_player_by_name(name)
        if (player_found) {
            return player_found
        } else {
            const new_player = new ServerPlayer(name)
            this.players.push(new_player)
            return new_player
        }
    }

    public player_logout(name: string): boolean {
        const player_index = this.players.findIndex(v => v.name == name)
        if (player_index > -1) {
            this.players.splice(player_index, 1)
            return true
        } else return false
    }

    // 根据serverTap GET /v1/players 返回的内容更新自己，是对监控API的一种校准。
    public updatePlayersListFromServerTap(svtap_response_data: OnlinePlayer[]): void {
        // 更新服务器的在线玩家列表，让其与svtap返回的结果一致。
        const player_index_to_delete: number[] = []
        this.players.forEach((server_p, index) => {
            if (!svtap_response_data.find(online_p => online_p.displayName == server_p.name)) {
                // 如果请求的玩家列表里没有玩家，说明列表中多了个玩家。
                player_index_to_delete.push(index)
                logger.warn(`extra player in server player list ${server_p.name}`)
            }
        })
        // 统一删除多余的玩家。
        player_index_to_delete.forEach(player_index_to_delete => {
            this.players.splice(player_index_to_delete, 1)
        })

        svtap_response_data.forEach((real_online_p) => {
            if (!this.get_player_by_name(real_online_p.displayName)) {
                // 我们的玩家列表缺少玩家，需要添加一个新玩家，赶紧登录一下。
                logger.warn(`missing player in server player list ${real_online_p.displayName}`)
                const current_player = this.player_login(real_online_p.displayName)
                current_player.state = PlayerOnlineState.login;
                current_player.ip_addr = real_online_p.address;
                current_player.uuid = real_online_p.uuid;
            }
        });
    }
}