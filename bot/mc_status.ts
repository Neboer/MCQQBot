class MCStatus {
    server_online: boolean
    online_players: string[]

    player_join(player_id: string) {
        this.online_players.join(player_id)
    }

    player_quit(play_id: string) {
        let target_player_index = this.online_players.indexOf(play_id)
        delete this.online_players[target_player_index]
    }

    player_count(){
        return this.online_players.length
    }
}