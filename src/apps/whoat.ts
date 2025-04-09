import { Whoat } from '@/types/whoat'
import { other } from '@/utils/config'
import { Elements, karin, redis, segment } from 'node-karin'

export const whoat = karin.command(/^#?谁(at|@|艾特)(我|ta|他|她|它)$/, async (e) => {
  if (!other().whoat) return e.reply('没有开启谁艾特我功能', { reply: true })
  const data = JSON.parse(await redis.get(`Ling:at:${e.groupId}:${e.userId}`) || '[]') as Whoat
  if (data.length === 0) return e.reply('没有艾特过你哦~', { reply: true })
  const list = []
  for (const item of data) {
    const elements: Elements[] = [segment.text(String(item.time))]
    if (item.msg) elements.push(segment.text('\n' + item.msg))
    if (item.img) elements.push(segment.image(item.img))
    list.push(segment.node(item.userId, item.nickname, elements))
  }
  e.bot.sendForwardMsg(e.contact, list)
}, { event: 'message.group' })
