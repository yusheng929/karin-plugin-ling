import { isAdmin } from '@/utils/common'
import karin, { logger } from 'node-karin'

const aPath = '[group/honor]'
/**
 * 申请群头衔
 */
export const ApplyGroupTitle = karin.command(/^#(申请|我要)头衔/, async (e) => {
  if (!await isAdmin(e, true)) return false

  const title = e.msg.replace(/#(申请|我要)头衔/, '').trim()
  try {
    if (!title) {
      await e.bot.setGroupMemberTitle(e.groupId, e.userId, '')
      await e.reply('\n已经将你的头衔取消了~', { at: true })
      return true
    }

    await e.bot.setGroupMemberTitle(e.groupId, e.userId, title)
    await e.reply('\n换上了哦', { at: true })
    return true
  } catch (error) {
    await e.reply('\n未知原因❌', { at: true })
    logger.error(error)
    return true
  }
}, { name: aPath + '申请头衔', priority: -1, event: 'message.group' })

/**
 * 设置头衔
 */
export const setGroupTitle = karin.command(/^#设置头衔/, async (e) => {
  if (!await isAdmin(e, true)) return false
  const title = e.msg.replace(/#设置头衔/, '').trim()
  const userId = e.at[0]
  if (!userId) return await e.reply('请艾特需要修改头衔的用户')

  try {
    if (!title) {
      await e.bot.setGroupMemberTitle(e.groupId, userId, '')
      await e.reply(`已经将用户[${userId}]的头衔取消了`, { at: true })
      return true
    }
    await e.bot.setGroupMemberTitle(e.groupId, userId, title)
    await e.reply(`已经将用户[${userId}]的头衔设置为[${title}]`, { at: true })
    return true
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    logger.error(error)
    return true
  }
}, { name: aPath + '设置头衔', priority: -1, permission: 'master', event: 'message.group' })
