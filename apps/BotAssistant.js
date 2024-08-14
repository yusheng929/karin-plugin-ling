import { karin, segment, common, level } from 'node-karin'

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
