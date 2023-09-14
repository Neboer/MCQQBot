export default function get_bot_version(): string {
    const pjson = require('../package.json');
    return pjson.version
}