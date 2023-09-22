export interface TextCheckResult {
    log_id: number
    conclusion: string
    conclusionType: number
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