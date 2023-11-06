import {MsgCheckResult, MsgFilter} from "./bot/mc_msg_censorer";
import TextCensorAPI from "./BaiduAIAPI/TextCensorAPI";
import {ConclusionType, TextCheckResult} from "./BaiduAIAPI/api_schema/text_censor_api_schema";
import logger from "./bot/logging";

export default class BaiduTextFilter extends MsgFilter {
    baidu_text_censor_api: TextCensorAPI

    constructor(client_id: string, client_secret: string, access_token?: string) {
        super();
        this.baidu_text_censor_api = new TextCensorAPI(client_id, client_secret, access_token)
    }

    private build_report_str_from_check_result(check_result: TextCheckResult): string {
        // 只接受疑似或明确违规的消息。
        const severity = (check_result.conclusionType == ConclusionType.NonCompliant) ? '不合规' : '疑似违规'
        // 没有弄清汇报消息的具体结构，没有办法很好的序列化，就不序列化了。
        // const report_objects = check_result.data.map(text_censor_report => {
        //     const hit_string = text_censor_report.hits.map(hit => hit.words.join('&')).join('，')
        //     return `${text_censor_report.conclusion}: ${hit_string}`
        // }).join('、')
        return severity
    }

    public async check_msg(input_message: string): Promise<MsgCheckResult> {
        let api_reply: TextCheckResult = null
        try {
            api_reply = await this.baidu_text_censor_api.censor_text(input_message)
        } catch (e) {
            logger.error(`BaiduTextFilter Baidu API Error! ${e}`)
        }
        if (api_reply != null && (api_reply.conclusionType == ConclusionType.Compliant || api_reply.conclusionType == ConclusionType.AuditFailure)) {
            // 合规或审核失败的，放行。审核不通过的，拦截。审核失败的，因为请求失败等原因失败的，拦截，否则放行。
            logger.info(`BaiduTextFilter check_msg allow ${input_message}`)
            return {
                is_blocked: false
            }
        } else {
            logger.warn(`BaiduTextFilter check_msg disallow ${input_message}, reason: ${JSON.stringify(api_reply)}`)
            return {
                is_blocked: true,
                block_reason: this.build_report_str_from_check_result(api_reply)
            }
        }

    }
}