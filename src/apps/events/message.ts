import { other } from '@/utils/config'
import karin, { hooks, logger, redis, segment } from 'node-karin'
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

hooks.message.friend(async (e, next) => {
  const cfg = other()
  try {
    if (cfg.contactMaster.enable && e.replyId) {
      const value = JSON.parse(await redis.get(`Ling:ContactMaster:${e.replyId}`) || '{}') as { groupId: string, messageId: string, userId: string }
      if (Object.keys(value).length > 0) {
        const msgs = e.elements
        const index = msgs.findIndex(item => item.type === 'reply')
        if (index !== -1) msgs.splice(index, 1)
        const img = msgs.filter(item => item.type === 'image')
        if (img.length > 0) {
          img.forEach(item => {
            try {
              const url = new URL(item.file)
              item.file = 'http:' + url.href.substring(url.protocol.length)
            } catch (err) { }
          })
        }
        msgs.unshift(segment.text(`来自主人: ${e.userId} 的回复\n`))
        msgs.push(segment.reply(value.messageId))
        e.bot.sendMsg(karin.contactGroup(value.groupId), msgs)
        await redis.del(`Ling:ContactMaster:${e.replyId}`)
        await redis.del(`Ling:ContactMaster:cd:${value.userId}`)
        e.reply('已回复')
      }
    }
  } catch (err) {
    e.reply('回复错误')
    logger.error('联系主人回复失败', err)
  }
  next()
})

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
