import { karin, logger } from 'node-karin'

/**
 * 全体禁言
 */
export const muteAll = karin.command(/^#?全体(禁言|解禁)$/, async (e) => {
  /** 只有主人 群管理员可以使用 */
  if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
    await e.reply('暂无权限，只有管理员才能操作')
    return true
  }

  /** 检查bot自身是否为管理员、群主 */
  const info = await e.bot.GetGroupMemberInfo(e.group_id, e.self_id)
  if (!(['owner', 'admin'].includes(info.role))) {
    await e.reply('少女做不到呜呜~(>_<)~')
    return true
  }

  const isBan = /全体禁言/.test(e.msg)

  try {
    await e.bot.SetGroupWholeBan(e.group_id, isBan)
    await e.reply(`已${isBan ? '开启' : '关闭'}全体禁言`)
    return true
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    return true
  }
})

/**
 * 设置/取消管理员
 */
export const setAdmin = karin.command(/^#(设置|取消)管理$/, async (e) => {
  /** 只有主人可以使用 */
  if (!e.isMaster) {
    logger.warn(`[GroupAdmin] ${e.group_id}-${e.sender.user_id}(${e.sender.nick}) 无权限设置管理 已跳过`)
    return false
  }

  /** 只有bot为群主才可以使用 */
  const info = await e.bot.GetGroupMemberInfo(e.group_id, e.self_id)
  if (!(['owner'].includes(info.role))) {
    await e.reply('少女不是群主，做不到呜呜~(>_<)~')
    return true
  }

  let userId = ''

  /** 存在at */
  if (e.at.length) {
    userId = e.at[0]
  } else {
    userId = e.msg.replace(/#|(设置|取消)管理/, '').trim()
  }

  if (!userId || !(/\d{5,}/.test(userId))) {
    await e.reply('\n貌似这个QQ号不对哦~', { at: true })
    return true
  }

  try {
    const res = await e.bot.GetGroupMemberInfo(e.group_id, userId)
    if (!res) {
      await e.reply('\n这个群好像没这个人', { at: true })
      return true
    }
  } catch {
    return e.reply('\n这个群好像没这个人', { at: true })
  }

  const isSet = e.msg.includes('设置')

  try {
    await e.bot.SetGroupAdmin(e.group_id, userId, isSet)
    await e.reply(`\n${isSet ? '设置' : '取消'}管理员成功`, { at: true })
    return true
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    return true
  }
})

/**
 * 设置群头衔
 */
export const setGroupTitle = karin.command(/^#(申请|我要)头衔$/, async (e) => {
  /** 只有bot为群主才可以使用 */
  const info = await e.bot.GetGroupMemberInfo(e.group_id, e.self_id)
  if (!(['owner'].includes(info.role))) {
    await e.reply('少女不是群主，做不到呜呜~(>_<)~')
    return true
  }

  const title = e.msg.replace(/#(申请|我要)头衔/, '').trim()
  try {
    if (!title) {
      await e.bot.SetGroupUniqueTitle(e.group_id, e.user_id, title)
      await e.reply('\n已经将你的头衔取消了~', { at: true })
      return true
    }

    await e.bot.SetGroupUniqueTitle(e.group_id, e.user_id, title)
    await e.reply('\n换上了哦', { at: true })
    return true
  } catch (error) {
    await e.reply(`\n错误:\n${error.message}`, { at: true })
    return true
  }
})

/**
 * 踢人
 */
export const kickMember = karin.command(/^#踢$/, async (e) => {
  /** 只有主人、群主、管理员可以使用 */
  if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
    await e.reply('暂无权限，只有管理员才能操作')
    return true
  }

  let userId = ''

  /** 存在at */
  if (e.at.length) {
    userId = e.at[0]
  } else {
    userId = e.msg.replace(/#踢/g, '').trim()
  }

  if (!userId || !(/\d{5,}/.test(userId))) {
    await e.reply('\n貌似这个QQ号不对哦~', { at: true })
    return true
  }

  /** 检查bot自身是否为管理员、群主 */
  const info = await e.bot.GetGroupMemberInfo(e.group_id, e.self_id)
  if (!(['owner', 'admin'].includes(info.role))) {
    await e.reply('少女做不到呜呜~(>_<)~')
    return true
  }

  try {
    const res = await e.bot.GetGroupMemberInfo(e.group_id, userId)
    if (!res) {
      await e.reply('\n这个群好像没这个人', { at: true })
      return true
    }

    /** 检查对方的角色 */
    if (res.role === 'owner') {
      await e.reply('\n这个人是群主，少女做不到呜呜~(>_<)~', { at: true })
      return true
    }

    if (res.role === 'admin') {
      /** 需要是群主 */
      if (info.role !== 'owner') {
        await e.reply('\n这个人是管理员，少女做不到呜呜~(>_<)~', { at: true })
        return true
      }
    }
  } catch {
    return e.reply('\n这个群好像没这个人', { at: true })
  }

  try {
    await e.bot.KickMember(e.group_id, userId)
    await e.reply(`\n已经将用户『${userId}』踢出群聊`, { at: true })
    return true
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    return true
  }
})
