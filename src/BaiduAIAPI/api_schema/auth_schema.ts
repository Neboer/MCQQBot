export interface AuthAPISuccessfulResponse {
    refresh_token: string
    expires_in: number
    session_key: string
    access_token: string
    scope: string
    session_secret: string
}

export function check_auth_api_successful(response: any): response is AuthAPISuccessfulResponse {
    return 'refresh_token' in response
}

export interface AuthAPIErrorResponse {
    error_description: string
    error: string
}

export function check_auth_api_failed(response: any): response is AuthAPIErrorResponse {
    return 'error' in response
}

export interface BaiduAPIConfig {
    client_id: string
    client_secret: string
    enable: string
    access_token: string
}
