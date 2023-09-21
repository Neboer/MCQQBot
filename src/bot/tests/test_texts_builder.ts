import TextBuilder from "../../TextBuilder";

const tb = new TextBuilder()
const s = tb.build_random_translate_str('玩家.登出.玩家登出广播', {name: 'tester'})
const b = tb.build_random_translate_str('消息.转发MC消息到QQ', {name: 'tester', message: 'good'})
const c = tb.build_random_translate_str('管理.帮助', {})
console.log(c)