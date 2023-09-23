// 审查消息接口。
export interface MsgCheckResult {
    is_blocked: boolean
    block_reason?: string
}

export abstract class MsgFilter {
    public abstract check_msg(input_message: string): Promise<MsgCheckResult> ;
}