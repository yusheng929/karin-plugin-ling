import { karin, config, segment, logger } from 'node-karin'
import { other } from '@/utils/config'
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
    await e.reply('请输入正确的群号')
    return false
  }

  if (e.msg.includes('关闭')) {
    await Edit.EditAddend(e, `已经关闭群『${groupId}』的进群通知`, `群『${groupId}』的进群通知已经处于关闭状态`, 'accept.BlackGroup', groupId, 'other')
    return true
  }

  if (e.msg.includes('开启')) {
    await Edit.EditRemove(e, `已经开启群『${groupId}』的进群通知`, `群『${groupId}』的进群通知目前已经处于开启状态`, 'accept.BlackGroup', groupId, 'other')
    return true
  }
  return true
}, { permission: 'master' })

export const test = karin.command(/^#(开启|关闭)进群验证$/, async (e) => {
  if (!e.isGroup) {
    e.reply('请在群聊中执行')
    return false
  }
  if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
    await e.reply('暂无权限，只有管理员才能操作')
    return false
  }
  if (e.msg.includes('关闭')) {
    await Edit.EditRemove(e, '已关闭进群验证', '进群验证已经处于关闭状态', 'Test', e.groupId, 'other')
    return true
  }

  if (e.msg.includes('开启')) {
    await Edit.EditAddend(e, '已开启进群验证', '进群验证已经处于开启状态', 'Test', e.groupId, 'other')
    return true
  }
  return true
})
