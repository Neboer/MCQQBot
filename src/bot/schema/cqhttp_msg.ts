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

// {"_post_method":2,"meta_event_type":"lifecycle","post_type":"meta_event","self_id":1963185901,"sub_type":"connect","time":1694136960}
// {"post_type":"meta_event","meta_event_type":"heartbeat","time":1694499520,"self_id":1963185901,"status":{"app_enabled":true,"app_good":true,"app_initialized":true,"good":true,"online":true,"plugins_good":null,"stat":{"packet_received":16912,"packet_sent":15032,"packet_lost":0,"message_received":943,"message_sent":868,"disconnect_times":0,"lost_times":0,"last_message_time":1694499334}},"interval":5000}

// 这并不是完整的定义，我们只是给出了一个简单的定义而已。
export interface QQHeartBeatMsg {
    post_type: "meta_event"
    meta_event_type: "heartbeat"
}

export function is_heartbeat_msg(raw_msg: any): raw_msg is QQHeartBeatMsg {
    return raw_msg.meta_event_type == "heartbeat"
}

export function is_confirm_msg(raw_msg: any): raw_msg is QQConfirmMsg {
    return "echo" in raw_msg
}

