import { translateChinaNum } from '@/models/Number'
import { GroupMemberExist, isAdmin, JudgePerim } from '@/utils/common'
import karin, { config, logger } from 'node-karin'

/**
 * 全体禁言
 */
export const muteAll = karin.command(/^#全体(禁言|解禁)$/, async (e) => {
  if (!await isAdmin(e)) return false
  const isBan = /全体禁言/.test(e.msg)
  try {
    await e.bot.setGroupAllMute(e.groupId, isBan)
    await e.reply(`已${isBan ? '开启' : '关闭'}全体禁言`)
    return true
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    logger.error(error)
    return true
  }
}, { name: '全体禁言', priority: -1, perm: 'group.admin', event: 'message.group' })

/**
 * 设置/取消管理员
 */
export const setAdmin = karin.command(/^#(设置|取消)管理/, async (e) => {
  if (!await isAdmin(e, true)) return false
  const userId = e.at[0] || e.msg.replace(/#(设置|取消)管理/, '').trim()

  if (!userId || !(/\d{5,}/.test(userId))) {
    await e.reply('\n貌似这个QQ号不对哦~', { at: true })
    return true
  }

  try {
    const res = await e.bot.getGroupMemberInfo(e.groupId, userId)
    if (!res) {
      await e.reply('\n这个群好像没这个人', { at: true })
      return true
    }
  } catch {
    e.reply('\n这个群好像没这个人', { at: true })
    return true
  }

  const isSet = e.msg.includes('设置')

  try {
    await e.bot.setGroupAdmin(e.groupId, userId, isSet)
    await e.reply(`\n${isSet ? '设置' : '取消'}管理员成功`, { at: true })
    return true
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    logger.error(error)
    return true
  }
}, { name: '设置管理', priority: -1, permission: 'master', event: 'message.group' })

/**
 * 踢人
 */
export const kickMember = karin.command(/^#踢/, async (e) => {
  if (!await isAdmin(e)) return false
  const userId = e.at[0] || e.msg.replace(/#踢/, '').trim()

  if (!userId || !(/\d{5,}/.test(userId))) {
    await e.reply('\n貌似这个QQ号不对哦~', { at: true })
    return true
  }

  try {
    if (!await GroupMemberExist(e, userId)) return false
    if (!await JudgePerim(e, userId)) return false
    await e.bot.groupKickMember(e.groupId, userId)
    await e.reply(`\n已经将用户『${userId}』踢出群聊`, { at: true })
    return true
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    logger.error(error)
    return true
  }
}, { name: '踢', priority: -1, event: 'message.group', perm: 'group.admin' })

/**
 * 解禁
 */
export const UnBanMember = karin.command(/^#解禁/, async (e) => {
  if (!await isAdmin(e)) return false
  const userId = e.at[0] || e.msg.replace(/#解禁/, '').trim()

  if (!userId || !(/\d{5,}/.test(userId))) {
    await e.reply('\n貌似这个QQ号不对哦~', { at: true })
    return true
  }

  try {
    if (!await GroupMemberExist(e, userId)) return false
    if (!await JudgePerim(e, userId)) return false
    await e.bot.setGroupMute(e.groupId, userId, 0)
    await e.reply(`\n已经将用户『${userId}』解除禁言了`, { at: true })
    return true
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    logger.error(error)
    return true
  }
}, { name: '解禁', priority: -1, event: 'message.group', perm: 'group.admin' })

export const BanMember = karin.command(
  /^#禁言(\d+|[零一壹二两三四五六七八九十百千万亿]+)?(秒|分|分钟|时|小时|天)?/,
  async (e) => {
    if (!await isAdmin(e)) return false
    let userId = ''
    const Master = config.master()

    /** 存在at */
    if (e.at.length > 0) {
      userId = e.at[0]
    } else {
      e.reply('请艾特对方使用')
      return true
    }

    if (!userId || !(/\d{5,}/.test(userId))) {
      await e.reply('\n貌似这个QQ号不对哦~', { at: true })
      return true
    }
    if (Master.includes(userId)) {
      await e.reply('不能禁言主人', { at: true })
      return true
    }
    if (!await GroupMemberExist(e, userId)) return false
    if (!await JudgePerim(e, userId)) return false
    const match = e.msg.match(/^#禁言(\d+|[零一壹二两三四五六七八九十百千万亿]+)?(秒|分|分钟|时|小时|天)?/)
    if (match) {
      const timeStr = match[1] || 600
      const unit = match[2] || '秒'  // 默认为秒
      const time = translateChinaNum(timeStr.toString())
      let timeInSeconds

      switch (unit) {
        case '秒':
          timeInSeconds = time
          break
        case '分':
        case '分钟':
          timeInSeconds = time * 60
          break
        case '时':
        case '小时':
          timeInSeconds = time * 60 * 60
          break
        case '天':
          timeInSeconds = time * 60 * 60 * 24
          break
        default:
          timeInSeconds = time
      }
      e.bot.setGroupMute(e.groupId, userId, timeInSeconds)
      await e.reply(`\n已经将用户『${userId}』禁言了`, { at: true })
      return true
    }
    return false
  },
  { name: '禁言', priority: -1, event: 'message.group', perm: 'group.admin' }
)

// export const voteMute = karin.command(/^#投票禁言/, async (cxt) => {
//   const MuteTime = cxt.msg.replace('#投票禁言', '').trim() || 10
//   let userId
//   if (cxt.at.length > 0) {
//     userId = cxt.at[0]
//   } else {
//     cxt.reply('请艾特对方使用')
//     return true
//   }
//   return true
// }, { name: '投票禁言', priority: -1, event: 'message.group' })
