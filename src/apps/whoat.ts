import { cfg } from '@/config'
import { WhoAtType } from '@/types/types'
import { isAtLeast, refreshRkey } from '@/utils/common'
import { karin, logger, redis, segment } from 'node-karin'

export const whoat = karin.command(/^#?谁(at|@|艾特)(我|ta|他|她|它)$/, async (e) => {
  const opt = await cfg.get('other')
  if (!opt.whoat) return e.reply('没有开启谁艾特我功能', { reply: true })
  let userId = e.userId
  const isMe = e.msg.match(/^#?谁(at|@|艾特)(我|ta|他|她|它)$/)![2] === '我'
  if (!isMe) userId = e.at[0]
  if (!userId) return e.reply('请艾特需要查询的对象', { reply: true })
  const data = JSON.parse(await redis.get(`Ling:at:${e.groupId}:${userId}`) || '[]') as WhoAtType
  const msg = []
  const d1 = data.filter(i => !isAtLeast(Date.now(), i.time, 1, 'days'))
  if (data.length === 0) return e.reply('没有人艾特过你哦~', { reply: true })
  for (const item of d1) {
    try {
      const elements = await e.bot.getMsg(e.contact, item.messageId)
      const index = elements.elements.findIndex((item) => item.type === 'longMsg')
      if (index !== -1) elements.elements.splice(index, 1)
      const img = elements.elements.filter((item) => item.type === 'image')
      if (img.length > 0) {
        for (const i of img) {
          i.file = await refreshRkey(e, i) || ''
        }
      }
      const face = elements.elements.find((item) => item.type === 'face')
      if (face) {
        (face.id as any) = String(face.id)
      }
      msg.unshift(segment.node(elements.sender.userId, elements.sender.nick, elements.elements))
    } catch (err) {
      logger.error(`获取消息id[${item}]的记录失败,跳过该消息\n${err}`)
      continue
    }
  }
  await e.bot.sendForwardMsg(e.contact, msg)
  await redis.set(`Ling:at:${e.groupId}:${userId}`, JSON.stringify(d1))
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
