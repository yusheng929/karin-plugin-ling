import { karin } from 'node-karin'
import { 编辑文件 } from '#lib'

export const 黑白名单 = karin.command(/^#(取消)?(拉黑|拉白)(群)?/, async (e) => {
  let id
  if (!e.msg.includes('群')) {
    id = e.at.length ? e.at[0] : e.msg.replace(/#(取消)?(拉黑|拉白)/, '').trim()
  } else {
    id = e.msg.replace(/#(取消)?(拉黑|拉白)群/, '').trim() || e.group_id
  }

  if (!id) return e.reply('请输入正确的账号')

  const type = e.msg.includes('拉白') ? 'White' : 'Black'
  const isRemoval = e.msg.includes('取消')
  const targetType = e.msg.includes('群') ? 'Group' : 'User'

  return await 编辑文件.编辑黑白名单(e, type, isRemoval, targetType, id)
}, { name: '取消拉黑拉白群', priority: '-1', permission: 'master' })
export const 撤回 = karin.command(/^#?撤回$/, async (e) => {
 if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
    await e.reply('暂无权限，只有管理员才能操作')
    return true
  }
  e.bot.RecallMessage(e.contact, e.reply_id)
  e.bot.RecallMessage(e.contact, e.message_id)
}, { name: '撤回', priority: '-1' })
export const 清屏撤回 = karin.command(/^#清屏(\d+)?/, async (e) => {
  if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
    await e.reply('暂无权限，只有管理员才能操作')
    return true
  }

  let match = e.msg.replace(/#清屏/, '').trim() || 50
  let msg_ids = await e.bot.GetHistoryMessage(e.contact, e.message_id, match)
  let msg_id_list = msg_ids.map(item => item.message_id)
 await e.reply('开始执行清屏操作，请确保我有管理员')
  for (const msg_id of msg_id_list) {
    await e.bot.RecallMessage(e.contact, msg_id)
  }
}, { name: '清屏', priority: '-1' })
