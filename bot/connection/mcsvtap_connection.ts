import BasicConnection from "./basic_connection";
import logger from "../logging";
import {MCMsg} from "../protocol/mc_servertap_msg";

export default class MCServerTapConnection extends BasicConnection {
    async wait_for_minecraft_log(): Promise<MCMsg> {
        await this.wait_for_reconnection()
        while (true) {
            try {
                return await this.ws_connection.read_json();
            } catch (e) {
                logger.error("等待消息失败：连接断开，等待连接恢复。")
                // 如果在等待过程中，连接退出，则等待重连后重传。
                await this.wait_for_reconnection()
            }
        }
    }
}