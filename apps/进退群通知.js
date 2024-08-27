import { karin, YamlEditor, Cfg, segment } from 'node-karin'
import { Config } from '../components/index.js'

const groupState = {}
const cfgPath = './plugins/karin-plugin-group/config/config/other.yaml'

/**
 * 检查并更新群组状态
 * @param e 事件对象
 * @param type 通知类型
 * @returns 是否继续处理
 */
const checkAndUpdateGroupState = async (e, type) => {
  if (e.user_id === e.bot.account.uid) return false
  const cfg = Config.Other.accept
  /** 将数据str化 */
  cfg.BlackGroup = cfg.BlackGroup.map(String)

  if (cfg.BlackGroup.includes(e.group_id)) return false

  const key = `${type}.${e.group_id}`
  if (!groupState[key]) return false

  /** cd中 */
  if (Date.now() - groupState[key] < Number(cfg.cd) * 1000) return false

  const time = Date.now()
  groupState[key] = time

  /** 检查时间戳 一致则删除 */
  setTimeout(() => {
    if (groupState[key] === time) delete groupState[key]
  }, Number(cfg.cd + 1) * 1000)

  return true
}

/**
 * 进群通知
 */
export const accept = karin.accept('notice.group_member_increase', async (e) => {
  if (!(await checkAndUpdateGroupState(e, 'increase'))) return false
  await e.reply('\n欢迎加入本群୯(⁠*⁠´⁠ω⁠｀⁠*⁠)୬', { at: true })
  return true
}, { name: '进群通知', priority: '-1' })

/**
 * 退群通知
 */
export const unaccept = karin.accept('notice.group_member_decrease', async (e) => {
  if (!(await checkAndUpdateGroupState(e, 'decrease'))) return false
  await e.reply(`用户『${e.user_id}』丢下我们一个人走了(╥_╥)`)
  return true
}, { name: '退群通知', priority: '-1' })

/**
 * 更新群组通知状态
 * @param e 事件对象
 * @param action 动作 ('add' 或 'remove')
 * @param successMessage 成功消息
 * @param alreadyMessage 已经存在消息
 * @returns 是否继续处理
 */
const updateNotificationStatus = async (e, action, successMessage, alreadyMessage) => {
  const group_id = e.msg.replace(/#(关闭|开启)进群通知/, '').trim() || e.group_id

  try {
    const yaml = new YamlEditor(cfgPath)
    const data = yaml.get('accept.BlackGroup')
    if (!Array.isArray(data)) {
      await e.reply('\n配置文件格式错误❌', { at: true })
      return true
    }

    if ((action === 'add' && data.includes(group_id)) || (action === 'remove' && !data.includes(group_id))) {
      await e.reply(alreadyMessage.replace('{group_id}', group_id))
      return true
    }

    if (action === 'add') {
      yaml.append('accept.BlackGroup', String(group_id))
    } else {
      const res = yaml.remove('accept.BlackGroup', String(group_id))
      if (!res) {
        await e.reply('失败: 未知错误❌')
        return true
      }
    }
    yaml.save()
    await e.reply(successMessage.replace('{group_id}', group_id))
    return true
  } catch (error) {
    await e.reply('失败: 未知错误❌')
    logger.error(error)
    return true
  }
}

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

export const CloseNotification = karin.command(/^#关闭进群通知/, async (e) => {
  return await updateNotificationStatus(e, 'add', '已经关闭群『{group_id}』的进群通知', '群『{group_id}』的进群通知目前已经处于关闭状态啦，无需重复关闭！')
}, { name: '关闭进群通知', priority: '-1', permission: 'group.admin' })

export const ActivateNotification = karin.command(/^#开启进群通知/, async (e) => {
  return await updateNotificationStatus(e, 'remove', '已经开启群『{group_id}』的进群通知', '群『{group_id}』的进群通知目前已经处于开启状态啦，无需重复开启！')
}, { name: '开启进群通知', priority: '-1', permission: 'group.admin' })
