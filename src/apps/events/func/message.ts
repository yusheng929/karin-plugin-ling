import { cfg } from '@/config'
import { WhoAtType } from '@/types/types'
import { dir } from '@/utils/dir'
import { GroupMessage, logger, redis } from 'node-karin'

/** 群聊上下班事件处理 */
export const commute = async (e: GroupMessage, next: () => Promise<void>) => {
  const opt = await cfg.get('other')
  if (opt.noWork.includes(e.groupId) && (!e.msg.includes('上班') && !e.msg.includes('下班'))) {
    return logger.debug(`[${dir.name}]群[${e.groupId}]处于下班状态,拦截消息`)
  }
  await next()
}
/** 谁艾特我 */
export const whoat = async (e: GroupMessage, next: () => Promise<void>) => {
  try {
    const opt = await cfg.get('other')
    if (opt.whoat) {
      if (e.at.length > 0) {
        for (const id of e.at) {
          const data = JSON.parse(await redis.get(`Ling:at:${e.groupId}:${id}`) || '[]') as WhoAtType
          data.push({ time: Date.now(), messageId: e.messageId })
          await redis.set(`Ling:at:${e.groupId}:${id}`, JSON.stringify(data), { EX: 86400 })
        }
      } else if (e.replyId) {
        const elem = await e.bot.getMsg(e.contact, e.replyId)
        const id = elem.sender.userId
        const data = JSON.parse(await redis.get(`Ling:at:${e.groupId}:${id}`) || '[]') as WhoAtType
        data.push({ time: Date.now(), messageId: e.messageId })
        await redis.set(`Ling:at:${e.groupId}:${id}`, JSON.stringify(data), { EX: 86400 })
      }
    }
  } catch (err) {
    logger.error(`[${dir.name}]谁艾特我记录失败`, err)
  } finally {
    await next()
  }
}
