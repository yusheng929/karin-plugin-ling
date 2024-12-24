import fs from 'fs'
import moment from 'node-karin/moment'
import { other } from '@/utils/config'
import { basename } from '@/utils/dir'
import { karin, segment, common, level, config, ConfigMap, root } from 'node-karin'

export const blackWhiteList = karin.command(/^#(取消)?(拉黑|拉白)(群)?/, async (e) => {
  const userId = e.at[0] || e.msg.replace(/#(取消)?(拉黑|拉白)/, '').trim()

  if (!userId) {
    e.reply('请输入正确的账号', { at: true })
    return true
  }

  const cfg = config.getYaml('config', 'user').value
  // 兜底
  if (!Array.isArray(cfg.disable.groups)) cfg.disable.groups = []
  if (!Array.isArray(cfg.disable.users)) cfg.disable.users = []

  if (e.msg.includes('取消拉黑群')) {
    if (!cfg.disable.groups.includes(userId)) {
      e.reply('群不在黑名单中', { at: true })
      return true
    }

    cfg.disable.groups = cfg.disable.groups.filter(item => item !== userId)
  } else if (e.msg.includes('取消拉白群')) {
    if (!cfg.disable.groups.includes(userId)) {
      e.reply('群不在白名单中', { at: true })
      return true
    }

    cfg.disable.groups = cfg.disable.groups.filter(item => item !== userId)
  } else if (e.msg.includes('拉黑群')) {
    if (cfg.disable.groups.includes(userId)) {
      e.reply('群已在黑名单中', { at: true })
      return true
    }

    cfg.disable.groups.push(userId)
  } else if (e.msg.includes('拉白群')) {
    if (cfg.disable.groups.includes(userId)) {
      e.reply('群已在白名单中', { at: true })
      return true
    }

    cfg.disable.groups.push(userId)
  } if (e.msg.includes('取消拉黑')) {
    if (!cfg.disable.users.includes(userId)) {
      e.reply('用户不在黑名单中', { at: true })
      return true
    }

    cfg.disable.users = cfg.disable.users.filter(item => item !== userId)
  } else if (e.msg.includes('取消拉白')) {
    if (!cfg.disable.users.includes(userId)) {
      e.reply('用户不在白名单中', { at: true })
      return true
    }

    cfg.disable.users = cfg.disable.users.filter(item => item !== userId)
  } else if (e.msg.includes('拉黑')) {
    if (cfg.disable.users.includes(userId)) {
      e.reply('用户已在黑名单中', { at: true })
      return true
    }

    cfg.disable.users.push(userId)
  } else if (e.msg.includes('拉白')) {
    if (cfg.disable.users.includes(userId)) {
      e.reply('用户已在白名单中', { at: true })
      return true
    }

    cfg.disable.users.push(userId)
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
  const groupId = e.msg.replace(/#?退群/g, '').trim() || e.groupId

  try {
    await e.bot.getGroupInfo(groupId)
  } catch (error) {
    await e.reply('\n你好像没加入这个群', { at: true })
    return true
  }

  try {
    if (groupId === e.groupId) {
      await e.reply('3秒后退出本群聊')
      await common.sleep(3000)
      await e.bot.setGroupQuit(groupId, false)
    } else {
      await e.reply(`已退出群聊『${groupId}』`)
    }

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
      e.reply('\n今天已经赞过了o(￣▽￣)ｄ', { at: true })
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
  await e.reply(`\n已经成功为你点赞${count}次！`, { at: true })
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

  const handler = async <T extends 'friendDirect' | 'groupGuild'> (
    yamlKey: T,
    cfg: ConfigMap[T],
    fileCfg: ConfigMap[T][string]
  ) => {
    if (e.msg.includes('添加')) {
      const prefix = e.msg.replace(/#添加前缀/, '').trim()
      if (!prefix) {
        await e.reply('\n请输入正确的前缀', { at: true })
        return true
      }

      let key = fileCfg.key
      if (key === 'default') {
        if (e.isGroup) {
          key = `Bot:${e.selfId}:${e.groupId}`
        } else if (e.isPrivate) {
          key = `Bot:${e.selfId}:${e.userId}`
        } else if (e.isGuild) {
          key = `Bot:${e.selfId}:${e.guildId}`
        } else if (e.isDirect) {
          key = `Bot:${e.selfId}:${e.userId}`
        }
        cfg[key] = fileCfg
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

      if (!fileCfg.alias.includes(prefix)) {
        e.reply('\n前缀不存在', { at: true })
        return true
      }

      cfg[fileCfg.key].alias = cfg[fileCfg.key].alias.filter(item => item !== prefix)
      config.setYaml(yamlKey, cfg)
      await e.reply('\n删除前缀成功', { at: true })
      return true
    }

    const alias = fileCfg.alias.join('\n')
    if (!alias) {
      await e.reply('暂无前缀')
      return true
    }

    await e.reply(`\n当前前缀如下:\n${alias}`, { at: true })
    return true
  }

  if (e.isGroup) {
    const cfg = config.getYaml('groupGuild', 'user', false)
    const groupCfg = config.getGroupCfg(e.groupId, e.selfId)
    return await handler('groupGuild', cfg.value, groupCfg)
  }

  if (e.isPrivate) {
    const cfg = config.getYaml('friendDirect', 'user', false)
    const friendCfg = config.getFriendCfg(e.userId, e.selfId)
    return await handler('friendDirect', cfg.value, friendCfg)
  }

  if (e.isGuild) {
    const cfg = config.getYaml('groupGuild', 'user', false)
    const guildCfg = config.getGuildCfg(e.guildId, e.channelId, e.selfId)
    return await handler('groupGuild', cfg.value, guildCfg)
  }

  if (e.isDirect) {
    const cfg = config.getYaml('friendDirect', 'user', false)
    const directCfg = config.getDirectCfg(e.userId, e.selfId)
    return await handler('friendDirect', cfg.value, directCfg)
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

export const getGroupList = karin.command(/^#(查看|获取|保存)(群|好友)列表$/, async (e) => {
  const msgs = []
  let data

  if (e.msg.includes('群')) {
    const list = await e.bot.getGroupList()
    data = list.map((item, index) => `${index + 1}. ${item.groupId} (${item.groupName || '未知'})`).join('\n') || '暂无群组'
    msgs.push(segment.text(data))
    msgs.push(segment.text('可使用 *#退群1234567890* 来退出群聊'))
    msgs.unshift(segment.text(`群列表如下: 总共${list.length}个群`))

    const msg = common.makeForward(msgs, e.selfId, e.bot.account.name)
    await e.bot.sendForwardMsg(e.contact, msg)
    return true
  }

  const list = await e.bot.getGroupList()
  data = list.map((item, index) => `${index + 1}. ${item.groupId} (${item.groupName || '未知'})`).join('\n') || ''
  msgs.push(segment.text(data))
  msgs.unshift(segment.text(`好友列表如下: 总共${list.length}个好友`))

  if (e.msg.includes('保存')) {
    const file = `${root.basePath}/${basename}/resources/list`

    const filePath = `${file}/${e.msg.includes('群') ? `${e.selfId}_Group_List.txt` : `${e.selfId}_Friend_List.txt`}`
    if (fs.existsSync(filePath)) {
      e.reply('检测到已存在文件，你可以执行以下操作:\n覆盖\n添加')
      const event = await karin.ctx(e)
      if (event.msg === '覆盖') {
        await fs.promises.writeFile(filePath, data)
        e.reply('文件已保存，可执行\n#上传(群/好友)名单\n来上传文件')
        return true
      } else if (event.msg === '添加') {
        await fs.promises.appendFile(filePath, data)
        e.reply('文件已保存，可执行\n#上传(群/好友)名单\n来上传文件')
        return true
      } else {
        await e.reply('指令错误，退出操作')
      }
    } else {
      if (!fs.existsSync(file)) {
        fs.mkdirSync(file, { recursive: true })
      }
      await fs.promises.writeFile(filePath, data)
      e.reply('文件已保存，可执行\n#上传(群/好友)名单\n来上传文件')
    }
  }

  const msg = common.makeForward(msgs, e.selfId, e.bot.account.name)
  await e.bot.sendForwardMsg(e.contact, msg)
  return true
}, { name: '获取群列表', priority: -1, permission: 'master' })

export const uploadList = karin.command(/^#上传(群|好友)名单$/, async (e) => {
  const path = `${root.basePath}/${basename}/resources/list`
  const txtPath = `${path}/${e.msg.includes('群') ? `${e.selfId}_Group_List.txt` : `${e.selfId}_Friend_List.txt`}`
  if (e.isGroup) {
    if (!(fs.existsSync(txtPath))) {
      e.reply('你还未保存文件，请先执行\n#保存(群|好友)列表')
      return true
    }
    await e.bot.uploadFile(e.contact, txtPath, `${e.msg.includes('群') ? `${e.selfId}_群列表.txt` : `${e.selfId}_好友列表.txt`}`)
    return true
  } else {
    if (!fs.existsSync(txtPath)) {
      e.reply('你还未保存文件，请先执行\n#保存(群|好友)列表\n')
      return true
    }
    await e.bot.uploadFile(e.contact, txtPath, `${e.msg.includes('群') ? `${e.selfId}_群列表.txt` : `${e.selfId}_好友列表.txt`}`)
    return true
  }
}, { name: '上传群好友列表', priority: -1, permission: 'master' })
