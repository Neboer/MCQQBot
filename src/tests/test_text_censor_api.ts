import TextCensorAPI from "../BaiduAIAPI/TextCensorAPI";
import {load_config} from "../load_config";

const config = load_config()
const BigBrother = new TextCensorAPI(config.baidu_api.client_id, config.baidu_api.client_secret, config.baidu_api.access_token)

async function test_api() {
    console.log(JSON.stringify(
        await BigBrother.censor_text('这是一条合理合法的消息。')
    ))

    console.log(JSON.stringify(
        await BigBrother.censor_text('傻逼，草你吗，司马东西')
    ))
}

test_api()