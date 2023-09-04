import WebSocket, {OPEN} from 'ws'
import AsyncWebSocketConnection from "./async_ws";
import {QQGroupMsg, QQConfirmMsg, is_qqgroup_msg, is_confirm_msg} from "../schema/cqhttp_msg";
import {EventEmitter} from 'events'
import logger from "../logging";
import {sleep} from "../utils";
import BasicConnection from "./basic_connection";
import {ClientRequestArgs} from "http";


export default class CQHTTPConnection extends BasicConnection {
    private current_message_id: number

    constructor(ws_uri: string, extra_options?: WebSocket.ClientOptions | ClientRequestArgs) {
        super(ws_uri, extra_options);
        this.current_message_id = 0;
    }

    public async wait_for_group_message(): Promise<QQGroupMsg> {
        while (true) {
            let maybe_qq_msg = await this.must_read_json()
            if (is_qqgroup_msg(maybe_qq_msg)) {
                logger.debug(`< qq_msg:${JSON.stringify(maybe_qq_msg)}`)
                return maybe_qq_msg
            }
        }
    }

    private async wait_for_msg_reply(msg_id: number, timeout_ms: number) {
        let continue_wait = true
        const must_wait_reply = async (): Promise<any> => {
            while (continue_wait) {
                const maybe_reply: any = await this.must_read_json()
                if (is_confirm_msg(maybe_reply)) {
                    if (maybe_reply.echo == msg_id) return maybe_reply
                }
            }
        }
        // 是先超时，还是先收到准确的消息回复？当然，如果连接断开，异常抛出，那这个reply就别想等到了，直接退出吧。
        let wait_result = await Promise.race([sleep(timeout_ms), must_wait_reply()])
        continue_wait = false
        if (wait_result) return wait_result
        else {
            logger.error(`no reply for message ${msg_id}, timeout.`)
            return
        }
    }

    public async send_qq_group_msg(group_id: number, message: string): Promise<number> {
        const msg_id = this.current_message_id
        this.current_message_id++// 发送下一段消息的时候，使用更大的id。
        logger.info(`send to ${group_id} message: ${msg_id}。content: ${message}`)
        await this.must_send_json({
            action: "send_group_msg",
            params: {
                group_id,
                message
            },
            echo: msg_id
        })
        const reply = await this.wait_for_msg_reply(msg_id, 10000)
        // 如果reply为空，则消息发送报告超时。
        if (reply) {
            let confirm_msg: QQConfirmMsg = reply
            if (confirm_msg.status == "ok") {
                logger.info(`message ${msg_id} send successful`)
                return confirm_msg.data.message_id
            } else {
                logger.error(`message ${msg_id} send fail！Error:${confirm_msg.message}`)
                // 发送失败，账号是不是可能被风控了？
                throw new Error("CQHTTP REPLY TIMEOUT")
            }
        } else {
            logger.error(`message ${msg_id} wait for ticket timeout`)
            // throw new Error("message reply timeout")
        }
    }
}