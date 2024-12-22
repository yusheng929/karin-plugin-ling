import { karin, segment, common, KarinElement } from 'node-karin'
import { Config } from '@/components'

export const ProhibitedWords = karin.command(/^#查看(所有)?违禁词/, async (e) => {
  const data = Config.GroupYaml
  if (e.msg.includes('所有')) {
    if (!e.isMaster) {
      e.reply('暂无权限，只有主人才能操作')
      return false
    }
    const msgs = []
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const type = data[key]['enable']
        const time = data[key]['time']
        const bantype = data[key]['ban']
        const ruleid = data[key]['rule']
        const rule = ruleid == 0 ? '模糊拦截' : '精准拦截'
        const words = (data[key]['words']).join('\n')
        msgs.push([
          segment.text(`id: ${key}`),
          segment.text(`\n是否启用: ${type}`),
          segment.text(`\n拦截规则: ${rule}`),
          segment.text(`\n是否禁言: ${bantype}`),
          segment.text(`\n禁言时长: ${time}`),
          segment.text(`\n违禁词列表: \n${words}`),
        ])
      }
    }
    const msg = common.makeForward(msgs as unknown as KarinElement[], e.self_id, e.bot.account.name)
    await e.bot.sendForwardMessage(e.contact, msg)
    return true
  }
  let datas = e.group_id
  datas = data[`${datas}`] ? e.group_id : 'default'
  const rules = (data[`${datas}`] && data[`${datas}`]['words']) || ''
  if (!rules) {
    e.reply('暂无违禁词')
    return false
  }
  const rule = rules.join('\n')
  const msgs = []
  const type = data[`${datas}`]['enable']
  const bantype = data[`${datas}`]['ban']
  const time = data[`${datas}`]['time']
  const types = data[`${datas}`]['rule']
  const typess = types == 0 ? '模糊拦截' : '精准拦截'
  msgs.push([segment.text(`是否启用: ${type}`)])
  msgs.push([segment.text(`拦截规则: ${typess}`)])
  msgs.push([segment.text(`是否禁言: ${bantype}`)])
  msgs.push([segment.text(`禁言时长: ${time}`)])
  msgs.push([segment.text(`违禁词: \n${rule}`)])
  if (datas == 'default') msgs.unshift(segment.text('当前群为配置违禁词，将使用默认违禁词'))
  const msg = common.makeForward(msgs as unknown as KarinElement[], e.self_id, e.bot.account.name)
  await e.bot.sendForwardMessage(e.contact, msg)
  return true
}, { name: '查看违禁词', priority: -1 })
