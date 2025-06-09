import moment from 'node-karin/moment'
import { friend, other } from '@/utils/config'
import { karin, segment, common, config, redis, logger, ImageElement } from 'node-karin'
import { sendToAllAdmin, sendToFirstAdmin, sleep } from '@/utils/common'
import Adapter from '@/adapter'

export const blackWhiteList = karin.command(/^#(取消)?(拉黑|拉白)(群)?/, async (e) => {
  const userId = e.at[0] || e.msg.replace(/#(取消)?(拉黑|拉白)(群)?/, '').trim()

  if (!userId) {
    e.reply('请输入需要拉黑的用户或群', { at: true })
    return true
  }

  const cfg = config.getYaml('config', 'user')
  // 兜底
  if (!Array.isArray(cfg.group.disable_list)) cfg.group.disable_list = []
  if (!Array.isArray(cfg.user.disable_list)) cfg.user.disable_list = []

  if (e.msg.includes('取消拉黑群')) {
    if (!cfg.group.disable_list.includes(userId)) {
      e.reply('群不在黑名单中', { at: true })
      return true
    }

    cfg.group.disable_list = cfg.group.disable_list.filter(item => item !== userId)
  } else if (e.msg.includes('取消拉白群')) {
    if (!cfg.group.enable_list.includes(userId)) {
      e.reply('群不在白名单中', { at: true })
      return true
    }

    cfg.group.disable_list = cfg.group.disable_list.filter(item => item !== userId)
  } else if (e.msg.includes('拉黑群')) {
    if (cfg.group.disable_list.includes(userId)) {
      e.reply('群已在黑名单中', { at: true })
      return true
    }

    cfg.group.disable_list.push(userId)
  } else if (e.msg.includes('拉白群')) {
    if (cfg.group.enable_list.includes(userId)) {
      e.reply('群已在白名单中', { at: true })
      return true
    }

    cfg.group.enable_list.push(userId)
  } if (e.msg.includes('取消拉黑')) {
    if (!cfg.user.disable_list.includes(userId)) {
      e.reply('用户不在黑名单中', { at: true })
      return true
    }

    cfg.user.disable_list = cfg.user.disable_list.filter(item => item !== userId)
  } else if (e.msg.includes('取消拉白')) {
    if (!cfg.user.enable_list.includes(userId)) {
      e.reply('用户不在白名单中', { at: true })
      return true
    }

    cfg.user.enable_list = cfg.user.enable_list.filter(item => item !== userId)
  } else if (e.msg.includes('拉黑')) {
    if (cfg.user.disable_list.includes(userId)) {
      e.reply('用户已在黑名单中', { at: true })
      return true
    }

    cfg.user.disable_list.push(userId)
  } else if (e.msg.includes('拉白')) {
    if (cfg.user.enable_list.includes(userId)) {
      e.reply('用户已在白名单中', { at: true })
      return true
    }

    cfg.user.enable_list.push(userId)
  }

  config.setYaml('config', cfg)

  await e.reply('操作成功', { at: true })
  return true
}, { name: '取消拉黑拉白群', priority: -1, permission: 'master' })

export const recall = karin.command(/^#?撤回$/, async (e) => {
  if (!e.replyId) {
    e.reply('请回复需要撤回的消息~')
    return true
  }

  e.bot.recallMsg(e.contact, e.replyId)
  e.bot.recallMsg(e.contact, e.messageId)
  return true
}, { name: '撤回', priority: -1, perm: 'group.admin' })

export const clearScreenRecall = karin.command(/^#清屏(\d+)?/, async (e) => {
  const match = Number(e.msg.replace(/#清屏/, '').trim() || 50)
  const list = await e.bot.getHistoryMsg(e.contact, e.messageId, match)
  const msgIds = list.map(item => item.messageId)
  await e.reply('开始执行清屏操作，请确保我有管理员')
  for (const id of msgIds) {
    await e.bot.recallMsg(e.contact, id)
  }
  return true
}, { name: '清屏', priority: -1, event: 'message.group', perm: 'group.admin' })

export const QuitGroup = karin.command(/^#?退群/, async (e) => {
  const groupId = e.msg.replace(/#?退群/g, '').trim()
  if (!groupId) {
    await e.reply('请输入需要退出的群号', { at: true })
    return true
  }

  try {
    await e.bot.getGroupInfo(groupId)
  } catch (error) {
    await e.reply('你好像没加入这个群', { at: true })
    return true
  }

  try {
    const info = await e.bot.getGroupMemberInfo(groupId, e.selfId)
    if (['owner'].includes(info.role)) {
      await e.reply(`Bot是群[${groupId}]的群主,如果退群会直接解散群聊,请发送\n#确认退群${groupId}\n以退出群聊`)
      const event = await karin.ctx(e)
      if (event.msg.trim() !== `#确认退群${groupId}`) return true
    }
    if (groupId === e.groupId) {
      await e.reply('3秒后退出本群聊')
      await common.sleep(3000)
    } else {
      await e.reply(`已退出群聊『${groupId}』`)
    }
    await e.bot.setGroupQuit(groupId, true)

    return true
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    return true
  }
}, { name: '退群', priority: -1, permission: 'master', event: 'message.group' })

/**
 * 看群头像
**/
export const SeeImg = karin.command(/^#(看|取)头像/, async (e) => {
  const userId = e.at.length ? e.at[0] : e.msg.replace(/#(看|取)头像/, '').trim()
  if (!userId) {
    await e.reply('请指定用户', { at: true })
    return true
  }

  const url = await e.bot.getAvatarUrl(userId, 640 as any)
  if (e.msg.includes('取')) return e.reply(url)
  await e.reply(segment.image(url))
  return true
}, { name: '看头像', priority: -1 })

/**
 * 看群头像
 */
export const SeeGroupImg = karin.command(/^#(看|取)群头像/, async (e) => {
  const groupId = e.msg.replace(/^#?(看|取)群头像/, '').trim() || e.groupId
  if (!groupId) {
    e.reply('请输入正确的群号')
    return true
  }
  const url = await e.bot.getGroupAvatarUrl(groupId, 640 as any)
  if (e.msg.includes('取')) return e.reply(url)
  await e.reply(segment.image(url))
  return true
}, { name: '看群头像', priority: -1, event: 'message.group' })

export const command = karin.command(/^#?赞我$/, async e => {
  if (friend().closeLike) {
    return false
  }

  const key = `VoteUser:${e.userId}`
  const time = await redis.get(key)
  if (time) {
    // 检查是否为今天
    if (moment().format('YYYY-MM-DD') === moment(Number(time)).format('YYYY-MM-DD')) {
      const likeEnd = friend().likeEnd || '今天已经赞过了o(￣▽￣)ｄ'
      await e.reply(likeEnd, { at: true })
      return true
    }
  }

  let count = 0
  for (let i = 1; i <= 5; i++) {
    const result = await e.bot.sendLike(e.userId, 10)
    if (!result) break
    count += 10
  }

  if (count === 0) {
    await e.reply('点赞失败了o(╥﹏╥)o', { at: true })
    return true
  }

  // 成功后记录时间
  await redis.set(key, moment().valueOf().toString())
  let likeStart = friend().likeStart || '已为你点赞{{likeCount}}次'
  likeStart = likeStart.replace('{{likeCount}}', count.toString())
  await e.reply(likeStart, { at: true })
  return true
}, { name: '赞我', priority: -1 })

export const sendAllGroup = karin.command(/^#群发/, async (e) => {
  const msg = e.msg.replace(/^#群发/, '').trim()
  const groupList = await e.bot.getGroupList()
  const count = {
    all: 0,
    success: 0,
    fail: 0,
  }
  if (!groupList.length) return e.reply('群列表为空或者获取失败')
  count.all = groupList.length
  for (const group of groupList) {
    try {
      const contact = karin.contactGroup(group.groupId)
      await e.bot.sendMsg(contact, [segment.text(msg)])
      count.success++
      logger.debug(`发送群聊消息[${group.groupId}]成功`)
      await sleep(1000)
    } catch (e) {
      count.fail++
      logger.error(`发送群聊消息[${group.groupId}]失败\n`, e)
    }
  }
  return await e.reply(`群发完成\n总数: ${count.all}\n成功: ${count.success}\n失败: ${count.fail}`, { at: true })
}, { name: '群发', priority: -1, permission: 'master' })

export const contactMaster = karin.command(/^#?联系主人/, async (e) => {
  const cfg = other()
  if (!cfg.contactMaster.enable) return false
  const cd = await redis.get(`Ling:ContactMaster:cd:${e.userId}`)
  if (cd) return e.reply('联系主人冷却中,请勿重复发送', { reply: true })
  const msgs = e.elements
  const msg = msgs.find(item => item.type === 'text')
  const img = msgs.filter(item => item.type === 'image')
  if (img.length > 0) {
    img.forEach(item => {
      try {
        const url = new URL(item.file)
        item.file = 'http:' + url.href.substring(url.protocol.length)
      } catch (err) {
      }
    })
  }
  if (msg) msg.text = msg.text.replace(/^(.*?)#?联系主人/, '').trim()
  msgs.unshift(segment.text(`来自群聊: ${e.groupId}\n发送者: ${e.sender.name}(${e.userId})\n时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n消息内容:\n`))
  msgs.push(segment.text('\n\n可直接引用该消息进行回复'))
  const data = {
    groupId: e.groupId,
    messageId: e.messageId,
    userId: e.userId,
  }
  if (cfg.contactMaster.allow) {
    const id = await sendToFirstAdmin(e.selfId, msgs)
    if (!id) return e.reply('当前没有可联系的主人,请稍后再试', { reply: true })
    redis.set(`Ling:ContactMaster:${id}`, JSON.stringify(data), { EX: 86400 })
  } else {
    const list = await sendToAllAdmin(e.selfId, msgs)
    for (const id of list) {
      redis.set(`Ling:ContactMaster:${id}`, JSON.stringify(data), { EX: 86400 })
    }
  }
  await redis.set(`Ling:ContactMaster:cd:${e.userId}`, 'cd', { EX: cfg.contactMaster.cd })
  return e.reply('已将消息发送给主人，请耐心等待回复', { reply: true })
}, { event: 'message.group' })

export const getimg = karin.command(/#?取直链/, async (e) => {
  let msg1: ImageElement[] = []
  if (e.replyId) msg1 = (await e.bot.getMsg(e.contact, e.replyId)).elements.filter(item => item.type === 'image')
  const msg2 = e.elements.filter(item => item.type === 'image')
  const msg3 = [...msg1, ...msg2]
  const msg = []
  for (const i of msg3) {
    i.file = await new Adapter(e).refreshRkey(i.file) || ''
    msg.push([segment.image(i.file), segment.text(`图片链接: ${i.file}`)])
  }
  const content = common.makeForward(msg, e.selfId, e.bot.account.name)
  await e.bot.sendForwardMsg(e.contact, content)
  return true
})
