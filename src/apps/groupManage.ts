import { karin, config, segment, logger, redis } from 'node-karin'
import { KV, other, setYaml } from '@/utils/config'
import { sendToAllAdmin } from '@/utils/common'

export const groupInvite = karin.accept('request.groupInvite', async (e) => {
  const opts = other().group
  if (e.isMaster) {
    await e.bot.setInvitedJoinGroupResult(e.content.flag, true)
    await e.reply('已同意邀群申请')
    return true
  }
  if (opts.invite) {
    await e.bot.setInvitedJoinGroupResult(e.content.flag, true)
  }

  if (!opts.notify) return false
  const AvatarUrl = await e.bot.getGroupAvatarUrl(e.groupId)
  const list = [...config.master(), ...config.admin()]
  for (const id of list) {
    try {
      const contact = karin.contactFriend(id)
      const message = [
        segment.image(AvatarUrl),
        segment.text(`接到群『${e.groupId}』的邀请， ${opts.accept ? '已处理' : ''} 识别号: ${e.content.flag}`)
      ]

      await karin.sendMsg(e.selfId, contact, message)
    } catch (error) {
      logger.error('[处理邀请Bot加群] 发送主人消息失败:')
      logger.error(error)
    }
  }
  return true
}, { name: '处理邀请Bot加群申请' }
)

export const friendApply = karin.accept('request.friendApply', async (e) => {
  const opts = other().friend
  if (e.isMaster) {
    await e.bot.setFriendApplyResult(e.content.flag, true)
    logger.info('已同意加好友申请')
    return true
  }
  if (opts.accept) {
    await e.bot.setFriendApplyResult(e.content.flag, true)
  }

  if (!opts.notify) return false
  const AvatarUrl = await e.bot.getAvatarUrl(e.userId)
  await sendToAllAdmin(e.selfId, [
    segment.image(AvatarUrl),
    segment.text(`接到『${e.content.applierId}』的好友申请， ${opts.accept ? '已处理' : ''} 识别号: ${e.content.flag}`)
  ])

  return true
}, { name: '处理加好友申请', priority: 100, }
)

export const groupApply = karin.accept('request.groupApply', async (e) => {
  logger.info(`${e.content.applierId} 申请加入群 ${e.groupId}: ${e.content.flag}`)
  const opts = other().group
  if (!opts.list.includes(e.groupId)) return false
  const AvatarUrl = await e.bot.getAvatarUrl(e.userId)

  const msg = await e.reply([
    segment.image(AvatarUrl),
    segment.text([
      '接到新的的加群申请',
      `QQ号: ${e.userId}`,
      `昵称: ${e.sender.nick || '未知'}`,
      `申请理由: ${e.content.reason}`,
      '管理员可引用回复: 同意/拒绝 进行处理'
    ].join('\n'))
  ])
  const messageId = msg.messageId
  redis.set(messageId, e.content.flag, { EX: 86400 })
  return true
}, { name: '加群申请通知' }
)

export const groupApplyReply = karin.command(/^#?(同意|拒绝)$/, async (e) => {
  const opts = other().group
  if (!e.reply) return false
  if (!opts.list.includes(e.groupId)) return false
  if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
    await e.reply('暂无权限，只有管理员才能操作')
    return true
  }
  const info = await e.bot.getGroupMemberInfo(e.groupId, e.selfId)
  if (!(['owner', 'admin'].includes(info.role))) {
    await e.reply('少女做不到呜呜~(>_<)~')
    return true
  }
  const messageId = e.replyId
  const flag = await redis.get(messageId)
  if (!flag) {
    await e.reply('找不到这个请求啦！！！请手动同意吧')
    return true
  }
  if (e.msg === '同意') {
    await e.bot.setInvitedJoinGroupResult(flag, true)
    await e.reply('已同意加群申请')
  } else {
    await e.bot.setInvitedJoinGroupResult(flag, false)
    await e.reply('已拒绝加群申请')
  }
  await redis.del(messageId)
  return true
}, { name: '加群申请处理', priority: -1, event: 'message.group' })

export const groupApplySwitch = karin.command(/^#(开启|关闭)加群通知$/, async (e) => {
  const opts = other().group
  if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
    await e.reply('暂无权限，只有管理员才能操作')
    return true
  }
  if (e.msg.includes('关闭')) {
    if (!opts.list.includes(e.groupId)) {
      await e.reply('本群暂未开启加群申请通知')
      return true
    }
    opts.list = opts.list.filter(v => v !== e.groupId)
  } else {
    if (opts.list.includes(e.groupId)) {
      await e.reply('本群已开启加群申请通知')
      return true
    }
    opts.list.push(e.groupId)
  }
  setYaml(KV.Other, opts)
  await e.reply(`已${e.msg.includes('关闭') ? '关闭' : '开启'}[${e.groupId}]的加群申请通知`)
  return true
}, { name: '加群通知开关', priority: -1, event: 'message.group' })

export const Notification = karin.command(/^#(开启|关闭)进群通知/, async (e) => {
  let groupId = e.msg.replace(/#(开启|关闭)进群通知/, '').trim()
  if (e.isGroup) groupId = groupId || e.groupId

  if (!groupId) {
    await e.reply('\n请输入正确的群号', { at: true })
    return false
  }

  const cfg = other()
  if (e.msg.includes('关闭')) {
    if (!cfg.accept.blackGroup.includes(groupId)) {
      await e.reply(`\n群『${groupId}』的进群通知已经处于关闭状态`, { at: true })
      return true
    }

    cfg.accept.blackGroup = cfg.accept.blackGroup.filter(v => v !== groupId)
    setYaml(KV.Other, cfg)
    await e.reply(`\n已经关闭群『${groupId}』的进群通知`, { at: true })
    return true
  }

  if (cfg.accept.blackGroup.includes(groupId)) {
    await e.reply(`\n群『${groupId}』的进群通知目前已经处于开启状态`, { at: true })
    return true
  }

  cfg.accept.blackGroup.push(groupId)
  setYaml(KV.Other, cfg)
  await e.reply(`\n已经开启群『${groupId}』的进群通知`, { at: true })
  return true
}, { permission: 'master' })

export const test = karin.command(/^#(开启|关闭)进群验证$/, async (e) => {
  const cfg = other()
  if (e.msg.includes('关闭')) {
    if (!cfg.joinGroup.includes(e.groupId)) {
      await e.reply('\n进群验证已经处于关闭状态', { at: true })
      return true
    }

    cfg.joinGroup = cfg.joinGroup.filter(v => v !== e.groupId)
    setYaml(KV.Other, cfg)
    await e.reply('\n已关闭进群验证', { at: true })
    return true
  }

  if (cfg.joinGroup.includes(e.groupId)) {
    await e.reply('\n进群验证已经处于开启状态', { at: true })
    return true
  }

  cfg.joinGroup.push(e.groupId)
  setYaml(KV.Other, cfg)
  await e.reply('\n已开启进群验证', { at: true })
  return true
}, { name: '进群验证', perm: 'group.admin', event: 'message.group' })
