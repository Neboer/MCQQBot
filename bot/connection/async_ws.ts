import WebSocket, {CLOSED, CLOSING, OPEN} from "ws";
import {URL} from "url";
import {ClientRequestArgs} from "http";
import logger from "../logging";
import {resolve} from "dns";
import logging from "../logging";
import {string} from "yaml/dist/schema/common/string";

export default class AsyncWebSocketConnection extends WebSocket {
    constructor(address: string | URL, options?: WebSocket.ClientOptions | ClientRequestArgs) {
        super(address, options);
    }


    // 别看这个函数叫做send_json，它一样也可以发送字符串
    async send_json(data: any): Promise<void> {
        return new Promise((resolve, reject) => {
            let message_str: string = ""
            if (typeof data === 'string') {
                message_str = data; // 如果是字符串，原样返回
            } else {
                message_str = JSON.stringify(data); // 如果不是字符串，使用 JSON.stringify 进行转换
            }
            this.send(message_str, err => {
                if (err) {
                    reject()
                } else {
                    resolve()
                }
                this.off("error", reject)
                this.off("close", reject)
            })
            this.once("error", reject)
            this.once("close", reject)
        })
    }

    read_json(): Promise<any> {
        return new Promise((resolve, reject) => {
            const on_message = (data: string) => {
                let parsed_msg: any
                try {
                    parsed_msg = JSON.parse(data)
                } catch (e) {
                    reject(e)
                }
                resolve(parsed_msg)
                this.off("error", reject)
                this.off("close", reject)
            }
            this.once("message", on_message)
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
                logger.info("connection closed!")
            } else {
                this.once("error", resolve)
                this.once("close", resolve)
            }
        })
    }
}