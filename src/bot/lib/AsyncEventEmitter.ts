import EventEmitter from 'events';
import CancelablePromise from 'cancelable-promise';
import {Counter} from "../utils";

interface listener_record {
    reject_func: (reason?: any) => void
    listener_func: (...args: any[]) => void
    event_name: string
}

export default class AsyncEventEmitter extends EventEmitter {

    // async_once会检查触发事件的参数列表的前面几个项目是否与提供的expectedArgs相一致，如果一致则会触发，此时会返回除了一致的部分之外，其余的参数组成的列表，具体的例子可以参考README中的内容
    // 可能会抛出的异常：timeout
    async_once(event_name: string, expected_args?: any[], timeout_ms?: number): CancelablePromise<any[]> {
        let timer: NodeJS.Timeout | null = null

        return new CancelablePromise<any[]>((resolve, reject, onCancel) => {
            const handler = (...real_args: any[]) => {
                const match_result = this.match_arguments(real_args, expected_args)
                if (match_result != false) {
                    // 监听成功！准备把对应的消息resolve了吧！
                    this.removeListener(event_name, handler);
                    resolve(match_result as any[]);
                    // 那就没必要继续等待超时了吧
                    if (timer !== null) clearTimeout(timer)
                }
            };

            this.on(event_name, handler);

            if (timeout_ms !== undefined) {
                timer = setTimeout(() => {
                    this.removeListener(event_name, handler)
                    reject("timeout")
                }, timeout_ms)
            }

            onCancel(() => {
                this.removeListener(event_name, handler)
                if (timer !== null) clearTimeout(timer)
            })
        });
    }

    // 要么返回false，要么把剩余的、多余的参数列表返回。
    private match_arguments(real_args: any[], expected_args?: any[]): false | any[] {
        if (expected_args === undefined) {
            return real_args
        } else if (expected_args.length > real_args.length) {
            return false
        } else {
            expected_args.forEach((value, index) => {
                if (real_args[index] != value) {
                    return false
                }
            })
            return real_args.slice(expected_args.length)
        }
    }
}
