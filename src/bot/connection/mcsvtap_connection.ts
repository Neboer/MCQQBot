import BasicConnection from "./basic_connection";
import logger from "../logging";
import {MCMsg} from "../schema/mc_servertap_msg";
import {EventEmitter} from "events";

export default class MCServerTapConnection extends BasicConnection {
    async read_mc_msg(): Promise<MCMsg> {
        return await this.stream_read_json()
    }

    async send_minecraft_command(command: string) {
        return await this.must_send_json(command)
    }

    constructor(ws_uri: string, servertap_key: string) {
        super(ws_uri, {
            headers: {
                "Cookie": `x-servertap-key=${servertap_key}`
            }
        });
        // servertap连接30秒无响应会自动断开，因此每隔10秒发个ping。
        setInterval(() => {
            this.ping()
            logger.debug("ping packet sent")
        }, 10000)
    }
}