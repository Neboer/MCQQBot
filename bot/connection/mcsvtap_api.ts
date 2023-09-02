import {fetch} from "undici";

export default class MCServerTapAPI {
    private readonly api_host: string
    private readonly api_key: string

    constructor(api_host: string, api_key: string) {
        // 如果apihost以/结尾，则删去这个/。
        if (api_host.endsWith('/')) this.api_host = api_host.substring(0, api_host.length - 1)
        this.api_host = api_host
        this.api_key = api_key
    }

    protected async post_json_api(endpoint: string, data: Object) {
        return await fetch(`${this.api_host}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `x-servertap-key=${this.api_key}`
            },
            redirect: "follow", // manual, *follow, error
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        });
    }

    public async broadcast_message(message_content: string) {
        const res = await this.post_json_api("/v1/chat/broadcast", {"message": message_content})
        console.log(res)
    }
}