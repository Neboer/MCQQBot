import CancelablePromise from "cancelable-promise";
import BasicConnection from "./basic_connection";
import {Counter} from "../utils";
import {MiraiSendMsg, SendMessageContent} from "./mirai_api/SendMsg";
import {RecvConfirmMsg, is_confirm_msg} from "./mirai_api/RecvConfirmMsg";
import logger from "../logging";
import {MiraiRecvMsg} from "./mirai_api/RecvMsg";


class MiraiMessageSendStateManager {
    // 每当一个消息被发送的时候，就需要调用本方法中的send_qq_message方法发送实际的消息。这个
    private current_message_id_counter: Counter = new Counter()
    private qq_connection: BasicConnection

    protected session_key: string

    constructor(connection: BasicConnection) {
        this.qq_connection = connection
    }

    public update_session_key(key: string) {
        this.session_key = key
    }

    // 这个msg是不需要带echo字段的，这个Manager会自己处理回报消息的匹配问题。
    // 这个send_qq_message方法会一直阻塞，直到超时或消息返回。
    public async send_qq_message(command: string, message_content: SendMessageContent, timeout_sec: number = 10): Promise<QQConfirmMsg> {
        const message_to_send: MiraiSendMsg = {
            syncId: this.current_message_id_counter.count(),
            command: command,
            subCommand: null,
            content: message_content
        }
        await this.qq_connection.must_send_json(message_to_send)
        try {
            return (await this.qq_connection.async_once('mirai_confirm_msg_received', [message_to_send.syncId], timeout_sec * 1000))[0]
        } catch (e) {
            if (e.message == 'timeout') {
                throw new Error('MIRAI CONFIRM TIMEOUT') // 重新发送一个错误。
            } else {
                throw e // 否则，将e抛出。
            }
        }
    }

    // 同步方法，用来通知send_qq_message可以结束了。
    public resolve_qq_sync_id(sync_id: number, confirm_msg_data: RecvConfirmMsg) {
        this.qq_connection.emit('mirai_confirm_msg_received', sync_id, confirm_msg_data)
    }
}

export default class MiraiConnection extends BasicConnection {
    private send_message_manager: MiraiMessageSendStateManager

    constructor(ws_uri: string, verifyKey?: string) {
        if (verifyKey) {
            super(`${ws_uri}?verifyKey=${verifyKey}`)
        } else {
            super(ws_uri)
        }
        this.send_message_manager = new MiraiMessageSendStateManager(this)
    }

    private async router() {

        // 唯一收发包函数，根据不同的包，触发不同类型的事件。
        while (true) {
            const qq_message: MiraiRecvMsg = await this.stream_read_json()
            const msg_data: any = qq_message.data
            // 检查收到的消息属于什么，首先检查它是不是Confirm。
            if (is_confirm_msg(qq_message)) {
                logger.info(`MiraiConnection recv reply msg}`)
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

    public read_qq_msg(): CancelablePromise<MiraiRecvMsg> {
        return this.async_once('CQ_msg_received').then(res => {
            return res[0]
        })
    }

    public send_qq_group_msg(group_id: number, message: string, plain_text = true): Promise<QQConfirmMsg> {

    }
}
