import Adapter from '@/adapter'
import { Whoat } from '@/types/whoat'
import { other } from '@/utils/config'
import { Client } from 'icqq'
import { Elements, GroupMessage, karin, redis, segment } from 'node-karin'

export const whoat = karin.command(/^#?谁(at|@|艾特)(我|ta|他|她|它)$/, async (e) => {
  if (!other().whoat) return e.reply('没有开启谁艾特我功能', { reply: true })
  let userId = ''
  if (e.msg.includes('ta') || e.msg.includes('他') || e.msg.includes('她') || e.msg.includes('它')) {
    userId = e.at[0] || e.msg.replace(/^#?谁(at|@|艾特)(我|ta|他|她|它)$/, '').trim()
  } else userId = e.userId
  if (!userId) return e.reply('请艾特需要查询的对象', { reply: true })
  const data = JSON.parse(await redis.get(`Ling:at:${e.groupId}:${userId}`) || '[]') as Whoat
  if (data.length === 0) return e.reply('没有人艾特过你哦~', { reply: true })
  const list = []
  let url: string | undefined = ''
  for (const item of data) {
    const elements: Elements[] = [segment.text(String(item.time))]
    if (item.msg) elements.push(segment.text('\n' + item.msg))
    if (item.file) url = await refreshRkey(e, item.file)
    if (url) elements.push(segment.image(url))
    if (item.reply) elements.push(segment.reply(item.reply))
    list.push(segment.node(item.userId, item.nickname, elements))
  }
  e.bot.sendForwardMsg(e.contact, list)
}, { event: 'message.group' })

const refreshRkey = async (e: GroupMessage, file: string) => {
  if (e.bot.adapter.standard === 'icqq') return await (e.bot.super as Client).pickGroup(Number(e.groupId)).getPicUrl(segment.image(file))
  const url = new URL(file)
  url.protocol = "http:"
  const params = new URLSearchParams(url.search)
  const rkey = await new Adapter(e).getrkey('group')
  if (!rkey) {
    throw new Error('rkey不存在')
  }
  params.set('refresh', rkey.rkey)
  url.search = params.toString()
  return url.toString()
}
