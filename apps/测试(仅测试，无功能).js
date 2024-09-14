import { karin, segment, common } from 'node-karin'
import { Config } from '#components'
// 仅用于开发者测试部分功能实现，无其他作用(请勿使用，后果自负)
export const test = karin.command(/^测试/, async (e) => {
let data = Config.GroupYaml
console.log(data)
let rules = data['114514']['words']
let rule = rules.join('\n')
console.log(rule)
let lsit = segment.text(rule)
console.log(lsit)
const msg = common.makeForward(lsit, e.self_id, e.bot.account.name)
await e.bot.sendForwardMessage(e.contact, msg)
}, { name: '测试', priority: '-1' })