import {parse, stringify} from 'yaml'
import {readFileSync} from 'fs'
import logging from "./logging";
import logger from "./logging";

export default class Config {
    servertap_ws_uri: string
    cqhttp_ws_uri: string

    servertap_key: string

    qq_bot_id: number
    qq_group_id: number
    qq_admin_ids: number[]

    reconnect_interval: number
}

export function load_config(): Config {
    try {
        const file = readFileSync('./config/config.yaml', {encoding: "utf8"})
        return parse(file)
    } catch (e) {
        logger.fatal(e, "unable to find config file, error")
    }
}