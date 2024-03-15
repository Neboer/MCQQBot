import WebSocket, {CLOSED, CLOSING, OPEN} from "ws";
import {URL} from "url";
import {ClientRequestArgs} from "http";
import logger from "../logging";
import AsyncBlockingQueue from "../queue";

export default class AsyncWebSocketConnection extends WebSocket {
    private msg_buffer: AsyncBlockingQueue<string> = new AsyncBlockingQueue<string>()
    public readonly wait_disconnect: Promise<void> // 保留一个promise，一旦这个promise退出，则整个连接断开。

    constructor(address: string | URL, options?: WebSocket.ClientOptions | ClientRequestArgs) {
        super(address, options);

        this.on("message", msg => {
            this.msg_buffer.enqueue(msg.toString())
        })

        // 这个Promise与WebSocket对象共存亡。如果连接有任何断开的迹象，这个Promise会结束。
        // 这个Promise在结束的时候不会有任何返回值。
        this.wait_disconnect = new Promise(resolve => {
            // 如果在函数执行时，ws本身已经是在退出状态了，那么就不需要等待了，直接退出。
            if (this.readyState == CLOSED || this.readyState == CLOSING) {
                resolve()
                logger.info("connection closed!")
            } else {
                this.once("error", () => resolve())
                this.once("close", () => resolve())
            }
        })
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
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    // read_json现在只会唯一的返回消息buffer中的对象，或阻塞。
    async read_json(): Promise<any> {
        const next_message = await Promise.race([
            this.msg_buffer.dequeue(),
            this.wait_disconnect
        ])
        if (next_message) {
            try {
                return JSON.parse(next_message)
            } catch (e) {
                logger.error(e, `read_json: non-json message received ${next_message}.`)
            }
        } else {
            logger.error("read_json: connection closed.")
            throw new Error("connection closed")
        }
    }

    wait_connect(): Promise<void> {
        return new Promise(resolve => {
            if (this.readyState == OPEN) resolve()
            else {
                this.once("open", resolve)
            }
        })
    }
}