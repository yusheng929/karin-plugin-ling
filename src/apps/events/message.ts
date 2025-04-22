import { other } from '@/utils/config'
import { hooks, logger, redis } from 'node-karin'
import 'moment-timezone'

hooks.message.group(async (e, next) => {
  const cfg = other()
  try {
    if (cfg.whoat) {
      if (e.at.length > 0) {
        for (const id of e.at) {
          const data = JSON.parse(await redis.get(`Ling:at:${e.groupId}:${id}`) || '[]') as string[]
          data.push(e.messageId)
          await redis.set(`Ling:at:${e.groupId}:${id}`, JSON.stringify(data), { EX: 86400 })
        }
      } else if (e.replyId) {
        const elem = await e.bot.getMsg(e.contact, e.replyId)
        const id = elem.sender.userId
        const data = JSON.parse(await redis.get(`Ling:at:${e.groupId}:${id}`) || '[]') as string[]
        data.push(e.messageId)
        await redis.set(`Ling:at:${e.groupId}:${id}`, JSON.stringify(data), { EX: 86400 })
      }
    }
  } catch (err) {
    logger.error('艾特记录失败', err)
  }
  if (cfg.noWork.includes(e.groupId) && (!e.msg.includes('上班') && !e.msg.includes('下班'))) { return logger.debug(`群[${e.groupId}]处于下班状态,拦截消息`) }
  next()
}, { priority: -Infinity })

hooks.sendMsg.message(async (_contact, elements, _retryCount, next) => {
  for (const data of elements) {
    const cfg = other()
    if (data.type === 'text') {
      if (cfg.msg_prefix) data.text = cfg.msg_prefix + data.text
      if (cfg.msg_suffix) data.text = data.text + cfg.msg_suffix
    }
  }
  next()
}, { priority: -Infinity })
