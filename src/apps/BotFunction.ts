import { cfg } from '@/config'
import karin, { common, config, GroupMessage, Message, logger } from 'node-karin'

export const blackWhiteList = karin.command(/^#(取消)?(拉黑|拉白)(群)?/, async (e) => {
  let id = null
  if (e.msg.includes('群')) {
    id = e.msg.replace(/#(取消)?(拉黑|拉白)群/, '').trim()
  } else {
    id = e.at[0] || e.msg.replace(/#(取消)?(拉黑|拉白)/, '').trim()
  }
  if (!id) return e.reply('请输入需要(拉黑|拉白)的用户或群', { at: true })
  const isBan = e.msg.includes('拉黑')
  const isGroup = e.msg.includes('群')
  const cfg = config.getYaml('config', 'user')
  const cancel = e.msg.includes('取消')
  if (cancel) {
    if (isBan) {
      if (isGroup) {
        if (!cfg.group.disable_list.includes(id)) {
          return e.reply('群不在黑名单中', { at: true })
        }
        cfg.group.disable_list = cfg.group.disable_list.filter(item => item !== id)
      } else {
        if (!cfg.user.disable_list.includes(id)) {
          return e.reply('用户不在黑名单中', { at: true })
        }
        cfg.user.disable_list = cfg.user.disable_list.filter(item => item !== id)
      }
    } else {
      if (isGroup) {
        if (!cfg.group.enable_list.includes(id)) {
          return e.reply('群不在白名单中', { at: true })
        }
        cfg.group.enable_list = cfg.group.enable_list.filter(item => item !== id)
      } else {
        if (!cfg.user.enable_list.includes(id)) {
          return e.reply('用户不在白名单中', { at: true })
        }
        cfg.user.enable_list = cfg.user.enable_list.filter(item => item !== id)
      }
    }
  } else {
    if (isBan) {
      if (isGroup) {
        if (cfg.group.disable_list.includes(id)) {
          return e.reply('群已在黑名单中', { at: true })
        }
        cfg.group.disable_list.push(id)
      } else {
        if (cfg.user.disable_list.includes(id)) {
          return e.reply('用户已在黑名单中', { at: true })
        }
        cfg.user.disable_list.push(id)
      }
    } else {
      if (isGroup) {
        if (cfg.group.enable_list.includes(id)) {
          return e.reply('群已在白名单中', { at: true })
        }
        cfg.group.enable_list.push(id)
      } else {
        if (cfg.user.enable_list.includes(id)) {
          return e.reply('用户已在白名单中', { at: true })
        }
        cfg.user.enable_list.push(id)
      }
    }
  }
  config.setYaml('config', cfg)
  return e.reply('操作成功', { at: true })
}, { name: '取消拉黑拉白群', priority: -1, permission: 'master' })

export const QuitGroup = karin.command(/^#退群/, async (e) => {
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
 * 执行点赞逻辑
 * @param bot Bot实例
 * @param userId 目标QQ号
 * @returns 实际点赞总数
 */
const sendLikeUntilFail = async (
  bot: Message['bot'],
  userId: string
) => {
  let count = 0
  // 点赞接口受上游适配器处理，这里持续点赞直到失败为止
  while (true) {
    try {
      await bot.sendLike(userId, 10)
      count += 10
    } catch {
      break
    }
  }
  return count
}

/**
 * 判断是否有代设置权限
 * @param e 群消息事件
 */
const canManageTimedLikeTargets = (e: GroupMessage) => {
  return e.isMaster || ['owner', 'admin'].includes(e.sender.role)
}

/**
 * 写回定时点赞UID列表（去重）
 * @param targets 目标UID列表
 */
const saveTimedLikeTargets = async (targets: string[]) => {
  const friendCfg = await cfg.get('friend', true)
  const next = [...new Set(targets.map(item => String(item).trim()).filter(Boolean))]
  await cfg.save('friend', {
    ...friendCfg,
    timedLike: {
      ...friendCfg.timedLike,
      targets: next
    }
  })
  return next
}

/**
 * 生成用户展示文本: 昵称(uid)
 * @param e 群消息事件
 * @param userIds 用户UID列表
 */
const formatUsersForGroup = async (e: GroupMessage, userIds: string[]) => {
  const list = await Promise.all(userIds.map(async (uid) => {
    try {
      const info = await e.bot.getGroupMemberInfo(e.groupId, uid)
      const name = info.card || info.nick || uid
      return `${name}(${uid})`
    } catch {
      return `未知用户(${uid})`
    }
  }))
  return list.join('、')
}

/**
 * 手动点赞命令
 * 直接调用适配器点赞接口，失败后返回自定义文案。
 */
export const command = karin.command(/^#?赞我$/, async e => {
  const opt = await cfg.get('friend')
  if (!opt.enableLike) {
    await e.reply('点赞功能已关闭', { at: true })
    return true
  }

  const count = await sendLikeUntilFail(e.bot, e.userId)
  if (count === 0) {
    const likeEnd = opt.likeEnd || '已经给你赞过了'
    await e.reply(likeEnd, { at: true })
    return true
  }

  let likeStart = opt.likeStart || '已为你点赞{{likeCount}}次'
  likeStart = likeStart.replace('{{likeCount}}', count.toString())
  await e.reply(likeStart, { at: true })
  return true
}, { name: '赞我', priority: -1 })

/**
 * 定时点赞任务
 * 每天 00:00 触发一次，按配置的UID列表依次点赞。
 */
export const timedLikeTask = karin.task('Ling-定时点赞', '0 0 * * *', async () => {
  const friendCfg = await cfg.get('friend')
  if (!friendCfg.enableLike || !friendCfg.timedLike.enable) return true

  const targets = [...new Set(friendCfg.timedLike.targets.map(item => String(item).trim()).filter(Boolean))]
  if (!targets.length) return true

  const bots = karin.getAllBotID()
    .map(id => String(id))
    .filter(id => id !== 'console')

  for (const selfId of bots) {
    const bot = karin.getBot(selfId)
    if (!bot) continue
    for (const targetUserId of targets) {
      try {
        const likeCount = await sendLikeUntilFail(bot, targetUserId)
        logger.info(`[定时点赞][${selfId}] -> ${targetUserId}: ${likeCount}`)
      } catch (error) {
        const reason = error instanceof Error ? error.message : '执行异常'
        logger.error(`[定时点赞][${selfId}] -> ${targetUserId} 失败: ${reason}`)
      }
    }
  }

  return true
}, { name: 'Ling-定时点赞', log: false })

/**
 * 设置/开启定时点赞
 * - 群管理员/主人: 可通过 @ 批量代设置
 * - 普通用户: 无@时只设置自己
 */
export const setTimedLike = karin.command(/^#(设置|开启)定时点赞/, async (e: GroupMessage) => {
  const friendCfg = await cfg.get('friend')
  if (!friendCfg.enableLike) return e.reply('点赞功能已关闭')

  const atList = [...new Set(e.at.map(item => String(item).trim()).filter(Boolean))]
  let targets = atList

  // 无@时默认配置自己
  if (!targets.length) {
    targets = [e.userId]
  } else if (!canManageTimedLikeTargets(e)) {
    return e.reply('仅群管理员或主人可代设置定时点赞')
  }

  const current = friendCfg.timedLike.targets || []
  const currentSet = new Set(current.map(item => String(item)))
  const added = targets.filter(uid => !currentSet.has(uid))
  const merged = await saveTimedLikeTargets([...current, ...targets])
  if (!added.length) return e.reply('目标用户已在定时点赞列表中')
  const text = await formatUsersForGroup(e, added)
  return e.reply([
    `已添加 ${text}`,
    `当前共 ${merged.length} 个用户`
  ].join('\n'))
}, { name: '设置定时点赞', event: 'message.group', priority: -1 })

/**
 * 取消/关闭定时点赞
 * - 群管理员/主人: 可通过 @ 批量代取消
 * - 普通用户: 无@时只取消自己
 */
export const delTimedLike = karin.command(/^#(取消|关闭)定时点赞/, async (e: GroupMessage) => {
  const friendCfg = await cfg.get('friend')
  const atList = [...new Set(e.at.map(item => String(item).trim()).filter(Boolean))]
  let targets = atList

  if (!targets.length) {
    targets = [e.userId]
  } else if (!canManageTimedLikeTargets(e)) {
    return e.reply('仅群管理员或主人可代取消定时点赞')
  }

  const before = friendCfg.timedLike.targets || []
  const beforeSet = new Set(before.map(item => String(item)))
  const removed = targets.filter(uid => beforeSet.has(uid))
  if (!removed.length) {
    const text = await formatUsersForGroup(e, targets)
    return e.reply(`以下用户不在定时点赞列表中\n${text}`)
  }
  const set = new Set(targets)
  const next = before.filter(item => !set.has(String(item)))
  const saved = await saveTimedLikeTargets(next)
  const text = await formatUsersForGroup(e, removed)
  return e.reply([
    `已移除 ${text}`,
    `当前共 ${saved.length} 个用户`
  ].join('\n'))
}, { name: '取消定时点赞', event: 'message.group', priority: -1 })

export const setAvatar = karin.command(/^#设置头像(\d*)$/, async (e) => {
  const selfId = e.msg.replace(/^#设置头像/, '').trim() || e.selfId
  const bot = karin.getBot(selfId)
  if (!bot) return e.reply('未找到对应的Bot', { reply: true })
  let img = e.elements.find(i => i.type === 'image')?.file
  if (!img) {
    await e.reply('请发送需要设置的头像', { reply: true })
    const msg = await karin.ctx(e)
    img = msg.elements.find(i => i.type === 'image')?.file
    if (!img) return e.reply('未检测到图片,已取消操作', { reply: true })
  }
  await bot.setAvatar(img)
  e.reply('修改成功')
  return true
}, { name: '改头像', priority: -1, permission: 'master' })
