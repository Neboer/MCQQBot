import BasicConnection from "./basic_connection";
import logger from "../logging";
import {MCMsg} from "../protocol/mc_servertap_msg";
import {EventEmitter} from "events";

export default class MCServerTapConnection extends BasicConnection {
    async wait_for_minecraft_log(): Promise<MCMsg> {
        return await this.must_read_json()
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
    }
}