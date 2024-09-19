import { karin, segment, common, Cfg, YamlEditor } from 'node-karin'
import { Config } from '#components'
export const test = karin.command(/^测试/, async (e) => {
let data = await e.bot.GetGroupList()

let msgs = []
let match = 1
console.log(msgs)
if (msgs.length === 0) console.log('1')
data.forEach(item => {
  let group_id = item.group_id
  let group_name = item.group_name
  msgs[0].push(segment.text(`\n${match}.${group_name}(${group_id})`))
  match++
})
const msg = await common.makeForward(msgs, e.self_id, e.bot.account.name)
  return await e.bot.sendForwardMessage(e.contact, msg)

}, { name: '测试', priority: '-1' })
