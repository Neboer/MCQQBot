import logger from "./logging";
import BotConfig from './BotConfig'
import { MQQGroupMsgFilter, QQ_MSG_CB } from "./qq_listener";
import { is_mc_msg } from "./schema/mc_servertap_msg";

import MCServerTapConnection from "./connection/mcsvtap_connection";
import MCServerTapAPI from "./connection/mcsvtap_api";

import QQListener from "./qq_listener";
import MCListener, { MC_MSG_CB } from "./mc_listener";
import OnlinePlayer from "./schema/mcsvtap_api/OnlinePlayer";
import CancelablePromise, { cancelable } from "cancelable-promise";
import MiraiConnection from "./connection/mirai_connection";
import { RecvData } from "./connection/mirai_api/RecvMsg/RecvData";
import { is_group_message_data } from "./connection/mirai_api/RecvMsg/RecvData/Message/GroupMessageData";
import { is_message_data } from "./connection/mirai_api/RecvMsg/RecvData/Message/MessageData";


export default class Bot {
    private qq_connection: MiraiConnection
    private mc_connection: MCServerTapConnection
    private mc_api: MCServerTapAPI
    public readonly bot_config: BotConfig

    private qq_listeners: QQListener[]
    private mc_listeners: MCListener[]

    private event_table: Map<string, (...args: any[]) => any>

    public async send_qqgroup_message(qq_group_id: number, message_text: string, plain_text = true) {
        return await this.qq_connection.send_qq_group_msg(qq_group_id, message_text)
    }

    public async send_default_qqgroup_message(message_text: string, plain_text = true) {
        return await this.send_qqgroup_message(this.bot_config.qq_group_id, message_text, plain_text)
    }

    public async send_mc_message(message_content: string) {
        return await this.mc_connection.send_minecraft_command(message_content)
    }

    public async broadcast_mc_message(message_content: string) {
        return await this.mc_api.broadcast_message(message_content)
    }

    public async get_mc_online_players(): Promise<OnlinePlayer[]> {
        return await this.mc_api.get_player_list()
    }

    // 将某条致命错误消息广播出去。
    public async emergency_broadcast_message_to_all(message_content: string) {
        return Promise.all([
            this.broadcast_mc_message(message_content).catch(reason => {
                logger.error(reason, `emergency_broadcast_message_to_all cannot broadcast to mc: ${reason}`)
        }),
            this.send_default_qqgroup_message(message_content).catch(reason => {
                logger.error(reason, `emergency_broadcast_message_to_all cannot broadcast to qq: ${reason}`)
            })
        ])
    }

    constructor(bot_config: BotConfig) {
        this.bot_config = bot_config
        this.qq_connection = new MiraiConnection(this.bot_config.mirai_ws_uri)
        this.mc_connection = new MCServerTapConnection(this.bot_config.get_servertap_ws_url(), this.bot_config.servertap_key)
        this.mc_api = new MCServerTapAPI(this.bot_config.get_servertap_api_url(), this.bot_config.servertap_key)
        this.qq_listeners = []
        this.mc_listeners = []
        this.event_table = new Map<string, (...args: any[]) => any>
        logger.info(`bot init`)
    }

    // 启动整个机器人的方法
    public async run() {
        logger.info("bot is starting...")
        let wait_qq_message: CancelablePromise<RecvData> = this.qq_connection.read_qq_msg()
        let wait_mc_message = this.mc_connection.read_mc_msg()
        while (true) {
            const incoming_packet = await Promise.race([wait_mc_message, wait_qq_message])
            if (is_mc_msg(incoming_packet)) {
                logger.info(`< mc: ${JSON.stringify(incoming_packet)}`)
                wait_mc_message = this.mc_connection.read_mc_msg()
                for (const current_mc_listener of this.mc_listeners) {
                    // 这个错误处理是针对mc消息处理函数出错的处理逻辑。
                    try {
                        await current_mc_listener.exec_on(this, incoming_packet)
                    } catch (e) {
                        // 如果在执行函数处理此事件时遇到了异常，产生的异常会被捕获，同时被紧急报告出来。
                        // 报告之前，别忘记先log一下。
                        logger.error(e, `a mc_listener exec_on runs error!`)
                        await this.emergency_broadcast_message_to_all(e.message)
                        // 不要怕，继续循环下一个（我们有操作是不是？
                    }
                }
            } else {
                // 不是mc消息，一定是qq消息！
                wait_qq_message = this.qq_connection.read_qq_msg()
                if (is_message_data(incoming_packet)) {
                    if (is_group_message_data(incoming_packet)) {
                        logger.info(`< qq group: ${JSON.stringify(incoming_packet)}`)
                        for (const current_qq_listener of this.qq_listeners) {
                            try {
                                await current_qq_listener.exec_on_group(this, incoming_packet)
                            } catch (e) {
                                // 如果在执行函数处理此事件时遇到了异常，产生的异常会被捕获，同时被紧急报告出来。
                                // 报告之前，别忘记先log一下。
                                logger.error(e, `a qq_listener exec_on_group runs error!`)
                                await this.emergency_broadcast_message_to_all(e.message)
                                // 不要怕，继续循环下一个（我们有操作是不是？
                            }
                        }
                    }
                } else {
                    logger.debug(`< unknown qq msg : ${JSON.stringify(incoming_packet)}`)
                }
            }
        }
    }

    public emit_event(event_name: string, ...args: any[]) {
        const func = this.event_table.get(event_name)
        if (func) func(...args)
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
        const filter_obj: MQQGroupMsgFilter = {
            group_id: this.bot_config.qq_group_id,
            sent_by_bot: false,
            is_command: true,
            command_name: command_name,
        }
        if (require_admin) filter_obj.admin_message = true

        this.qq_listeners.push(new QQListener(filter_obj, qq_command_cb))
    }

    // 使用方法：通过on_mc_log向机器人身上挂MC监听方法，方法接受一个正则表达式和回调，如果正则匹配则会传到回调函数的参数中。
    public on_mc_log(match_pattern: RegExp, mc_log_cb: MC_MSG_CB) {
        this.mc_listeners.push(new MCListener(match_pattern, mc_log_cb))
    }

    public on_event(event_name: string, event_handler: (...args: any[]) => any) {
        this.event_table.set(event_name, event_handler)
    }
}
