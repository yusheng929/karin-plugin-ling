import QQApi from '@/models/api/QQApi'
import karin, { common, segment } from 'node-karin'

export const luckylist = karin.command(/^#(查)?(幸运)?字符(列表)?$/, async (e) => {
  return false
  const data = await new QQApi(e).luckylist(e.groupId)
  if (!data) return e.reply('❌请稍后再试')
  if (data.retcode !== 0) return e.reply('❌获取数据错误')
  const msg = []
  const items = data.data.word_list
  for (const item of items) {
    msg.push(...[
      segment.image(`https://tianquan.gtimg.cn/groupluckyword/item/${item.word_info.word_id}/tinypic-0.png?m=${item.word_info.mtime}`),
      segment.text(`id: ${item.word_info.word_id}`),
      segment.text(`名称: ${item.word_info.wording}`),
      segment.text(`寓意: ${item.word_info.word_desc}`),
      segment.text(`点亮状态: ${item.char_count === item.light_up_info.light_up_char_count ? '已点亮' : item.light_up_info.light_up_char_count + '/' + item.char_count}`)
    ])
  }
  msg.unshift(segment.text(`当前正在使用的幸运字符是\nID: ${data.data.equip_info.word_info.word_id}`))
  const content = common.makeForward(msg, e.selfId, e.bot.account.name)
  await e.bot.sendForwardMsg(e.contact, content)
  return true
}, { name: '幸运字符列表', priority: -1, event: 'message.group' })
