import moment from 'node-karin/moment'
import { other } from '@/utils/config'
import { karin, segment, common, level, config } from 'node-karin'

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
}, { name: '撤回', priority: -1, event: 'message.group', perm: 'group.admin' })

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

  const url = await e.bot.getAvatarUrl(userId, 140)
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

  const url = await e.bot.getGroupAvatarUrl(groupId, 100)
  await e.reply(segment.image(url))
  return true
}, { name: '看群头像', priority: -1, event: 'message.group' })

export const command = karin.command(/^#赞我$/, async e => {
  if (!other().friend.closeLike) {
    return false
  }

  const key = `VoteUser:${e.userId}`
  const time = await level.get(key)
  if (time) {
    // 检查是否为今天
    if (moment().format('YYYY-MM-DD') === moment(Number(time)).format('YYYY-MM-DD')) {
      const likeEnd = other().friend.likeEnd || '今天已经赞过了o(￣▽￣)ｄ'
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
  await level.set(key, moment().valueOf().toString())
  let likeStart = other().friend.likeStart || '已为你点赞{{likeCount}}次'
  likeStart = likeStart.replace('{{likeCount}}', count.toString())
  await e.reply(likeStart, { at: true })
  return true
}, { name: '赞我', priority: -1 })

export const groupBroadcast = karin.command(/^#群发/, async (e) => {
  let msg = e.msg.replace(/#群发/, '').trim()

  if (!msg && !e.replyId) {
    e.reply('请带上需要发送的消息')
    return true
  }

  if (!msg && e.replyId) {
    const data = await e.bot.getMsg(e.contact, e.replyId)
    if (data.elements[0].type === 'text') {
      msg = data.elements[0].text
    }
  }

  const list = await e.bot.getGroupList()
  for (const group of list) {
    try {
      const contact = karin.contactGroup(group.groupId)
      await karin.sendMsg(e.selfId, contact, msg)
    } catch (error) { }
  }

  await e.reply('发送完成')
  return true
}, { name: '群发', priority: -1, permission: 'master' })

export const Botprefix = karin.command(/^#(添加|删除|查看)前缀/, async (e) => {
  /**
   * 检查前缀是否已经存在
   * @param prefix 前缀
   */
  const checkPrefix = (prefix: string, alias: string[]) => {
    for (const item of alias) {
      if (item === prefix) {
        e.reply('\n前缀已存在，请勿重复添加', { at: true })
        return true
      }
    }
    return false
  }

  const handler = async <T extends 'groups' | 'privates'> (
    yamlKey: T,
    fileCfg: T extends 'groups' ? ReturnType<typeof config.getGroupCfg> : ReturnType<typeof config.getFriendCfg>
  ) => {
    let key = fileCfg.key
    const cfg = config.getYaml(yamlKey, 'user', false) as any
    if (e.msg.includes('添加')) {
      const prefix = e.msg.replace(/#添加前缀/, '').trim()
      if (!prefix) {
        await e.reply('\n请输入正确的前缀', { at: true })
        return true
      }

      if (key === 'default') {
        if (e.isGroup) {
          key = `Bot:${e.selfId}:${e.groupId}`
        } else if (e.isFriend) {
          key = `Bot:${e.selfId}:${e.userId}`
        } else if (e.isGuild) {
          key = `Bot:${e.selfId}:${e.guildId}`
        } else if (e.isDirect) {
          key = `Bot:${e.selfId}:${e.userId}`
        }

        cfg[key] = fileCfg as any
      }

      if (checkPrefix(prefix, cfg[key]?.alias || [])) return true
      cfg[key].alias.push(prefix)
      config.setYaml(yamlKey, cfg)
      await e.reply('\n添加前缀成功', { at: true })
      return true
    }

    if (e.msg.includes('删除')) {
      const prefix = e.msg.replace(/#删除前缀/, '').trim()
      if (!prefix) {
        await e.reply('\n请输入正确的前缀', { at: true })
        return true
      }

      if (!cfg[key].alias?.includes(prefix)) {
        e.reply('\n前缀不存在', { at: true })
        return true
      }

      cfg[key].alias = cfg[key].alias.filter((item: string) => item !== prefix)
      config.setYaml(yamlKey, cfg)
      await e.reply('\n删除前缀成功', { at: true })
      return true
    }

    const alias = cfg[key].alias?.join('\n')
    if (!alias) {
      await e.reply('暂无前缀')
      return true
    }

    await e.reply(`\n当前前缀如下:\n${alias}`, { at: true })
    return true
  }

  if (e.isGroup) {
    const groupCfg = config.getGroupCfg(e.groupId, e.selfId)
    return await handler('groups', groupCfg)
  }

  if (e.isFriend) {
    const friendCfg = config.getFriendCfg(e.userId, e.selfId)
    return await handler('privates', friendCfg)
  }

  if (e.isGuild) {
    const guildCfg = config.getGuildCfg(e.guildId, e.channelId, e.selfId)
    return await handler('groups', guildCfg)
  }

  if (e.isDirect) {
    const directCfg = config.getDirectCfg(e.userId, e.selfId)
    return await handler('privates', directCfg)
  }

  return true
}, { name: '前缀', priority: -1, permission: 'master' })

export const friendBroadcast = karin.command(/^#发好友/, async (e) => {
  let msg = e.msg.replace(/#发好友/, '').trim()
  if (!msg && !e.replyId) {
    e.reply('请带上需要发送的消息')
    return true
  }
  if (!msg && e.replyId) {
    const data = await e.bot.getMsg(e.contact, e.replyId)
    if (data.elements[0].type === 'text') {
      msg = data.elements[0].text
    }
  }
  const elements = [
    segment.text(msg)
  ]
  const list = await e.bot.getFriendList()
  for (const friend of list) {
    try {
      const contact = karin.contactFriend(friend.userId)
      await e.bot.sendMsg(contact, elements)
    } catch (error) { }
  }
  e.reply('发送完成')
  return true
}, { name: '发好友', priority: -1, permission: 'master' })
