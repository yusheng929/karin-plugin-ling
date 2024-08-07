import { karin, segment, common } from 'node-karin'

/**
 * 退群
 */
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
