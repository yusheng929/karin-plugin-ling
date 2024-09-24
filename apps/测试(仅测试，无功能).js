import { karin, segment, common, Cfg, YamlEditor } from 'node-karin'
import { Config } from '#components'
export const test = karin.command(/^测试/, async (e) => {
let Path = e.msg.replace(/测试/, '').trim()
e.reply('请发送文件', {at: true})
console.log(`${process.cwd()}`)
const event = await karin.ctx(e)
let file = JSON.parse(event.msg)
console.log(file)
console.log(file.type)
if (!(file.type === 'file')) return e.reply('未识别到文件，取消操作', {at: true})
}, { name: '测试', priority: '-1' })
