import { render } from '@/lib/puppeteer'
import QQApi from '@/models/api/QQApi'
import karin, { common, segment } from 'node-karin'

export const luckylist = karin.command(/^#(查)?(幸运)?字符(列表)?$/, async (e) => {
  const data = await new QQApi(e).luckylist(e.groupId)
  if (!data) return e.reply('❌请稍后再试')
  if (data.retcode !== 0) return e.reply('❌获取数据错误')
  const msgs = []
  const items = data.data.word_list
  for (const item of items) {
    msgs.push([
      `id: ${item.word_info.word_id}`,
      `名称: ${item.word_info.wording}`,
      `寓意: ${item.word_info.word_desc}`,
      `点亮状态: ${item.word_info.char_count === item.light_up_info.light_up_char_count ? '已点亮' : item.light_up_info.light_up_char_count + '/' + item.word_info.char_count}`
    ].join('\n'))
  }
  msgs.unshift(`当前正在使用的幸运字符是\nID: ${data.data.equip_info.word_info.word_id}`)
  const msg = msgs.map((m) => segment.text(m))
  const content = common.makeForward(msg, e.selfId, e.bot.account.name)
  await e.bot.sendForwardMsg(e.contact, content)
  return true
}, { name: '幸运字符列表', priority: -1, event: 'message.group' })

export const luckyword = karin.command(/^#抽(幸运)?字符$/, async (e) => {
  const data = await new QQApi(e).luckyword(e.groupId)
  if (!data) return e.reply('❌请稍后再试')
  if (data.retcode === 11004 && (data.msg === 'over svip max times' || data.msg === 'over member max times')) return e.reply('❌今日抽取次数已达上限')
  if (data.retcode !== 0) return e.reply('❌发送数据错误')
  if (Object.keys(data.data).length === 0) return e.reply(segment.image('resources/luckword/null.png'))
  const item = {
    url: `https://tianquan.gtimg.cn/groupluckyword/item/${data.data.word_info.word_info.word_id}/pic-0.png?m=${data.data.word_info.word_info.mtime}`,
    title: `${data.data.word_info.word_info.word_desc}`
  }
  const img = await render('luckword/index', {
    data: item,
    scale: 1.2
  })
  e.reply(img)
  return true
}, { name: '抽幸运字符', priority: -1, event: 'message.group' })
