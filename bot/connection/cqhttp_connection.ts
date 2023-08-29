import {OPEN} from 'ws'
import AsyncWebSocketConnection from "./async_ws";
import {QQGroupMsg, QQConfirmMsg, is_qqgroup_msg, is_confirm_msg} from "../protocol/cqhttp_msg";
import {EventEmitter} from 'events'
import logger from "../logging";
import {sleep} from "../utils";
import BasicConnection from "./basic_connection";


export default class CQHTTPConnection extends BasicConnection {
    async wait_for_group_message(): Promise<QQGroupMsg> {
        await this.wait_for_reconnection()
        while (true) {
            try {
                let maybe_qq_msg = await this.ws_connection.read_json()
                if (is_qqgroup_msg(maybe_qq_msg)) {
                    return maybe_qq_msg
                }
            } catch (e) {
                logger.error("等待消息失败：连接断开，等待连接恢复。")
                // 如果在等待过程中，连接退出，则等待重连后重传。
                await this.wait_for_reconnection()
            }
        }
    }

    private async wait_for_msg_reply(msg_id: number, timeout_ms: number) {
        let continue_wait = true
        const must_wait_reply = async (): Promise<any> => {
            while (continue_wait) {
                const maybe_reply: any = await this.ws_connection.read_json()
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
            return
        }
    }

    public async send_qq_group_msg(group_id: number, message: string): Promise<number> {
        // 如果还在重连，那么就等等。
        await this.wait_for_reconnection()
        const msg_id = this.current_message_id
        this.current_message_id++// 发送下一段消息的时候，使用更大的id。
        logger.info(`正在准备向群组${group_id}发送消息${msg_id}。消息内容：${message}`)
        await this.ws_connection.send_json({
            action: "send_group_msg",
            params: {
                group_id,
                message
            },
            echo: msg_id
        })
        let reply = await this.wait_for_msg_reply(msg_id, 10000)
        // 如果reply为空，则消息发送报告超时。
        if (reply) {
            let confirm_msg: QQConfirmMsg = reply
            if (confirm_msg.status == "ok") {
                logger.info(`消息${msg_id}发送成功`)
                return confirm_msg.data.message_id
            } else {
                logger.error(`消息${msg_id}发送失败！错误:${confirm_msg.message}`)
                throw new Error(confirm_msg.message)
            }
        } else {
            logger.error(`消息${msg_id}等待发送报告超时`)
            throw new Error("message timeout")
        }
    }
}