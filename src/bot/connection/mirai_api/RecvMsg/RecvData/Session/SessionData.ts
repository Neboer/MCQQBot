import {RecvData} from "../../RecvData";

export interface SessionData extends RecvData {
    code: number
    session: string
}

export function is_session_data(msg: RecvData): msg is SessionData {
    return 'session' in msg
}
