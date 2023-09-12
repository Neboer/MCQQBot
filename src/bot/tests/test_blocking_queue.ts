import AsyncBlockingQueue from "../queue";
import {sleep} from "../utils";

const q = new AsyncBlockingQueue<number>()

async function test_queue() {
    sleep(1000);
    q.enqueue(1)
    sleep(3000);
    q.enqueue(2)
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
sleep(999999)