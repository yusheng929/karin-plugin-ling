import Adapter from '@/adapter'
import { other } from '@/utils/config'
import { karin, logger, redis, segment } from 'node-karin'

export const whoat = karin.command(/^#?谁(at|@|艾特)(我|ta|他|她|它)$/, async (e) => {
  if (!other().whoat) return e.reply('没有开启谁艾特我功能', { reply: true })
  let userId = ''
  if (e.msg.includes('ta') || e.msg.includes('他') || e.msg.includes('她') || e.msg.includes('它')) {
    userId = e.at[0] || e.msg.replace(/^#?谁(at|@|艾特)(我|ta|他|她|它)$/, '').trim()
  } else userId = e.userId
  if (!userId) return e.reply('请艾特需要查询的对象', { reply: true })
  const data = JSON.parse(await redis.get(`Ling:at:${e.groupId}:${userId}`) || '[]') as string[]
  if (data.length === 0) return e.reply('没有人艾特过你哦~', { reply: true })
  const list = []
  for (const item of data) {
    try {
      const elements = await e.bot.getMsg(e.contact, item)
      const img = elements.elements.filter((item) => item.type === 'image')
      if (img.length > 0) {
        for (const i of img) {
          i.file = await new Adapter(e).refreshRkey(i) || ''
        }
      }
      const face = elements.elements.find((item) => item.type === 'face')
      if (face) {
        (face.id as any) = String(face.id)
      }
      list.unshift(segment.node(elements.sender.userId, elements.sender.nick, elements.elements))
    } catch (err) {
      logger.error(`获取消息id[${item}]的记录失败,跳过该消息\n${err}`)
      continue
    }
  }
  e.bot.sendForwardMsg(e.contact, list)
}, { event: 'message.group' })

export const clearAt = karin.command(/^#?清除(艾特|@|at)(记录|数据)$/, async (e) => {
  const a = await redis.del(`Ling:at:${e.groupId}:${e.userId}`)
  if (a === 0) return e.reply('没有艾特记录,无法清除', { reply: true })
  e.reply('清除成功', { reply: true })
}, { event: 'message.group' })

export const clearAtAll = karin.command(/^#?清除(所有|全部)(艾特|@|at)(记录|数据)$/, async (e) => {
  const data = await redis.keys('Ling:at:*')
  for (const item of data) {
    await redis.del(item)
  }
  e.reply('清除成功', { reply: true })
}, { event: 'message.group', perm: 'master' })
