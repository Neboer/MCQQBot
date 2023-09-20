import { Eta } from "eta"
import { readFileSync } from "fs"
import { parse } from "yaml"

export type TranslateDoc = {[key: string]: TranslateDoc|string[]}

// 组装字符串！
class TextBuilder {
  engine: Eta = new Eta()
  msg_templates: TranslateDoc
  constructor() {
    const translate_file_content = readFileSync('../../config/string.yaml', {encoding: 'utf-8'})
    this.msg_templates = parse(translate_file_content)
  }

  get_translate_str() {
    
  }
}
