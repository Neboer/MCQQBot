import CancelablePromise from "cancelable-promise";

// 这个无比复杂的sleep方法是可以取消的！
export function sleep(ms) {
    return new CancelablePromise((resolve, reject, onCancel) => {
        const timer = setTimeout(resolve, ms)
        onCancel(() => {
            clearTimeout(timer)
        })
    });
}

export function remove_ANSI_color(input_str: string): string {
    return input_str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
}

export class Counter {
    current_index: number = 0

    public count() {
        this.current_index++
        return this.current_index - 1
    }
}