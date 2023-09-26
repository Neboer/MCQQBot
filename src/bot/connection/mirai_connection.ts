import CancelablePromise from "cancelable-promise";
import BasicConnection from "./basic_connection";
import {Counter} from "../utils";
import logger from "../logging";
import {is_report_data, ReportData} from "./mirai_api/RecvMsg/RecvData/Report/ReportData";
import {RecvData} from "./mirai_api/RecvMsg/RecvData";
import {RecvMsg} from "./mirai_api/RecvMsg/RecvMsg";
import {is_session_data} from "./mirai_api/RecvMsg/RecvData/Session/SessionData";


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
    // msg是没有command和content.sessionKey的对象
    public async send_qq_message(msg: any, timeout_sec: number = 10): Promise<ReportData> {
        msg.syncId = this.current_message_id_counter.count()
        msg.content.sessionKey = this.session_key

        await this.qq_connection.must_send_json(msg)
        try {
            return (await this.qq_connection.async_once('mirai_confirm_msg_received', [msg.syncId], timeout_sec * 1000))[0]
        } catch (e) {
            if (e.message == 'timeout') {
                throw new Error('MIRAI CONFIRM TIMEOUT') // 重新发送一个错误。
            } else {
                throw e // 否则，将e抛出。
            }
        }
    }

    // 同步方法，用来通知send_qq_message可以结束了。
    public resolve_qq_sync_id(sync_id: number, report_msg: ReportData) {
        this.qq_connection.emit('mirai_confirm_msg_received', sync_id, report_msg)
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
        this.router()
    }

    private async router() {

        // 唯一收发包函数，根据不同的包，触发不同类型的事件。
        while (true) {
            const qq_message: RecvMsg = await this.stream_read_json()
            const msg_data: RecvData = qq_message.data
            // 检查收到的消息属于什么，首先检查它是不是Confirm。
            if (is_report_data(msg_data)) {
                logger.info(`MiraiConnection recv reply msg}`)
                // 收到回调，确认消息。
                this.send_message_manager.resolve_qq_sync_id(parseInt(qq_message.syncId), msg_data)
            } else if (is_session_data(msg_data)) {
                this.send_message_manager.update_session_key(msg_data.session)
            } else {
                // 不是确认消息，那可能是别的。
                logger.info('Mirai recv qq general msg')
                // 注意，当收到正确的消息时，CQ_msg_received消息会被触发。
                // 这个消息的处理方法有很多，是不是可以直接建立监听器来处理消息？
                this.emit('mirai_msg_received', msg_data)
            }
        }
    }

    public read_qq_msg(): CancelablePromise<RecvData> {
        return this.async_once('mirai_msg_received').then(res => {
            return res[0]
        })
    }

    public send_qq_group_msg(group_id: number, message: string): Promise<ReportData> {
        return this.send_message_manager.send_qq_message({
            command: "sendGroupMessage",
            subCommand: null,
            content: {
                target: group_id,
                messageChain: [
                    {
                        type: "Plain",
                        text: message
                    }
                ]
            }
        })
    }
}
