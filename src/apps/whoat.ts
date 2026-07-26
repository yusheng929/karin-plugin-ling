import { cfg } from '@/config'
import { WhoAtType } from '@/types/types'
import { isAtLeast, refreshRkey } from '@/utils/common'
import { render } from '@/utils/render'
import { Elements, karin, logger, redis, segment } from 'node-karin'

/** 支持合并转发的协议 */
const SUPPORT_FORWARD = ['icqq', 'napcat', 'llonebot', 'lagrange', 'yogurt']

interface WhoAtRenderPart {
  type: 'text' | 'at' | 'image' | 'face' | 'placeholder'
  /** text/at/placeholder 的文本内容 */
  text?: string
  /** image/face 的图片地址 */
  url?: string
  /** 是否大表情 */
  big?: boolean
}

interface WhoAtRenderItem {
  nick: string
  /** 昵称首字符 头像加载失败时的兜底 */
  nickFirst: string
  avatar: string
  time: string
  parts: WhoAtRenderPart[]
}

/** 将消息元素转换为渲染用结构 */
const mapElement = (item: Elements): WhoAtRenderPart | null => {
  switch (item.type) {
    case 'text':
      return { type: 'text', text: item.text }
    case 'at':
      return { type: 'at', text: `@${item.name || item.targetId}` }
    case 'face':
      return {
        type: 'face',
        url: `https://koishi.js.org/QFace/assets/qq_emoji/${item.id}/png/${item.id}.png`,
        big: item.isBig,
      }
    case 'image':
      return { type: 'image', url: item.file }
    case 'reply':
    case 'longMsg':
      return null
    case 'video':
      return { type: 'placeholder', text: '[视频]' }
    case 'record':
      return { type: 'placeholder', text: '[语音]' }
    case 'file':
      return { type: 'placeholder', text: `[文件]${item.name || ''}` }
    case 'json':
    case 'xml':
    case 'share':
    case 'music':
      return { type: 'placeholder', text: '[卡片消息]' }
    default:
      return { type: 'placeholder', text: `[${item.type}]` }
  }
}

/** 格式化消息时间 当天显示 HH:mm 否则显示 MM-dd HH:mm */
const formatTime = (time: number) => {
  const d = new Date(time * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (d.toDateString() === new Date().toDateString()) return hm
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${hm}`
}

export const whoat = karin.command(/^#?谁(at|@|艾特)(我|ta|他|她|它)$/, async (e) => {
  const opt = await cfg.get('other')
  if (!opt.whoat) return e.reply('没有开启谁艾特我功能', { reply: true })
  let userId = e.userId
  const isMe = e.msg.match(/^#?谁(at|@|艾特)(我|ta|他|她|它)$/)![2] === '我'
  if (!isMe) userId = e.at[0]
  if (!userId) return e.reply('请艾特需要查询的对象', { reply: true })
  const data = JSON.parse(await redis.get(`Ling:at:${e.groupId}:${userId}`) || '[]') as WhoAtType
  const d1 = data.filter(i => !isAtLeast(Date.now(), i.time, 1, 'days'))
  if (data.length === 0) return e.reply('没有人艾特过你哦~', { reply: true })
  if (SUPPORT_FORWARD.includes(e.bot.adapter.protocol)) {
    const msg = []
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
  } else {
    /** 不支持合并转发的协议 将聊天记录渲染成仿QQ聊天页面图片发送 */
    const list: WhoAtRenderItem[] = []
    for (const item of d1) {
      try {
        const message = await e.bot.getMsg(e.contact, item.messageId)
        let avatar = ''
        try {
          avatar = await e.bot.getAvatarUrl(message.sender.userId, 100)
        } catch { /* 部分协议不支持获取头像 使用昵称首字符兜底 */ }
        const parts = message.elements
          .map(mapElement)
          .filter((item): item is WhoAtRenderPart => item !== null)
        list.unshift({
          nick: message.sender.nick,
          nickFirst: [...(message.sender.nick || '?')][0],
          avatar,
          time: formatTime(message.time),
          parts,
        })
      } catch (err) {
        logger.error(`获取消息id[${item}]的记录失败,跳过该消息\n${err}`)
        continue
      }
    }
    if (list.length === 0) return e.reply('获取艾特记录失败', { reply: true })
    const img = await render('whoat/index', {
      data: {
        title: e.contact.name || '群聊',
        subtitle: isMe ? '以下消息艾特了我' : '以下消息艾特了TA',
        list,
      },
    })
    await e.reply(img)
  }
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
