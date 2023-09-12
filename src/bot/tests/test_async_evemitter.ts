import AsyncEventEmitter from "../lib/AsyncEventEmitter";
import {sleep} from "../utils";
import CancelablePromise from "cancelable-promise";

const s = new AsyncEventEmitter()
let p: CancelablePromise

async function waiter() {
    console.log("a")
    p = s.async_once("test_ev",true,[1])
    await p
    console.log("b")
}

async function emitter() {
    s.emit("test_ev")
    console.log("without 1")
    await sleep(1000)
    s.emit("test_ev", 1)
    console.log("with 1")
}

async function canceller() {
    await sleep(500)
    p.cancel()
}

waiter()
emitter()
// canceller()