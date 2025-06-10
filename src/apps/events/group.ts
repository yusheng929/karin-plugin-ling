import { contactFriend, GroupMemberIncreaseNotice, GroupMessage, karin, logger, redis, segment } from 'node-karin'
import { autoQuitGroup, friend, group } from '@/utils/config'
import lodash from 'node-karin/lodash'
import { sendToAllAdmin, sendToFirstAdmin } from '@/utils/common'

/** 进群事件 */
export const accept = karin.accept('notice.groupMemberAdd', async (e) => {
  const cfg = group()
  const quit = autoQuitGroup()
  if (e.sender.userId === e.selfId && quit.enable) {
    const data = quit.autoquit
    e.selfId in data ? await autoquit(e, e.selfId, e.groupId) : await autoquit(e, 'default', e.groupId)
  }
  if (cfg.accept.enable && e.sender.userId !== e.selfId) {
    if (cfg.accept.enable_list.includes(e.groupId) || (cfg.accept.enable_list.length === 0 && !cfg.accept.disable_list.includes(e.groupId))) {
      let msg = cfg.accept.jointext || '用户『{{Id}}』已加入本群'
      msg = msg.replace(/{{Id}}/gi, e.userId.toString())
      await e.reply(msg, { at: true })
    }
  }

  /** 检查是否开启入群验证 */
  if (cfg.joinGroup.includes(e.groupId) && e.sender.userId !== e.selfId) {
    const num1 = lodash.random(1, 100)
    const num2 = lodash.random(1, 100)
    /** 加乘 不要减、除 过于混乱 */
    const type = lodash.random(1, 2)
    const result = type === 1 ? num1 + num2 : num1 * num2
    await e.reply(`\n为确保你不是机器人\n请在3分钟内输入下方计算结果\n『${num1} ${type === 1 ? '+' : '×'} ${num2} = ？』`, { at: true })

    /**
     * @returns 返回`true`继续循环，返回`false`结束循环
     */
    for (let i = 1; i <= 3; i++) {
      const exit = async (msg: string) => {
        if (i >= 3) {
          await e.reply(`\n${msg}，你将会被踢出群聊`, { at: true })
          await e.bot.groupKickMember(e.groupId, e.userId)
          return false
        }

        await e.reply(`\n${msg}，你还有${3 - i}次机会`, { at: true })
        return true
      }

      const event = await karin.ctx<GroupMessage>(e, { time: 180, reply: false }).catch(() => null)

      if (!event || event.msg.trim() !== result.toString()) {
        const msg = event ? '验证码错误，请重新输入' : '输入超时'
        if (!await exit(msg)) continue
      }

      await e.reply('\n验证通过,欢迎加入群聊', { at: true })
    }
  }
  return true
}, { name: '加群通知' })

/** 退群事件 */
export const unaccept = karin.accept('notice.groupMemberRemove', async (e) => {
  const cfg = group().accept
  if (cfg.enable && e.sender.userId !== e.selfId) {
    if (cfg.enable_list.includes(e.groupId) || (cfg.enable_list.length === 0 && !cfg.disable_list.includes(e.groupId))) {
      let msg = cfg.quittext || '用户『{{Id}}』已离开本群'
      msg = msg.replace(/{{Id}}/gi, e.userId.toString())
      await e.reply(msg)
    }
  }
  return true
})

/** 申请进群事件 */
export const groupApply = karin.accept('request.groupApply', async (e) => {
  logger.info(`${e.content.applierId} 申请加入群 ${e.groupId}: ${e.content.flag}`)
  const opts = group()
  if (!opts.apply_list.includes(e.groupId)) return false
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
  const key = `Ling:groupinvite:${messageId}`
  redis.set(key, e.content.flag, { EX: 86400 })
  return true
}, { name: '加群申请通知' })

/** 邀请Bot进群事件 */
export const groupInvite = karin.accept('request.groupInvite', async (e) => {
  logger.info(`${e.content.inviterId} 邀请Bot进群: ${e.content.flag}`)
  const cfg = group()
  if (e.isMaster) {
    await e.bot.setInvitedJoinGroupResult(e.content.flag, true)
    const contact = contactFriend(e.userId)
    await e.bot.sendMsg(contact, [segment.text('已自动同意邀群申请')])
    return true
  }
  if (cfg.invite) {
    await e.bot.setInvitedJoinGroupResult(e.content.flag, true)
    await e.reply('已同意邀群申请')
  }
  if (!cfg.notify.group_enable) return true
  const AvatarUrl = await e.bot.getGroupAvatarUrl(e.groupId)
  const message = [
    segment.image(AvatarUrl),
    segment.text([
      '接到用户邀请加群',
      `群号: ${e.groupId}`,
      `昵称: ${e.sender.nick || '未知'}`,
      `QQ号: ${e.userId}`,
      `${cfg.notify ? '已自动同意' : '可引用回复: 同意/拒绝进行处理'}`
    ].join('\n'))
  ]
  if (!cfg.notify.allow) {
    await sendToAllAdmin(e.selfId, message)
  } else {
    await sendToFirstAdmin(e.selfId, message)
  }
  if (!cfg.invite) {
    const key = `Ling:groupinvite:${e.groupId}:${e.userId}`
    redis.set(key, e.content.flag, { EX: 86400 })
  }
  return true
}, { name: '处理邀请Bot加群申请' })

/** 处理好友申请 */
export const friendApply = karin.accept('request.friendApply', async (e) => {
  logger.info(`${e.content.applierId} 申请加好友: ${e.content.flag}`)
  const cfg = friend()
  if (e.isMaster) {
    await e.bot.setFriendApplyResult(e.content.flag, true)
    logger.info('已同意加好友申请')
    return true
  }
  if (cfg.enable) {
    await e.bot.setFriendApplyResult(e.content.flag, true)
    logger.info('已自动同意加好友申请')
  }
  if (!cfg.notify.enable) return true
  const AvatarUrl = await e.bot.getAvatarUrl(e.userId)
  const message = [
    segment.image(AvatarUrl),
    segment.text([
      '接到用户好友申请',
      `QQ号: ${e.userId}`,
      `昵称: ${e.sender.nick || '未知'}`,
      `${cfg.notify ? '已自动同意' : '可引用回复: 同意/拒绝进行处理'}`
    ].join('\n'))
  ]
  if (!cfg.notify.allow) {
    await sendToAllAdmin(e.selfId, message)
  } else {
    await sendToFirstAdmin(e.selfId, message)
  }
  if (!cfg.enable) {
    const key = `Ling:friendapply:${e.userId}`
    redis.set(key, e.content.flag, { EX: 86400 })
  }
  return true
}, { name: '处理加好友申请', priority: 100, })

const autoquit = async (e: GroupMemberIncreaseNotice, id: string, groupId: string) => {
  const quit = autoQuitGroup()
  const data = quit.autoquit
  const a = data[id]
  if (a.enable_list.length > 0 && !a.enable_list.includes(groupId)) {
    await e.reply('当前群不在白名单,已自动退出')
    await e.bot.setGroupQuit(groupId, false)
    return true
  } else if (a.enable_list.length === 0 && a.disable_list.includes(groupId)) {
    await e.reply('当前群处于黑名单,已自动退出')
    await e.bot.setGroupQuit(groupId, false)
    return true
  }
  return false
}
