import { karin, segment, common, Cfg, YamlEditor } from 'node-karin'
import { Config } from '#components'
export const test = karin.command(/^测试/, async (e) => {
let msg = await e.bot.GetGroupList()
  console.log(msg)
}, { name: '测试', priority: '-1' })
