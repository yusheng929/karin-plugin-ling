import { karin, segment, common, Cfg, YamlEditor } from 'node-karin'
import { Config } from '#components'
import fs from 'fs'
import YAML from 'yaml' // 使用 yaml 包代替 js-yaml

// 仅用于开发者测试部分功能实现，无其他作用(请勿使用，后果自负)
export const test = karin.command(/^测试/, async (e) => {
  const data = fs.readFileSync('config/config/group.yaml', 'utf8')
  const msgs = YAML.parse(data)
  const Default = msgs.default
  const botKeys = Object.keys(msgs).filter(key => key.startsWith('Bot:'))
  
  let msg = []

  for (const key of botKeys) {
    if (key === 'Bot:self_id' || key === 'Bot:self_id:group_id') {
      continue
    }
    
    const rest = key.substring(4)
    
    if (rest.includes(':')) {
      let [id, group_id] = rest.split(':')
      let type = msgs[key].mode
      msg.push([
        segment.text(`Bot: ${id}`),
        segment.text(`\n群: ${group_id}`),
        segment.text(`\n前缀状态: ${type}`)
      ])
    } else {
      const id = rest
      let type = msgs[key].mode
      msg.push([
        segment.text(`Bot: ${id}`),
        segment.text(`\n群: 所有群`),
        segment.text(`\n前缀状态: ${type}`)
      ])
    }
  }

  msg.unshift([
    segment.text('全局默认配置:'),
    segment.text(`\n前缀状态: ${Default.mode === 0 ? "未开启" : Default.mode === 1 ? "已开启" : "未知"}`),
    segment.text(`\n前缀: \n${Default.alias}`)
  ])

  const msged = await common.makeForward(msg, e.self_id, e.bot.account.name)
  return await e.bot.sendForwardMessage(e.contact, msged)
}, { name: '测试', priority: '-1' })
