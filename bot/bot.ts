import WebSocket from 'ws'
import Config from './config'
import {sleep} from "./utils";
import {MQQGroupMsg} from "./mqq_msg";
import {is_qqgroup_msg, QQGroupMsg} from './protocol/cqhttp_msg';
import {MQQGroupMsgFilter, QQ_MSG_CB} from "./qq_listener";
import QQListener from "./qq_listener";
import CQHTTPConnection from "./connection/cqhttp_connection";
import MCServerTapConnection from "./connection/mcsvtap_connection";
import {EventEmitter} from "events";
import MCListener, {MC_MSG_CB} from "./mc_listener";
import {is_mc_msg} from "./protocol/mc_servertap_msg";
import logger from "./logging";


export default class Bot {
    private qq_connection: CQHTTPConnection
    private mc_connection: MCServerTapConnection
    public readonly bot_config: Config

    private qq_listeners: QQListener[]
    private mc_listeners: MCListener[]

    private readonly event_emitter: EventEmitter

    public async send_qqgroup_message(qq_group_id: number, message_text: string) {
        return this.qq_connection.send_qq_group_msg(qq_group_id, message_text)
    }

    public async send_default_qqgroup_message(message_text: string) {
        return await this.qq_connection.send_qq_group_msg(this.bot_config.qq_group_id, message_text)
    }

    public async send_mc_message(message_content: string) {
        return await this.mc_connection.send_minecraft_command(message_content)
    }

    constructor(bot_config: Config) {
        this.bot_config = bot_config
        this.qq_connection = new CQHTTPConnection(this.bot_config.cqhttp_ws_uri)
        this.mc_connection = new MCServerTapConnection(this.bot_config.servertap_ws_uri, this.bot_config.servertap_key)
        this.qq_listeners = []
        this.mc_listeners = []
        logger.info(`bot init`)
    }

    // 启动整个机器人的方法
    public async do_event_loop() {
        logger.info("bot is starting...")
        let wait_qq_message = this.qq_connection.wait_for_group_message()
        let wait_mc_message = this.mc_connection.wait_for_minecraft_log()
        while (true) {
            const incoming_packet = await Promise.race([wait_mc_message, wait_qq_message])
            // const incoming_packet = await this.qq_connection.wait_for_group_message()
            if (is_qqgroup_msg(incoming_packet)) {
                wait_qq_message = this.qq_connection.wait_for_group_message()
                logger.info(`< qq: ${JSON.stringify(incoming_packet)}`)
                this.qq_listeners.forEach(current_qq_listener => {
                    current_qq_listener.exec_on(this, incoming_packet)
                })
            } else if (is_mc_msg(incoming_packet)) {
                wait_mc_message = this.mc_connection.wait_for_minecraft_log()
                logger.info(`< mc: ${JSON.stringify(incoming_packet)}`)
                this.mc_listeners.forEach(current_mc_listener => {
                    current_mc_listener.exec_on(this, incoming_packet)
                })
            } else {
                logger.debug("unknown packet received, ignore.")
            }
        }
    }

    // below is the listener binder of the bot
    // 使用方法：通过on_qq_group_chat/on_qq_group_command向机器人身上挂方法，实现监听。
    public on_qq_group_chat(qq_chat_cb: QQ_MSG_CB) {
        this.qq_listeners.push(new QQListener({
            is_command: false,
            sent_by_bot: false,
            group_id: this.bot_config.qq_group_id
        }, qq_chat_cb))
    }

    public on_qq_group_command(command_name: string, require_admin: boolean, qq_command_cb: QQ_MSG_CB) {
        this.qq_listeners.push(new QQListener({
            group_id: this.bot_config.qq_bot_id,
            sent_by_bot: false,
            is_command: true,
            command_name: command_name,
            admin_message: require_admin
        }, qq_command_cb))
    }

    // 使用方法：通过on_mc_log向机器人身上挂MC监听方法，方法接受一个正则表达式和回调，如果正则匹配则会传到回调函数的参数中。
    public on_mc_log(match_pattern: RegExp, mc_log_cb: MC_MSG_CB) {
        this.mc_listeners.push(new MCListener(match_pattern, mc_log_cb))
    }
}
