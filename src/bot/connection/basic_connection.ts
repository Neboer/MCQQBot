// QQ连接和MC连接的基类，二者都从此类中衍生。
import AsyncWebSocketConnection from "./async_ws";
import WebSocket, {OPEN} from "ws";
import {sleep} from "../utils";
import {ClientRequestArgs} from "http";
import logger from "../logging";
import AsyncEventEmitter from "../lib/AsyncEventEmitter";
// import {EventEmitter} from "events";

export default class BasicConnection extends AsyncEventEmitter {
    protected ws_connection: AsyncWebSocketConnection
    protected readonly ws_uri: string
    protected readonly ws_options?: WebSocket.ClientOptions | ClientRequestArgs

    // 等待重新连接。如果已经连接，则不会等待，立即返回。
    protected wait_for_reconnection(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.ws_connection.readyState == OPEN) {
                resolve()
            } else {
                this.once("connection_reconnected", () => {
                    resolve()
                    logger.info("connection reconnected")
                })
            }
        })
    }


    protected async auto_reconnect() {
        // 自动重新连接的逻辑：
        // 两次连接间隔最少为5秒
        // 没有disconnect方法，在任何时候都必须重连！
        while (true) {
            try {
                if (this.ws_connection) delete this.ws_connection
                this.ws_connection = new AsyncWebSocketConnection(this.ws_uri, this.ws_options)
                this.ws_connection.once("open", () => {
                    logger.info(`connected to ${this.ws_uri}`)
                    this.emit("connection_reconnected")
                })
                logger.info(`trying to connect to ${this.ws_uri}`)
                // 至少重新等待5秒再重连。如果连接保持时间超过5秒，则立即重连。
                await Promise.all([sleep(5000), this.ws_connection.wait_disconnect])
            } catch (e) {
                logger.error(e, `failed to connected to ${this.ws_uri}, waiting for reconnection...`)
            }
            // await sleep(5000)
        }
    }

    public constructor(ws_uri: string, extra_options?: WebSocket.ClientOptions | ClientRequestArgs) {
        super()
        this.ws_uri = ws_uri
        this.ws_options = extra_options
        // this.ws_connection = new AsyncWebSocketConnection(this.ws_uri, extra_options)
        this.auto_reconnect()
    }

    public ping() {
        this.ws_connection.ping()
    }

    // 不管底层连接是否断开，这个函数一定会返回下一条json供顶层连接使用。
    // must_read_json变成buffer方法，消息读一个少一个。
    async stream_read_json() {
        while (true) {
            try {
                await this.wait_for_reconnection()
                return await this.ws_connection.read_json()
            } catch (e) {
                logger.error(`must_read_json get error: ${e}`)
            }
        }
    }

    public async must_send_json(data: any) {
        await this.wait_for_reconnection()
        return await this.ws_connection.send_json(data)
    }
}