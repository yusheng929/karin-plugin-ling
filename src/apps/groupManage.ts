import { karin, config, segment, logger } from 'node-karin'
import { KV, other, setYaml } from '@/utils/config'
import { sendToAllAdmin } from '@/utils/common'

export const groupInvite = karin.accept('request.groupInvite', async (e) => {
  const opts = other().group
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
  console.log(`${e.content.applierId} 申请加入群 ${e.groupId}: ${e.content.flag}`)

  const opts = other().group
  const cfg = { groupId: e.groupId, accept: opts.accept, notify: opts.notify }

  for (const group of Array.isArray(opts.alone) ? opts.alone : []) {
    if (group.groupId === e.groupId) {
      cfg.accept = group.accept
      cfg.notify = group.notify
      break
    }
  }

  if (!cfg) return false
  if (opts.accept) {
    await e.bot.setGroupApplyResult(e.content.flag, true)
  }

  if (!opts.notify) return false

  // const AvatarUrl = await e.bot.getAvatarUrl(e.userId)
  const GroupAvatarUrl = await e.bot.getGroupAvatarUrl(e.groupId)

  await sendToAllAdmin(e.selfId, [
    segment.image(GroupAvatarUrl),
    segment.text([
      `接到群『${e.groupId}』的加群申请`,
      `申请人: ${e.userId} 『${e.sender.nick || '未知'}』`,
      `自动处理: ${opts.accept ? '是' : '否'}`,
      `flag: ${e.content.flag}`,
      `申请理由: ${e.content.reason}`
    ].join('\n'))
  ])

  // 这里后续看下，感觉和加群通知有点重复
  // await e.reply([
  //   segment.image(AvatarUrl),
  //   segment.text([
  //     `接收${e.content.applierId}的加群申请`,
  //     `目前${cfg.accept ? '已开启自动处理，已通过加群申请' : '未开启自动处理，请等待管理员手动处理'}`,
  //     `申请理由: ${e.content.reason}`
  //   ].join('\n'))
  // ])

  return true
}, { name: '处理加群申请' }
)

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
