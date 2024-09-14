import { karin, segment, common, level } from 'node-karin'
import { Edit, Config } from '#components'
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

export const QuitGroup = karin.command(/^#?退群/, async (e) => {
  const group_id = e.msg.replace(/#?退群/g, '').trim() || e.group_id

  try {
    await e.bot.GetGroupInfo(group_id)
  } catch (error) {
    await e.reply('\n你好像没加入这个群', { at: true })
    return true
  }

  try {
    if (group_id === e.group_id) {
      await e.reply('3秒后退出本群聊')
      await common.sleep(3000)
      await e.bot.LeaveGroup(group_id)
    } else {
      await e.reply(`已退出群聊『${group_id}』`)
    }

    return true
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    return true
  }
}, { name: '退群', priority: '-1', permission: 'master' })

/**
 * 看群头像
**/
export const SeeImg = karin.command(/^#(看|取)头像/, async (e) => {
  const userId = e.at.length ? e.at[0] : e.msg.replace(/#(看|取)头像/, '').trim()
  if (!userId) {
    await e.reply('请指定用户', { at: true })
    return true
  }

  const Img = e.bot.getAvatarUrl(userId, 640)
  await e.reply(segment.image(Img))
  return true
}, { name: '看头像', priority: '-1' })

/**
 * 看群头像
 */
export const SeeGroupImg = karin.command(/^#(看|取)群头像/, async (e) => {
  const group_id = e.msg.replace(/^#?(看|取)群头像/, '').trim() || e.group_id
  if (!group_id) return e.reply('请输入正确的群号')
  const Img = e.bot.getGroupAvatar(group_id, 640)
  await e.reply(segment.image(Img))
  return true
}, { name: '看群头像', priority: '-1' })

export const command = karin.command(/^#赞我$/, async e => {
  const key = `VoteUser:${e.user_id}`
  const time = await level.get(key)
  if (time) {
    //  检查是否为今天
    if (new Date().toDateString() === new Date(Number(time)).toDateString()) {
      e.reply(
        [
          segment.at(e.user_id, e.user_id),
          ' 今天已经赞过了o(￣▽￣)ｄ',
        ])
      return true
    }
  }

  let count = 10
  const res = await e.bot.VoteUser(e.user_id, 10)
  // 先点10次 看下是否成功
  if (res.status === 'ok') {
    // 继续尝试点10次
    try {
      const res = await e.bot.VoteUser(e.user_id, 10)
      if (res) count += 10
    } catch { }
  }

  if (!res) {
    await e.reply('点赞失败了o(╥﹏╥)o', { at: true })
    return true
  }

  // 成功后记录时间
  await level.set(key, Date.now())
  await e.reply(`\n已经成功为你点赞${count}次！`, { at: true })
  return true
}, { name: '赞我', priority: '-1' })
export const 群发 = karin.command(/^#群发/, async (e) => {
  let msg = e.msg.replace(/#群发/, '').trim()
  if (!msg && !e.reply_id) return e.reply('请带上需要发送的消息')
  if (!msg && e.reply_id) {
   let data = await e.bot.GetMessage(e.contact, e.reply_id)
   msg = data.elements[0].text
  }
  const elements = [
  segment.text(msg)
]
  let group_list = await e.bot.GetGroupList()
  let group_id_list = group_list.map(item => item.group_id)
  console.log(group_id_list)
 for (const group_id of group_id_list) {
   try {
      const contact = karin.contactGroup(group_id);
      await e.bot.SendMessage(contact, elements);
   } catch (error) { }
  }
  e.reply('发送完成')
  return true
}, { name: '群发', priority: '-1', permission: 'master' })
export const ProhibitedWords = karin.command(/^#(添加|删除|查看)(所有)?违禁词/, async (e) => {
if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) return e.reply('暂无权限，只有管理员才能操作')
if (e.msg.includes('查看')) {
let data = Config.GroupYaml
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
let rules = (data[`${e.group_id}`] && data[`${e.group_id}`]['words']) || ''
if (!rules) return e.reply('暂无违禁词')
let rule = rules.join('\n')
let msgs = []
let type = data[`${e.group_id}`]['enable']
let types = data[`${e.group_id}`]['rule']
let typess = types == 0 ? '模糊拦截' : '精准拦截'
msgs.push([segment.text(`是否启用: ${type}`)])
msgs.push([segment.text(`拦截规则: ${typess}`)])
msgs.push([segment.text(`违禁词: \n${rule}`)])
const msg = await common.makeForward(msgs, e.self_id, e.bot.account.name)
return await e.bot.sendForwardMessage(e.contact, msg)
}
 let word = e.msg.replace(/#(添加|删除|查看)(所有)?违禁词/, '').trim()
 if (!word) return e.reply('请带上违禁词')
  if (!e.isGroup) return e.reply('请在群聊中执行')
   let term = `${e.group_id}.words`
   let data = Config.GroupYaml
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
export const DefaultProhibitedWords = karin.command(/^#全局(添加|删除|查看)违禁词/, async (e) => {
if (e.msg.includes('查看')) {
let data = Config.GroupYaml
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
 let word = e.msg.replace(/#全局(添加|删除|查看)违禁词/, '').trim()
 if (!word) return e.reply('请带上违禁词')
  if (!e.isGroup) return e.reply('请在群聊中执行')
   let term = 'default.words'
   let data = Config.GroupYaml
   let rules = data['default'] || ''
 if (!rules) {
 await Edit.EditTest(e)
 }
  if (e.msg.includes('添加')) {
  return await Edit.EditAddend(e, '添加成功', '已经添加过了', term, word, 'group')
  }
  if (e.msg.includes('删除')) {
  return await Edit.EditRemove(e, '删除成功', '没有这个违禁词', term, word, 'group')
  }
}, { name: '全局违禁词', priority: '-1', permission: 'master' })
