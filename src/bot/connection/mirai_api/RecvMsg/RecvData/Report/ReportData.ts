import {RecvData} from "../../RecvData";

export interface ReportData extends RecvData {
    code: number
    msg: string // success或错误
    messageId?: number // 发送成功才有这个东西
}

export function is_report_data(msg: RecvData): msg is ReportData {
    return 'code' in msg && !('session' in msg)
}
