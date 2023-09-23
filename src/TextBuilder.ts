import {Eta} from "eta"
import {readFileSync} from "fs"
import {parse} from "yaml"
import {flattenObj} from "./bot/lib/FlattenObject";


// 组装字符串！
export default class TextBuilder {
    engine: Eta = new Eta({
        autoEscape: false
    })
    text_dict: { [key: string]: string[] }

    constructor() {
        const translate_file_content = readFileSync('config/strings.yaml', {encoding: 'utf-8'})
        this.text_dict = flattenObj(parse(translate_file_content))
    }

    build_random_translate_str(translate_index_str: string, render_obj: any = {}) {
        // 随机获得一个翻译字符喵！
        const all_reply_texts = this.text_dict[translate_index_str]
        if (all_reply_texts) {
            const reply_text = all_reply_texts[Math.floor(Math.random() * all_reply_texts.length)];
            const rendered_text = this.engine.renderString(reply_text, render_obj)
            // trim whitespace
            return rendered_text.trim()
        } else {
            throw new Error('no such index')
        }
    }
}
