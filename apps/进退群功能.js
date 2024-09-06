import { karin, YamlEditor, Cfg, segment } from 'node-karin'
import { Config, Edit } from '#components'

/**
 * 进群通知
 */
export const accept = karin.accept('notice.group_member_increase', async (e) => {
let data = Config.Other.accept.BlackGroup
let data1 = Config.Other.Test
  if (data.includes(e.group_id) && !data1.includes(e.group_id)) return false
 if (!data.includes(e.group_id)) await e.reply('\n欢迎加入本群୯(⁠*⁠´⁠ω⁠｀⁠*⁠)୬', { at: true })
  if (!data1.includes(e.group_id)) return false
  let num = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
  let user_id = e.user_id
  await e.reply(`\n为确保你不是机器人\n请在3分钟内输入下方验证码\n『${num}』`, { at: true })
  try {
  for (let i = 3; i >= 0; i--) {
  const event = await karin.ctx(e, { time: 120, reply: false})
   if (i == 1 && !(event.msg == num)) {
   await e.reply('验证失败，你将会被踢出群聊', { at: true })
   await e.bot.KickMember(e.group_id, user_id)
   return true
   }
  if (event.msg == num) {
  await e.reply('\n验证通过，欢迎加入群聊', { at: true })
  return true
  } else {
   await e.reply(`验证码错误，请重新输入\n你还有${i - 1}次机会`)
  }
}
} catch (error) {
  await e.reply('输入超时，你将会被踢出群聊', { at: true })
  await e.bot.KickMember(e.group_id, user_id)
  return true
}
}, { name: '进群', priority: '-1' })

/**
 * 退群通知
 */
export const unaccept = karin.accept('notice.group_member_decrease', async (e) => {
   let data = Config.Other.accept.BlackGroup
  if (data.includes(e.group_id)) return false
  await e.reply(`用户『${e.user_id}』丢下我们一个人走了(╥_╥)`)
  return true
}, { name: '退群通知', priority: '-1' })

export const deal_invited_group = karin.accept('request.invited_group',
  async (e) => {
    const opts = Config.Other.DealRequest.InvitedJoinGroup
    if (opts.accept) {
      await e.bot.SetInvitedJoinGroupResult(e.raw_event.flag, true)
    }
    if (!opts.notify) return
    const AvatarUrl = await e.bot.getGroupAvatarUrl(e.group_id)
    Cfg.master.concat(Cfg.admin).forEach(master => {
      try {
        e.bot.SendMessage({ scene: 'friend', peer: master }, [
          segment.image(AvatarUrl),
          segment.text(`接到群『${e.group_id}』的拉群申请， ${opts.accept ? '已处理，' : ''}识别号: ${e.raw_event.flag}`)
        ])
      } catch (error) { }
    })
  },
  {
    name: '处理拉群申请',
    priority: 100,
    log: true
  }
)

export const deal_private_apply = karin.accept('request.private_apply',
  async (e) => {
    const opts = Config.Other.DealRequest.Friend
    if (opts.accept) {
      await e.bot.SetFriendApplyResult(e.raw_event.flag, true)
    }
    if (!opts.notify) return
    const AvatarUrl = await e.bot.getAvatarUrl(e.user_id)
    Cfg.master.concat(Cfg.admin).forEach(master => {
      try {
        e.bot.SendMessage({ scene: 'friend', peer: master }, [
          segment.image(AvatarUrl),
          segment.text(`接到${e.sender.nick || ''}『${e.user_id}』的好友申请， ${opts.accept ? '已处理，' : ''}识别号: ${e.raw_event.flag}${e.content.message ? '\n申请理由: ' + e.content.message : ''}`)
        ])
      } catch (error) { }
    })
  },
  {
    name: '处理加好友申请',
    priority: 100,
    log: true
  }
)

export const deal_group_apply = karin.accept('request.group_apply',
  async (e) => {
    const opts = Array.isArray(Config.Other.DealRequest.Group) ? Config.Other.DealRequest.Group.find(group => group[e.group_id])[e.group_id] : Config.Other.DealRequest.Group
    if (!opts) return
    if (opts.accept) {
      await e.bot.SetGroupApplyResult(e.raw_event.flag, true)
    }
    if (!opts.notify) return
    const AvatarUrl = await e.bot.getAvatarUrl(e.user_id)
    const GroupAvatarUrl = await e.bot.getGroupAvatarUrl(e.group_id)
    Cfg.master.concat(Cfg.admin).forEach(master => {
      try {
        e.bot.SendMessage({ scene: 'friend', peer: master }, [
          segment.image(GroupAvatarUrl),
          segment.text(`接到群『${e.group_id}』的加群申请，申请人${e.sender.nick || ''}『${e.user_id}』， ${opts.accept ? '已处理，' : ''}识别号: ${e.raw_event.flag}${e.content.message ? '\n申请理由: ' + e.content.message : ''}`)
        ])
      } catch (error) { }
    })
    e.bot.SendMessage({ scene: 'group', peer: e.group_id }, [
      segment.image(AvatarUrl),
      segment.text(`接到${e.sender.nick || ''}『${e.user_id}』的加群申请。 ${opts.accept ? '已处理。' : ''}${e.content.message ? '\n申请理由: ' + e.content.message : ''}`)
    ])
  },
  {
    name: '处理加群申请',
    priority: 100,
    log: true
  }
)

export const Notification = karin.command(/^#(开启|关闭)进群通知/, async (e) => {
  let group_id = e.msg.replace(/#(开启|关闭)进群通知/, '').trim() || e.group_id
  if (e.msg.includes('关闭')) {
  return await Edit.EditAdd(e, 'add', `已经关闭群『${group_id}』的进群通知`, `群『${group_id}』的进群通知已经处于关闭状态`, 'accept.BlackGroup', group_id, 'other')
  }
  if (e.msg.includes('开启'))
  return await Edit.EditAdd(e, 'remove', `已经开启群『${group_id}』的进群通知`, `群『${group_id}』的进群通知目前已经处于开启状态`, 'accept.BlackGroup', group_id, 'other')
}, { permission: 'master' })

export const test = karin.command(/^#(开启|关闭)进群验证$/, async (e) => {
  if (e.msg.includes('关闭')) {
    return await Edit.EditAdd(e, 'remove', '已关闭进群验证', '进群验证已经处于关闭状态', 'Test', e.group_id, 'other')
  }

  if (e.msg.includes('开启')) {
  return await Edit.EditAdd(e, 'add', '已开启进群验证', '进群验证已经处于开启状态', 'Test', e.group_id, 'other')
  }
}, { permission: 'master' })