import { other } from '@/utils/config'
import { hooks, logger, redis } from 'node-karin'
import 'moment-timezone'

hooks.message.group(async (e, next) => {
  const cfg = other()
  if (e.at.length > 0 && cfg.whoat) {
    for (const id of e.at) {
      try {
        const data = JSON.parse(await redis.get(`Ling:at:${e.groupId}:${id}`) || '[]') as string[]
        data.push(e.messageId)
        await redis.set(`Ling:at:${e.groupId}:${id}`, JSON.stringify(data), { EX: 86400 })
      } catch (error) {
        logger.error(`设置Redis失败: ${error}`)
      }
    }
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
