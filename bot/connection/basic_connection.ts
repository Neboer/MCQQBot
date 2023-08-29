// QQ连接和MC连接的基类，二者都从此类中衍生。
import AsyncWebSocketConnection from "./async_ws";
import {EventEmitter} from "events";
import WebSocket, {OPEN} from "ws";
import {sleep} from "../utils";
import {ClientRequestArgs} from "http";

export default class BasicConnection {
    protected ws_connection: AsyncWebSocketConnection
    protected readonly ws_uri: string
    protected current_message_id: number;
    protected bot_event_emitter: EventEmitter

    // 等待重新连接。如果已经连接，则不会等待，立即返回。
    protected wait_for_reconnection(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.ws_connection.readyState == OPEN) {
                resolve()
            } else {
                this.bot_event_emitter.once("cq_reconnected", () => {
                    resolve()
                })
            }
        })
    }

    protected async auto_reconnect() {
        while (true) {
            // 等5秒自动重连
            await sleep(5000)
            await this.ws_connection.wait_disconnect()
            this.ws_connection = new AsyncWebSocketConnection(this.ws_uri)
        }
    }

    public constructor(ws_uri: string, bot_event_emitter: EventEmitter, extra_options?: WebSocket.ClientOptions | ClientRequestArgs) {
        this.current_message_id = 0
        this.ws_uri = ws_uri
        this.bot_event_emitter = bot_event_emitter
        this.ws_connection = new AsyncWebSocketConnection(this.ws_uri, extra_options)
        this.auto_reconnect()
    }
}