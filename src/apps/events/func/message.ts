import { cfg } from '@/config'
import { RequestResult, WhoAtType } from '@/types/types'
import { dir } from '@/utils/dir'
import { GroupMessage, logger, Message, redis } from 'node-karin'

type NextType = () => Promise<void>
/** 群聊上下班事件处理 */
export const commute = async (e: GroupMessage, next: NextType) => {
  const opt = await cfg.get('other')
  if (opt.noWork.includes(e.groupId) && (!e.msg.includes('上班') && !e.msg.includes('下班'))) {
    return logger.debug(`[${dir.name}]群[${e.groupId}]处于下班状态,拦截消息`)
  }
  return await next()
}
/** 谁艾特我 */
export const whoat = async (e: GroupMessage, next: NextType) => {
  try {
    const opt = await cfg.get('other')
    if (opt.whoat) {
      if (e.at.length > 0) {

        for (const id of e.at) {
          if (id === e.userId) continue
          const data = JSON.parse(await redis.get(`Ling:at:${e.groupId}:${id}`) || '[]') as WhoAtType
          data.push({ time: Date.now(), messageId: e.messageId })
          await redis.set(`Ling:at:${e.groupId}:${id}`, JSON.stringify(data), { EX: 86400 })
        }
      } else if (e.replyId) {
        const elem = await e.bot.getMsg(e.contact, e.replyId)
        const id = elem.sender.userId
        if (e.userId === id) return
        const data = JSON.parse(await redis.get(`Ling:at:${e.groupId}:${id}`) || '[]') as WhoAtType
        data.push({ time: Date.now(), messageId: e.messageId })
        await redis.set(`Ling:at:${e.groupId}:${id}`, JSON.stringify(data), { EX: 86400 })
      }
    }
  } catch (err) {
    logger.error(`[${dir.name}]谁艾特我记录失败`, err)
  } finally {
    return await next()
  }
}

/** 设置加群申请/好友申请/邀请加群结果 */
export const setRequestResult = async (e: Message, next: NextType) => {
  const reg = /^#?(同意|拒绝)(?::(.*))?$/
  const match = e.msg.match(reg)
  if (!match || !e.replyId) return await next()
  const action = match[1]
  const isAgree = action === '同意'
  const reason = match[2] || ''
  const Id = (await e.bot.getMsg(e.replyId)).sender.userId
  if (e.selfId !== Id) return await next()
  if (!e.isMaster) {
    if (e.isGroup) {
      if (!['owner', 'admin'].includes(e.sender.role)) {
        return await e.reply('暂无权限，仅群主或管理员可操作')
      }
    } else {
      return await e.reply('暂无权限，仅主人可操作')
    }
  }
  const key = `Ling:Request:${e.replyId}`
  const data = await redis.get(key)

  if (!data) return await next()

  logger.bot('info', e.selfId, logger.yellow(`[${dir.name}]处理申请结果`))
  const req: RequestResult = JSON.parse(data)
  let msg = `已${isAgree ? '同意' : '拒绝'}申请`
  switch (req.type) {
    case 'groupApply':
      await e.bot.setGroupApplyResult(req.flag, isAgree, reason)
      if (!isAgree && reason) msg += `\n拒绝理由: ${reason}`
      break
    case 'friendApply':
      await e.bot.setFriendApplyResult(req.flag, isAgree, reason)
      if (isAgree && reason) msg += `\n备注: ${reason}`
      break
    case 'groupInvite':
      await e.bot.setInvitedJoinGroupResult(req.flag, isAgree)
      break
    default:
      return await next()
  }

  await e.reply(msg)
  await redis.del(key)
  return true
}
