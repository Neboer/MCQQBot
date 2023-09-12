import {ServerPlayer, PlayerOnlineState} from "./serverPlayer";
import OnlinePlayer from "../../bot/schema/mcsvtap_api/OnlinePlayer";

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
            // delete this.players[player_index]
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
            }
        })
        // 统一删除多余的玩家。
        player_index_to_delete.forEach(player_index_to_delete => {
            this.players.splice(player_index_to_delete, 1)
            // delete this.players[player_index_to_delete]
        })

        svtap_response_data.forEach((playerData) => {
            if (!this.get_player_by_name(playerData.displayName)) {
                // 只有找不到时，才会添加。
                const current_player = this.player_login(playerData.displayName)
                current_player.state = PlayerOnlineState.login;
                current_player.ip_addr = playerData.address;
                current_player.uuid = playerData.uuid;
            }
        });
    }
}