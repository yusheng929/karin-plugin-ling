import { cfg } from '@/config'
import karin, { common, config, redis } from 'node-karin'
import moment from 'node-karin/moment'

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

export const command = karin.command(/^#?赞我$/, async e => {
  const opt = await cfg.getFriend()
  if (opt.closeLike) {
    return false
  }

  const key = `VoteUser:${e.userId}`
  const time = await redis.get(key)
  if (time) {
    // 检查是否为今天
    if (moment().format('YYYY-MM-DD') === moment(Number(time)).format('YYYY-MM-DD')) {
      const likeEnd = opt.likeEnd || '今天已经赞过了o(￣▽￣)ｄ'
      await e.reply(likeEnd, { at: true })
      return true
    }
  }

  let count = 0
  for (let i = 1; i <= 5; i++) {
    try {
      await e.bot.sendLike(e.userId, 10)
      count += 10
    } catch (error) {
      break
    }
  }

  if (count === 0) {
    await e.reply('点赞失败了o(╥﹏╥)o', { at: true })
    return true
  }

  // 成功后记录时间
  await redis.set(key, moment().valueOf().toString())
  let likeStart = opt.likeStart || '已为你点赞{{likeCount}}次'
  likeStart = likeStart.replace('{{likeCount}}', count.toString())
  await e.reply(likeStart, { at: true })
  return true
}, { name: '赞我', priority: -1 })

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
