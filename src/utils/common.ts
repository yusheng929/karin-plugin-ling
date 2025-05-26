import { karin, config, logger, GroupMessage } from 'node-karin'

/**
 * 给全部主人、管理员发送消息
 * @param selfId Bot的QQ号
 * @param message 消息内容
 */
export const sendToAllAdmin = async (selfId: string, message: Parameters<typeof karin.sendMsg>[2]
) => {
  const list = [...config.master(), ...config.admin()]
  const msgIds = []
  for (const id of list) {
    try {
      const contact = karin.contactFriend(id)
      const a = await karin.sendMsg(selfId, contact, message)
      msgIds.push(a.messageId)
    } catch (error) {
      logger.bot('info', selfId, `[${id}] 发送主动消息失败:`)
      logger.error(error)
    }
  }
  return msgIds
}

/**
 * @description 给第一个主人发送消息
 * @param selfId Bot的QQ号
 * @param message 消息内容
 */
export const sendToFirstAdmin = async (selfId: string, message: Parameters<typeof karin.sendMsg>[2]) => {
  const list = config.master()
  let master = list[0]
  if (master === 'console') {
    master = list[1]
  }
  try {
    const a = await karin.sendMaster(selfId, master, message)
    return a.messageId
  } catch (error) {
    logger.bot('info', selfId, `[${master}] 发送主动消息失败:`)
    logger.error(error)
  }
}

/**
 * @description 判断bot自身是否是群管理
 * @param e 群消息实例
 * @param owner 判断群主权限，默认false，为true则只判断群主权限，false判断管理员权限
 * @returns 返回true或者false
 */
export const isAdmin = async (e: GroupMessage, owner: boolean = false) => {
  const perm = ['owner']
  if (!owner) perm.push('admin')
  const info = await e.bot.getGroupMemberInfo(e.groupId, e.selfId)
  if (!(perm.includes(info.role))) {
    await e.reply(`权限不足,Bot不是${!owner ? '管理员' : '群主'}`)
    return false
  }
  return true
}

/**
 * @description 当前群是否存在某人
 * @param e 群消息实例
 * @param uid 目标用户id
 * @returns 返回false或者true
 */
export const GroupMemberExist = async (e: GroupMessage, uid: string) => {
  try {
    const res = await e.bot.getGroupMemberInfo(e.groupId, uid)
    if (!res) {
      await e.reply('该群不存在该用户', { reply: true })
      return false
    }
    return true
  } catch {
    await e.reply('该群不存在该用户', { reply: true })
    return false
  }
}

/**
 * @description 判断某人权限是否大于自己
 * @param e 群消息实例
 * @param uid 目标用户id
 */
export const JudgePerim = async (e: GroupMessage, uid: string) => {
  try {
    const permlist = {
      owner: 3,
      admin: 2,
      member: 1
    }
    const info = await e.bot.getGroupMemberInfo(e.groupId, uid)
    const selfInfo = await e.bot.getGroupMemberInfo(e.groupId, e.selfId)
    if (info.role === 'unknown' || selfInfo.role === 'unknown') {
      await e.reply('无法判断权限', { reply: true })
      return false
    }
    if (permlist[info.role] > permlist[selfInfo.role]) {
      await e.reply('这个人太强大了,做不到呜呜~(>_<)~', { reply: true })
      return false
    }
    return true
  } catch {
    await e.reply('该群不存在该用户', { reply: true })
    return false
  }
}
