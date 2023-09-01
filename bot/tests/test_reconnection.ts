// test AsyncWebSocketConnection
import AsyncWebSocketConnection from "../connection/async_ws"
import BasicConnection from "../connection/basic_connection";


let a: BasicConnection = new BasicConnection("ws://localhost:4155")

async function test_read_2() {
    while (true) {
        let result = await a.must_read_json()
        console.log(`2 ${result}`)
        await a.must_send_json(result)
    }
}

async function test_read() {
    while (true) {
        let result = await a.must_read_json()
        console.log(`1 ${result}`)
    }
}

Promise.all([test_read_2(), test_read()])
