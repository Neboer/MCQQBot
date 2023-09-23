import BaiduAPI from "./BaiduAPI";
import {
    check_api_error_response,
    check_text_check_result_response,
    TextCheckResult
} from "./api_schema/text_censor_api_schema";
import logger from "../bot/logging";

const text_censor_endpoint = '/rest/2.0/solution/v1/text_censor/v2/user_defined'

export default class TextCensorAPI extends BaiduAPI {
    public async censor_text(input_text: string, allow_refresh = true): Promise<TextCheckResult> {
        const api_response = await this.post_form_api(text_censor_endpoint, {text: input_text})
        const res_data = await api_response.json()
        if (check_text_check_result_response(res_data)) {
            return res_data
        } else if (check_api_error_response(res_data)) {
            if (res_data.error_code == 110) {
                if (allow_refresh) {
                    // Access token invalid or no longer valid
                    logger.warn(`censor_text Access Token Invalid: ${JSON.stringify(res_data)}, refreshing...`)
                    await this.refresh_access_token()
                    return await this.censor_text(input_text, false)
                } else {
                    // 在不允许刷新的情况下刷新token了！这是怎么回事？！
                    throw new Error(`censor_text refresh access_token too many times!`)
                }
            } else {
                logger.error(`censor_text failed with error: ${res_data.error_code}: ${res_data.error_msg}`)
                throw new Error(`censor_text failed with unknown error`)
            }
        } else {
            throw new Error(`censor_text failed with unknown response ${JSON.stringify(res_data)}`)
        }
    }
}