import CQHTTPConnection from "../connection/cqhttp_connection";

const qq_c = new CQHTTPConnection("ws://10.0.0.1:5701")

async function test_qq() {
    while (true) {
        let message = await qq_c.wait_for_group_message()
        console.log(JSON.stringify(message))
    }
}

test_qq()