import { isAdmin } from '@/utils/common'
import moment from 'node-karin/moment'
import karin, { common, logger, segment } from 'node-karin'
import type { Client } from 'icqq'
import { dir } from '@/utils/dir'

const aPath = '[group/other]'
/**
 * 改群名
 */
export const ModifyGroupName = karin.command(/^#(改|设置|修改)群名/, async (e) => {
  if (!await isAdmin(e)) return false
  const Name = e.msg.replace(/^#(改|设置|修改)群名/, '').trim()
  if (!Name) {
    e.reply('群名不能为空', { at: true })
    return true
  }

  try {
    await e.bot.setGroupName(e.groupId, Name)
    e.reply(`已经将群名修改为『${Name}』`)
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    logger.error(error)
    return true
  }
  return true
}, { name: aPath + '改群名', priority: -1, event: 'message.group', perm: 'group.admin' })

/**
 * 获取禁言列表
*/
export const MuteList = karin.command(/^#(获取|查看)?禁言列表$/, async (e) => {
  const lsit = []
  const result = await e.bot.getGroupMuteList(e.groupId)
  if (!result.length) {
    e.reply('\n没有被禁言的人哦~', { at: true })
    return true
  }

  for (const item of result) {
    lsit.push(...[
      segment.image(await e.bot.getAvatarUrl(item.userId)),
      segment.text(`\nQQ号: ${item.userId}`),
      segment.text(`\n禁言剩余: ${moment(item.muteTime - Date.now()).format('HH:mm:ss')}`),
      segment.text(`\n禁言到期: ${moment(item.muteTime * 1000).format('YYYY-MM-DD HH:mm:ss')}`),
    ])
  }

  lsit.unshift(segment.text(`禁言列表如下(共${result.length}人):`))
  const content = common.makeForward(lsit, '2854196310', dir.name)
  await e.bot.sendForwardMsg(e.contact, content)
  return true
}, { name: aPath + '获取禁言列表', priority: -1, event: 'message.group' })

export const ModifyMemberCard = karin.command(/^#(?:改|设置|修改)(bot)?群名片(.*)$/i, async (e) => {
  const reg = /^#(?:改|设置|修改)(bot)?群名片(.*)$/i
  const match = e.msg.match(reg)!
  const Name = match[2].trim()
  const isSelf = match[1]
  let id = e.at[0]
  if (isSelf) id = e.selfId
  if (!isSelf && !await isAdmin(e)) return false
  if (!id) return await e.reply('请@需要修改群名片的人')
  if (!Name) return await e.reply('群名片不能为空', { reply: true })
  await e.bot.setGroupMemberCard(e.groupId, id, Name)
  await e.reply(`已经将${isSelf ? '自己' : `用户[${id}]`}的群名片修改为『${Name}』`)
  return true
}, { name: aPath + '改群名片', priority: -1, permission: 'group.admin', event: 'message.group' })

export const SetEssence = karin.command(/^#?(?:(?:取消|移除?)|(添?加|设置?))群?精华?(.*)$/, async (e) => {
  if (!await isAdmin(e)) return false
  const reg = /^#?(?:(?:取消|移除?)|(添?加|设置?))群?精华?(.*)$/
  const match = e.msg.match(reg)!
  const action = !!match[1]
  const msgId = match[2].trim()
  if (!msgId && !e.replyId) {
    e.reply('请回复需要设置精华的消息')
    return true
  }

  try {
    await e.bot.setGroupHighlights(e.groupId, msgId || e.replyId, action)
    await e.reply('操作成功', { at: true })
  } catch (error: any) {
    await e.reply(`设置失败❌\n${error.message}`, { reply: true })
    logger.error(error)
    return true
  }

  return true
}, { name: aPath + '处理精华消息', priority: -1, event: 'message.group', perm: 'group.admin' })

export const EssenceList = karin.command(/^#(获取|查看)?(群)?精华列表$/, async (e) => {
  const list = await e.bot.getGroupHighlights(e.groupId, 1, 50)
  const msg = []
  for (const item of list) {
    msg.push([
      segment.text('消息ID: ' + item.messageId),
      segment.text(`\n发送者: ${item.senderName}(${item.senderId})`),
      segment.text(`\n操作者: ${item.operatorName}(${item.operatorId})`),
      segment.text(`\n操作时间: ${new Date(item.operationTime * 1000)}`),
      segment.text('\n消息内容:\n'),
      ...JSON.parse(item.jsonElements)
    ])
  }
  msg.unshift([segment.text(`当前页共有${list.length}精华消息\n您可以使用#取消精华消息 + 消息ID 来取消精华`)])
  const content = common.makeForward(msg, '2854196310', dir.name)
  await e.bot.sendForwardMsg(e.contact, content)
}, { name: aPath + '获取精华列表', event: 'message.group' })

export const segGroupAvatar = karin.command(/^#(改|设置|修改)群头像$/i, async (e) => {
  try {
    if (!await isAdmin(e)) return false
    let file = e.elements.find(item => item.type === 'image')?.file
    if (!file) {
      await e.reply('请发送需要更换的图片')
      const event = await karin.ctx(e)
      file = event.elements.find(item => item.type === 'image')?.file
      if (!file) return await e.reply('未检测到图片')
    }
    // Karin尚未支持该接口
    // await e.bot.setGroupAvatar(e.groupId, file)
    if (e.bot.adapter.standard === 'icqq') {
      await (e.bot.super as Client).pickGroup(Number(e.groupId)).setAvatar(file)
    } else if (e.bot.adapter.standard === 'onebot11') {
      await e.bot.super.sendApi!('set_group_portrait', { group_id: e.groupId, file })
    } else return await e.reply(`当前适配器[${e.bot.adapter.standard}]暂不支持此功能`)
    return await e.reply('修改成功')
  } catch (error) {
    await e.reply('未知错误\n请前往控制台查看')
    logger.error(error)
    return false
  }
}, { name: aPath + '修改群头像', priority: -1, event: 'message.group', perm: 'group.admin' })

export const recall = karin.command(/^#?撤回$/, async (e) => {
  if (!e.replyId) {
    e.reply('请回复需要撤回的消息~')
    return true
  }
  e.bot.recallMsg(e.contact, e.replyId)
  e.bot.recallMsg(e.contact, e.messageId)
  return true
}, { name: aPath + '撤回', priority: -1, perm: 'group.admin' })

export const clearScreenRecall = karin.command(/^#清屏(\d+)?$/, async (e) => {
  const reg = /^#清屏(\d+)?$/
  const count = +(e.msg.match(reg)![1].trim() || 50)
  const list = await e.bot.getHistoryMsg(e.contact, e.messageId, count)
  const msgIds = list.map(item => item.messageId)
  await e.reply('开始执行清屏操作，请确保我有管理员')
  for (const id of msgIds) {
    await e.bot.recallMsg(e.contact, id)
  }
  return true
}, { name: aPath + '清屏', priority: -1, event: 'message.group', perm: 'group.admin' })
