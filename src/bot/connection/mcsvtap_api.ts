import logger from "../logging";
import OnlinePlayer from "../schema/mcsvtap_api/OnlinePlayer";

export default class MCServerTapAPI {
    private readonly api_host: string
    private readonly api_key: string

    constructor(api_host: string, api_key: string) {
        // 如果apihost以/结尾，则删去这个/。
        if (api_host.endsWith('/')) this.api_host = api_host.substring(0, api_host.length - 1)
        this.api_host = api_host
        this.api_key = api_key
    }

    protected async post_form_api(endpoint: string, parameter_table: { [key: string]: string }) {
        let params = new URLSearchParams();
        for (let key in parameter_table)
            params.append(key, parameter_table[key]);
        return await fetch(`${this.api_host}${endpoint}`, {
            method: "POST",
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                "Cookie": `x-servertap-key=${this.api_key}`
            },
            redirect: "follow", // manual, *follow, error
            body: params
        });
    }

    protected async get_json_api(endpoint: string) {
        return await fetch(`${this.api_host}${endpoint}`, {
            method: "GET",
            headers: {
                'accept': 'application/json',
                "Cookie": `x-servertap-key=${this.api_key}`
            },
            redirect: "follow"
        })
    }

    public async broadcast_message(message_content: string) {
        const res = await this.post_form_api("/v1/chat/broadcast", {"message": message_content})
        if (res.status != 200) {
            logger.error(`broadcast failed! code ${res.status} ${res.statusText} error: ${JSON.stringify(await res.json())}`)
        }
    }

    public async get_player_list(): Promise<OnlinePlayer[]> {
        const res = await this.get_json_api("/v1/players")
        if (res.status != 200) {
            logger.error(`get player list failed! code ${res.status} ${res.statusText} error: ${JSON.stringify(await res.json())}`)
        }
        return (await res.json() as OnlinePlayer[])
    }
}