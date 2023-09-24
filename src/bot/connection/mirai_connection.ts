import CancelablePromise from "cancelable-promise";
import {CQHTTPMsg} from "./cqhttp_connection";
import {QQConfirmMsg} from "../schema/cqhttp_msg";
import BasicConnection from "./basic_connection";
import {Counter} from "../utils";
import {SendMessageContent} from "./mirai_api/SendMsg";


class MiraiMessageSendStateManager {
    // 每当一个消息被发送的时候，就需要调用本方法中的send_qq_message方法发送实际的消息。这个
    private current_message_id_counter: Counter = new Counter()
    private qq_connection: BasicConnection

    protected session_key: string

    constructor(connection: BasicConnection) {
        this.qq_connection = connection
    }

    // 这个msg是不需要带echo字段的，这个Manager会自己处理回报消息的匹配问题。
    // 这个send_qq_message方法会一直阻塞，直到超时或消息返回。
    public async send_qq_message(command: string, message_content: SendMessageContent, timeout_sec: number = 10): Promise<QQConfirmMsg> {
        msg.echo = this.current_message_id_counter.count()
        await this.qq_connection.must_send_json(msg)
        try {
            return (await this.qq_connection.async_once('CQ_confirm_msg_received', [msg.echo], timeout_sec * 1000))[0]
        } catch (e) {
            if (e.message == 'timeout') {
                throw new Error('MIRAI CONFIRM TIMEOUT') // 重新发送一个错误。
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

export default class MiraiConnection extends BasicConnection {

    constructor(ws_uri: string, verifyKey?: string) {
        if (verifyKey) {
            super(`${ws_uri}?verifyKey=${verifyKey}`)
        } else {
            super(ws_uri)
        }
    }

    public read_qq_msg(): CancelablePromise<MiraiRecvMsg> {
        return this.stream_read_json()
    }

    public send_qq_group_msg(group_id: number, message: string, plain_text = true): Promise<QQConfirmMsg> {

    }
}