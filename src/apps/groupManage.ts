import { karin, redis } from 'node-karin'
import { isAdmin } from '@/utils/common'
import { cfg } from '@/components/config'

const handle = async (e: any, key: string, yes: boolean, type: string) => {
  const flag = await redis.get(key)
  if (!flag) {
    await e.reply('找不到这个请求啦！！！请手动同意吧')
    return true
  }
  if (type === 'groupinvite') {
    await e.bot.setInvitedJoinGroupResult(flag, yes)
    await e.reply(`已${yes ? '同意' : '拒绝'}加群申请`)
  } else {
    await e.bot.setFriendApplyResult(flag, yes)
    await e.reply(`已${yes ? '同意' : '拒绝'}好友申请`)
  }
  await redis.del(key)
  return true
}
export const groupApplyReply = karin.command(/^#?(同意|拒绝)$/, async (e) => {
  const opts = await cfg.getGroup()
  if (!e.replyId) return false
  if (e.isGroup) {
    if (!opts.Apply_list.includes(e.groupId)) return false
    if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
      await e.reply('暂无权限，只有管理员才能操作')
      return true
    }
    if (!await isAdmin(e, false)) return false
    const key = `Ling:groupinvite:${e.replyId}`
    const flag = await redis.get(key)
    if (!flag) {
      await e.reply('找不到这个请求啦！！！请手动同意吧')
      return true
    }
    const yes = /同意/.test(e.msg)
    await e.bot.setInvitedJoinGroupResult(flag, yes)
    await e.reply(`已${yes ? '同意' : '拒绝'}加群申请`)
    await redis.del(key)
    return true
  } else {
    const messageId = e.replyId
    const msgs = await e.bot.getMsg(e.contact, messageId)
    const textContent = msgs.elements.find(element => element.type === 'text')?.text
    const msg = textContent ? textContent.split('\n') : []
    const groupId = msg[1].match(/[1-9]\d*/g)
    const userId = msg[3].match(/[1-9]\d*/g)
    if (msg[0].includes('邀请加群')) {
      const key = `Ling:groupinvite:${groupId}:${userId}`
      const yes = /同意/.test(e.msg)
      await handle(e, key, yes, 'groupinvite')
    } else {
      if (msg[0].includes('好友申请')) {
        const key = `Ling:friendapply:${userId}`
        const yes = /同意/.test(e.msg)
        await handle(e, key, yes, 'friendapply')
      }
    }
    return true
  }
}, { name: '加群申请处理', priority: -1 })

export const groupApplySwitch = karin.command(/^#(开启|关闭)加群通知$/, async (e) => {
  const opts = await cfg.getGroup()
  if (!(['owner', 'admin'].includes(e.sender.role) || e.isMaster)) {
    await e.reply('暂无权限，只有管理员才能操作')
    return true
  }
  if (e.msg.includes('关闭')) {
    if (!opts.Apply_list.includes(e.groupId)) {
      await e.reply('本群暂未开启加群申请通知')
      return true
    }
    await cfg.setJson('group', 'del', 'apply_list', e.groupId)
  } else {
    if (opts.Apply_list.includes(e.groupId)) {
      await e.reply('本群已开启加群申请通知')
      return true
    }
    await cfg.setJson('group', 'add', 'apply_list', e.groupId)
  }
  await e.reply(`已${e.msg.includes('关闭') ? '关闭' : '开启'}[${e.groupId}]的加群申请通知`)
  return true
}, { name: '加群通知开关', priority: -1, event: 'message.group' })

export const test = karin.command(/^#(开启|关闭)进群验证$/, async (e) => {
  const opt = await cfg.getGroup()
  if (e.msg.includes('关闭')) {
    if (!opt.MemberChange.joinVerify.includes(e.groupId)) {
      await e.reply('\n进群验证已经处于关闭状态', { at: true })
      return true
    }
    cfg.setJson('group', 'del', 'joinGroup', e.groupId)
    await e.reply('\n已关闭进群验证', { at: true })
    return true
  }

  if (opt.MemberChange.joinVerify.includes(e.groupId)) {
    await e.reply('\n进群验证已经处于开启状态', { at: true })
    return true
  }
  cfg.setJson('group', 'add', 'joinGroup', e.groupId)
  await e.reply('\n已开启进群验证', { at: true })
  return true
}, { name: '进群验证', perm: 'group.admin', event: 'message.group' })
