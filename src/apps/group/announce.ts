import { QQApi } from '@/models/api'
import karin from 'node-karin'

export const sendannounce = karin.command(/^#发(群)?公告/, async (e) => {
  const info = await e.bot.getGroupMemberInfo(e.groupId, e.selfId)
  if (!(['owner', 'admin'].includes(info.role))) {
    await e.reply('少女做不到呜呜~(>_<)~')
    return true
  }
  const msgId = e.messageId
  const data = await e.bot.getMsg(e.contact, msgId)
  const msg = e.msg.replace(/^#发(群)?公告/, '').trim()
  const url = (data.elements[1] as { file?: string })?.file
  if (!msg) {
    return e.reply('请发送需要发送的消息')
  }
  const result = await new QQApi(e).sendAnnouncs(e.groupId, msg, url)
  if (!result) return e.reply('❌请稍后再试')
  if (result.ec !== 0) return e.reply('❌发送错误\n' + JSON.stringify(result, null, '\t'))
}, { name: '发群公告', priority: -1, perm: 'group.admin', event: 'message.group' })

// export const announcelist = karin.command(/^#(群)?公告列表$/, async (e) => {
//  const data = await new QQApi(e).announcelist(e.groupId)
//  if (!data) return e.reply('��请��后再试')
//  if (data.ec !== 0) return e.reply('��获取公告列表错误\n' + JSON.stringify(data, null, '\t'))
//  const list = data.data.map((item: any) => `${item.time} ${item.sender}:\n${item.msg}`)
//  return e.reply('\n' + list.join('\n'), { at: true })
// }, { name: '群公告列表', priority: -1, perm: 'group.admin', event: 'message.group' })
