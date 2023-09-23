import CQHTTPConnection from "../bot/connection/cqhttp_connection";
import logger from "../bot/logging";

const qq_c = new CQHTTPConnection("ws://10.0.0.4:5701")

async function test_qq() {
    while (true) {
        let message = await qq_c.read_qq_msg()
        console.log(JSON.stringify(message))
    }
}

test_qq()