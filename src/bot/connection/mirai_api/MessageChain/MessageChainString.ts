import {is_plain_text_qq_message, MessageChain, PlainTextQQMessage} from "./MessageChain";
export function is_plain_text_chain(chain: MessageChain) {
    return chain.every(msg =>
        msg.type in ['Source', 'Quote', 'At', 'AtAll', 'Plain']
    )
}

export function message_chain_to_string(chain: MessageChain) {
    return chain.map(msg => {
        if (msg.type == 'Source') return ''
        else if (is_plain_text_qq_message(msg)) return msg.text
        else return `[${msg.type}]`
    }).join('')
}

export function string_to_message_chain(input_str: string):MessageChain {
    return [{
        type: 'Plain',
        text: input_str
    } as PlainTextQQMessage]
}