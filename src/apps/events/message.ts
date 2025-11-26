import { cfg } from '@/config'
import { WhoAtType } from '@/types/types'
import { hooks, logger, redis } from 'node-karin'

hooks.message.group(async (e, next) => {
  const opt = await cfg.getOther()
  try {
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
    logger.error('艾特记录失败', err)
  }
  if (opt.noWork.includes(e.groupId) && (!e.msg.includes('上班') && !e.msg.includes('下班'))) { return logger.debug(`群[${e.groupId}]处于下班状态,拦截消息`) }
  next()
}, { priority: -Infinity })
