import { isAdmin } from '@/utils/common'
import moment from 'node-karin/moment'
import karin, { common, logger, segment } from 'node-karin'
import type { Client } from 'icqq'

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
}, { name: '改群名', priority: -1, event: 'message.group', perm: 'group.admin' })

/**
 * 获取禁言列表
*/
export const MuteList = karin.command(/^#?(获取|查看)?禁言列表$/, async (e) => {
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
  const content = common.makeForward(lsit, e.selfId, e.bot.account.name)
  await e.bot.sendForwardMsg(e.contact, content)
  return true
}, { name: '获取禁言列表', priority: -1, event: 'message.group' })

export const ModifyMemberCard = karin.command(/^#(改|设置|修改)(bot)?群名片/i, async (e) => {
  const Name = e.msg.replace(/^#(改|设置|修改)(bot)?群名片/i, '').trim()
  let id = e.at[0]
  const isSelf = /^#(改|设置|修改)bot群名片/i.test(e.msg)
  if (isSelf) id = e.selfId
  if (!isSelf && !await isAdmin(e)) return false
  if (!id) return await e.reply('请@需要修改群名片的人')
  if (!Name) return await e.reply('群名片不能为空', { reply: true })

  try {
    await e.bot.setGroupMemberCard(e.groupId, id, Name)
    await e.reply(`已经将${isSelf ? '自己' : `用户[${id}]`}的群名片修改为『${Name}』`)
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    return true
  }
  return true
}, { name: '改群名片', priority: -1, permission: 'group.admin', event: 'message.group' })

export const SetEssence = karin.command(/^#?(加|设|移)精$/, async (e) => {
  if (!await isAdmin(e)) return false
  if (!e.replyId) {
    e.reply('请回复需要设置精华的消息')
    return true
  }

  try {
    await e.bot.setGgroupHighlights(e.groupId, e.replyId, e.msg.includes('加') || e.msg.includes('设'))
    await e.reply('操作成功', { at: true })
  } catch (error) {
    await e.reply('\n错误: 未知原因❌', { at: true })
    return true
  }

  return true
}, { name: '处理精华消息', priority: -1, event: 'message.group', perm: 'group.admin' })

export const segGroupAvatar = karin.command(/^#(改|设置|修改)群头像/i, async (e) => {
  try {
    if (!await isAdmin(e)) return false
    let file = e.elements.find(item => item.type === 'image')?.file
    if (!file) {
      await e.reply('请发送需要更换的图片')
      const event = await karin.ctx(e)
      file = event.elements.find(item => item.type === 'image')?.file
      if (!file) return await e.reply('未检测到图片')
    }
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
}, { name: '修改群头像', priority: -1, event: 'message.group', perm: 'group.admin' })
