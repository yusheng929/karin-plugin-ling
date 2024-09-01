import { karin, segment, common, level } from 'node-karin'
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
  if (!msg) return e.reply('请带上需要发送的消息')
  const elements = [
  segment.text(msg)
]
  let group_list = await e.bot.GetGroupList()
  let group_id_list = group_list.map(item => item.group_id)
  console.log(group_id_list)
 for (const group_id of group_id_list) {
   const contact = karin.contactGroup(group_id)
    await e.bot.SendMessage(contact, elements)
  }
  e.reply('发送完成')
  return true
}, { name: '群发', priority: '-1', permission: 'master' })
