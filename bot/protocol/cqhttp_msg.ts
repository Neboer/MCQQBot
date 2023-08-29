export interface QQGroupMsg {
    post_type: "message"
    message_type: "group"
    time: number
    self_id: number
    sub_type: "normal"
    group_id: number
    message_seq: number
    raw_message: string
    user_id: number
    anonymous: any
    font: number
    message: string
    sender: Sender
    message_id: number
}

export interface Sender {
    age: number
    area: string
    card: string
    level: string
    nickname: string
    role: string
    sex: string
    title: string
    user_id: number
}

export function is_qqgroup_msg(raw_msg: any): raw_msg is QQGroupMsg {
    return (
        raw_msg.post_type == "message" &&
        raw_msg.message_type == "group" &&
        raw_msg.sub_type == "normal"
    )
}

export interface QQConfirmMsg {
    "data": any
    "message": string,
    "retcode": number,
    "status": "ok" | "failed"
    "echo": any
}

export function is_confirm_msg(raw_msg: any): raw_msg is QQConfirmMsg {
    return "echo" in raw_msg
}

