export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function remove_ANSI_color(input_str: string): string {
    return input_str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
}