import WebSocket, {CLOSED, CLOSING, OPEN} from "ws";
import {URL} from "url";
import {ClientRequestArgs} from "http";
import logger from "../logging";
import {resolve} from "dns";

export default class AsyncWebSocketConnection extends WebSocket {
    constructor(address: string | URL, options?: WebSocket.ClientOptions | ClientRequestArgs) {
        super(address, options);
    }

    // 别看这个函数叫做send_json，它一样也可以发送字符串
    async send_json(data: any): Promise<void> {
        return new Promise((resolve, reject) => {
            this.send(JSON.stringify(data), err => {
                if (err) {
                    reject()
                } else {
                    resolve()
                }
            })
            this.once("error", reject)
            this.once("close", reject)
        })
    }

    read_json(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.once("message", (ws_instance: WebSocket, data: string) => {
                let parsed_msg: any
                try {
                    parsed_msg = JSON.parse(data)
                } catch (e) {
                    reject(e)
                }
                resolve(parsed_msg)
            })
            this.once("error", reject)
            this.once("close", reject)
        })
    }

    wait_connect(): Promise<void> {
        return new Promise(resolve => {
            if (this.readyState == OPEN) resolve()
            else {
                this.once("open", resolve)
            }
        })
    }

    wait_disconnect(): Promise<void> {
        return new Promise(resolve => {
            if (this.readyState == CLOSED || this.readyState == CLOSING) {
                resolve()
            } else {
                this.once("error", resolve)
                this.once("close", resolve)
            }
        })
    }


}