import {readFileSync} from "fs";
import {parse} from "yaml";
import logger from "./bot/logging";
import BotConfig from "./bot/BotConfig";
import {BaiduAPIConfig} from "./BaiduAIAPI/api_schema/auth_schema";

export interface GlobalConfig {
    bot: BotConfig,
    baidu_api: BaiduAPIConfig
}

export function load_config(): GlobalConfig {
    try {
        const file = readFileSync('./config/config.yaml', {encoding: "utf8"})
        return parse(file)
    } catch (e) {
        logger.fatal(e, "unable to find config file, error")
    }
}