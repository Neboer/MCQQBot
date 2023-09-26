import logger from "../bot/logging";
import MiraiConnection from "../bot/connection/mirai_connection";

const qq_c = new MiraiConnection("ws://10.0.0.4:5701")

async function test_qq() {
    while (true) {
        let message = await qq_c.read_qq_msg()
        console.log(JSON.stringify(message))
    }
}

test_qq()