import { karin, segment, common } from 'node-karin'
import { Edit, Config } from '#components'


export const ProhibitedWords = karin.command(/^#(添加|删除|查看|开启|关闭)(所有)?违禁词/, async (e) => {
if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) return e.reply('暂无权限，只有管理员才能操作')
let data = Config.GroupYaml
if (e.msg.includes('查看')) {
if (e.msg.includes('所有')) {
if (!e.isMaster) return e.reply('暂无权限，只有主人才能操作')
let msgs = []
for (const key in data) {
  if (data.hasOwnProperty(key)) {
    let type = data[key]['enable']
    let ruleid = data[key]['rule']
    let rule = ruleid == 0 ? '模糊拦截' : '精准拦截'
    let words = (data[key]['words']).join('\n')
    msgs.push([
    segment.text(`id: ${key}`),
    segment.text(`\n是否启用: ${type}`),
    segment.text(`\n拦截规则: ${rule}`),
    segment.text(`\n违禁词列表: \n${words}`),
    ])
  }
}
  const msg = common.makeForward(msgs, e.self_id, e.bot.account.name)
return await e.bot.sendForwardMessage(e.contact, msg)
}
let datas = e.group_id
datas = data[`${datas}`] ? e.group_id : 'default'
let rules = (data[`${datas}`] && data[`${datas}`]['words']) || ''
if (!rules) return e.reply('暂无违禁词')
let rule = rules.join('\n')
let msgs = []
let type = data[`${datas}`]['enable']
let types = data[`${datas}`]['rule']
let typess = types == 0 ? '模糊拦截' : '精准拦截'
msgs.push([segment.text(`是否启用: ${type}`)])
msgs.push([segment.text(`拦截规则: ${typess}`)])
msgs.push([segment.text(`违禁词: \n${rule}`)])
if (datas == 'default') msgs.unshift(segment.text(`当前群为配置违禁词，将使用默认违禁词`))
const msg = await common.makeForward(msgs, e.self_id, e.bot.account.name)
return await e.bot.sendForwardMessage(e.contact, msg)
}
if (e.msg.includes('开启')) {
let rules = data[`${e.group_id}`] || ''
if (!rules) await Edit.EditTest(e)
  return await Edit.EditSet(e, '已开启当前群违禁词拦截', '已经处于开启状态', `${e.group_id}.enable`, true, 'group')
  }
if (e.msg.includes('关闭')) {
let rules = data[`${e.group_id}`] || ''
if (!rules) await Edit.EditTest(e)
  return await Edit.EditSet(e, '已关闭当前群违禁词拦截', '已经处于关闭状态', `${e.group_id}.enable`, false, 'group')
  }
 let word = e.msg.replace(/#(添加|删除|查看|开启|关闭)(所有)?违禁词/, '').trim()
 if (!word) return e.reply('请带上违禁词')
  if (!e.isGroup) return e.reply('请在群聊中执行')
   let term = `${e.group_id}.words`
   let rules = data[`${e.group_id}`] || ''
 if (!rules) {
 await Edit.EditTest(e)
 }
  if (e.msg.includes('添加')) {
  return await Edit.EditAddend(e, '添加成功', '已经添加过了', term, word, 'group')
  }
  if (e.msg.includes('删除')) {
  return await Edit.EditRemove(e, '删除成功', '没有这个违禁词', term, word, 'group')
  }
}, { name: '违禁词', priority: '-1' })
export const DefaultProhibitedWords = karin.command(/^#(添加|删除|查看|开启|关闭)默认违禁词/, async (e) => {
let data = Config.GroupYaml
if (e.msg.includes('查看')) {
let rules = (data['default'] && data['default']['words']) || ''
if (!rules) return e.reply('暂无违禁词')
let rule = rules.join('\n')
let msgs = []
let type = data['default']['enable']
let types = data['default']['rule']
let typess = types == 0 ? '模糊拦截' : '精准拦截'
msgs.push([segment.text(`是否启用: ${type}`)])
msgs.push([segment.text(`拦截规则: ${typess}`)])
msgs.push([segment.text(`违禁词: \n${rule}`)])
const msg = await common.makeForward(msgs, e.self_id, e.bot.account.name)
return await e.bot.sendForwardMessage(e.contact, msg)
}
if (e.msg.includes('开启')) return await Edit.EditSet(e, '已开启默认违禁词拦截', '已经处于开启状态', 'default.enable', true, 'group')
if (e.msg.includes('关闭')) return await Edit.EditSet(e, '已关闭默认违禁词拦截', '已经处于关闭状态', 'default.enable', false, 'group')
 let word = e.msg.replace(/#(添加|删除|查看|开启|关闭)默认违禁词/, '').trim()
 if (!word) return e.reply('请带上违禁词')
  if (!e.isGroup) return e.reply('请在群聊中执行')
   let term = 'default.words'
  if (e.msg.includes('添加')) return await Edit.EditAddend(e, '添加成功', '已经添加过了', term, word, 'group')
  if (e.msg.includes('删除')) return await Edit.EditRemove(e, '删除成功', '没有这个违禁词', term, word, 'group')
}, { name: '全局违禁词', priority: '-1', permission: 'master' })