import WebSocket, {OPEN} from 'ws'
import AsyncWebSocketConnection from "./async_ws";
import {QQGroupMsg, QQConfirmMsg, is_qqgroup_msg, is_confirm_msg, is_heartbeat_msg} from "../schema/cqhttp_msg";
import {EventEmitter} from 'events'
import logger from "../logging";
import {Counter, sleep} from "../utils";
import BasicConnection from "./basic_connection";
import {ClientRequestArgs} from "http";
import CancelablePromise from "cancelable-promise";

class CQHTTPMessageSendStateManager {
    // 每当一个消息被发送的时候，就需要调用本方法中的send_qq_message方法发送实际的消息。这个
    private current_message_id_counter: Counter = new Counter()
    private qq_connection: BasicConnection

    constructor(connection: BasicConnection) {
        this.qq_connection = connection
    }

    // 这个msg是不需要带echo字段的，这个Manager会自己处理回报消息的匹配问题。
    // 这个send_qq_message方法会一直阻塞，直到超时或消息返回。
    public async send_qq_message(msg: any, timeout_sec: number = 10): Promise<QQConfirmMsg> {
        msg.echo = this.current_message_id_counter.count()
        await this.qq_connection.must_send_json(msg)
        try {
            return (await this.qq_connection.async_once('CQ_confirm_msg_received', [msg.echo], timeout_sec * 1000))[0]
        } catch (e) {
            if (e.message == 'timeout') {
                throw new Error('CQHTTP CONFIRM TIMEOUT') // 重新发送一个错误。
            } else {
                throw e // 否则，将e抛出。
            }
        }
    }

    // 同步方法，用来通知send_qq_message可以结束了。
    public resolve_qq_confirm_msg(confirm_msg: QQConfirmMsg) {
        this.qq_connection.emit('CQ_confirm_msg_received', confirm_msg.echo, confirm_msg)
    }
}

export type CQHTTPMsg = QQGroupMsg | any

export default class CQHTTPConnection extends BasicConnection {
    private send_message_manager = new CQHTTPMessageSendStateManager(this)

    constructor(ws_uri: string, extra_options?: WebSocket.ClientOptions | ClientRequestArgs) {
        super(ws_uri, extra_options);
        this.router()
    }

    // 消息分为三类：消息回报、心跳包和其他消息。其他。其中有且仅有其他消息可以通过read_msg方法读取。
    private async router() {
        // 唯一收发包函数，根据不同的包，触发不同类型的事件。
        while (true) {
            const qq_message = await this.stream_read_json()
            if (is_confirm_msg(qq_message)) {
                logger.info('CQHTTPConnection recv qq reply msg')
                // 收到回调，确认消息。
                this.send_message_manager.resolve_qq_confirm_msg(qq_message)
            } else if (is_heartbeat_msg(qq_message)) {
                logger.debug('CQHTTPConnection recv qq heartbeat msg')
            } else {
                logger.info('CQHTTPConnection recv qq general msg')
                // 注意，当收到正确的消息时，CQ_msg_received消息会被触发。
                // 这个消息的处理方法有很多，是不是可以直接建立监听器来处理消息？
                this.emit('CQ_msg_received', qq_message)
            }
        }
    }

    public read_qq_msg(): CancelablePromise<CQHTTPMsg> {
        return this.async_once('CQ_msg_received').then(res => {
            return res[0]
        })
    }

    private static escape_cq_encoded_str(input_string: string): string {
        const replacements_table = {
            '&': '&amp;',
            '[': '&#91;',
            ']': '&#93;',
            ',': '&#44;'
        };

        return input_string.replace(/&\[],/g, match => replacements_table[match]);
    }

    public send_qq_group_msg(group_id: number, message: string, plain_text = true): Promise<QQConfirmMsg> {
        return this.send_message_manager.send_qq_message({
            action: "send_group_msg",
            params: {
                group_id,
                'message': plain_text ? CQHTTPConnection.escape_cq_encoded_str(message) : message
            }
        })
    }
}