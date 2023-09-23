import AsyncBlockingQueue from "../bot/queue";
import {sleep} from "../bot/utils";

const q = new AsyncBlockingQueue<number>()

async function test_queue() {
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    await sleep(4000)
    q.enqueue(4)
}

async function test_dequeue() {
    while (true) {
        console.log("reading")
        const s = await q.dequeue()
        console.log(s)
    }
}

test_queue()
test_dequeue()
sleep(99999)