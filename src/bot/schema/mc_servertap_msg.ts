export interface MCMsg {
    message: string
    timestampMillis: number
    loggerName: string
    level: string
}

export function is_mc_msg(raw_msg: any): raw_msg is MCMsg {
    try {
        return ('timestampMillis' in raw_msg)
    } catch (e) {
        return false
    }
}