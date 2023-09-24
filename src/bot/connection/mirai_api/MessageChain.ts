export interface QQMessage {
    type: string
}

export interface PlainTextQQMessage extends QQMessage {
    type: 'Plain',
    text: string
}

export interface SourceQQMessage extends QQMessage {
    type: 'Source'
    id: number
    time: number
}