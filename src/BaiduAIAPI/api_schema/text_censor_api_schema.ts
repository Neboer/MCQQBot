export enum Conclusion {
    Compliant = "合规",
    NonCompliant = "不合规",
    Suspected = "疑似",
    AuditFailure = "审核失败",
}

export enum ConclusionType {
    Compliant = 1,
    NonCompliant = 2,
    Suspected = 3,
    AuditFailure = 4,
}


export interface TextCheckResult {
    log_id: number
    conclusion: Conclusion
    conclusionType: ConclusionType
    data: TextCensorReport[]
}

export interface TextCensorReport {
    type: number
    subType: number
    conclusion: string
    conclusionType: number
    msg: string
    hits: Hit[]
}

export interface Hit {
    datasetName: string
    words: string[]
}

export interface APIErrorResponse {
    log_id?: number
    error_code: number
    error_msg: string
}

export function check_text_check_result_response(data: any): data is TextCheckResult {
    return 'conclusion' in data
}

export function check_api_error_response(data: any): data is APIErrorResponse {
    return 'error_code' in data
}