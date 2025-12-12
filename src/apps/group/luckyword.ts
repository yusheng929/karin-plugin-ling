import { cfg } from '@/config'
import { render } from '@/utils/render'
import { QQApi, luckyWord, luckyWordList } from '@/models/api'
import { dir } from '@/utils/dir'
import karin, { common, segment } from 'node-karin'

const aPath = '[group/luckyword]'
export const luckylist = karin.command(/^#(查)?(幸运)?字符(列表)?$/, async (e) => {
  const data = await new QQApi(e).luckylist(e.groupId)
  if (!data) return e.reply('❌请稍后再试')
  if (data.retcode !== 0) return e.reply('❌获取数据错误')
  const msgs = []
  const luckdata = data.data as luckyWordList
  if (luckdata.is_lucky_word_closed) return e.reply('❌本群暂未开启幸运字符')
  for (const item of luckdata.word_list) {
    msgs.push([
      segment.image(`https://tianquan.gtimg.cn/groupluckyword/item/${item.word_info.word_id}/pic-${item.light_up_info.light_up_char_count}.png?m=${item.word_info.mtime}`),
      segment.text(`id: ${item.word_info.word_id}`),
      segment.text(`\n名称: ${item.word_info.wording}`),
      segment.text(`\n寓意: ${item.word_info.word_desc}`),
      segment.text(`\n点亮状态: ${item.word_info.char_count === item.light_up_info.light_up_char_count ? '已点亮' : item.light_up_info.light_up_char_count + '/' + item.word_info.char_count}`)
    ])
  }
  msgs.unshift([segment.text(`当前正在使用的幸运字符是\nID: ${luckdata.equip_info.word_info.word_id}`)])
  const content = common.makeForward(msgs, e.selfId, e.bot.account.name)
  await e.bot.sendForwardMsg(e.contact, content)
  return true
}, { name: '幸运字符列表', priority: -1, event: 'message.group' })

export const luckyword = karin.command(/^#抽(幸运)?字符$/, async (e) => {
  const data = await new QQApi(e).luckyword(e.groupId)
  const opt = await cfg.get('other')
  if (!data) return e.reply('❌请稍后再试')
  if (data.retcode === 11004 && (data.msg === 'over svip max times' || data.msg === 'over member max times')) return e.reply('❌今日抽取次数已达上限')
  if (data.retcode === 11001 && data.msg === 'group lucky word has closed') return e.reply('❌本群未开启幸运字符功能')
  if (data.retcode !== 0) return e.reply('❌发送数据错误')
  if (Object.keys(data.data).length === 0) return e.reply(segment.image(`file://${dir.pluginPath}/resources/luckword/null.png`))
  const luckdata = data.data as luckyWord
  const item = {
    url: `https://tianquan.gtimg.cn/groupluckyword/item/${luckdata.word_info.word_info.word_id}/pic-0.png?m=${luckdata.word_info.word_info.mtime}`,
    title: `${luckdata.word_info.word_info.word_desc}`
  }
  if (!opt.word_render) {
    return await e.reply(`恭喜你，抽中了[${luckdata.word_info.word_info.wording}]\n寓意: ${item.title}`)
  }
  const img = await render('luckword/index', {
    data: item,
    scale: 1.2
  })
  e.reply(img)
  return true
}, { name: aPath + '抽幸运字符', priority: -1, event: 'message.group' })

export const lucksetting = karin.command(/^#(开启|关闭)(幸运)?字符$/, async (e) => {
  const info = await e.bot.getGroupMemberInfo(e.groupId, e.selfId)
  if (!(['owner', 'admin'].includes(info.role))) {
    await e.reply('少女做不到呜呜~(>_<)~')
    return true
  }
  const type = !!e.msg.includes('开启')
  const data = await new QQApi(e).lucksetting(e.groupId, type)
  if (!data) return e.reply('❌请稍后再试')
  if (data.retcode === 11111 && (data.retmsg === 'repeat open' || data.retmsg === 'repeat close')) return e.reply('❌幸运字符已经处于' + (data.retmsg === 'repeat open' ? '开启' : '关闭') + '状态')
  if (data.retcode !== 0) return e.reply('❌发送数据错误')
  return e.reply(`✅${type ? '开启' : '关闭'}成功`)
}, { name: '开启/关闭幸运字符', priority: -1, event: 'message.group', perm: 'group.admin' })

export const luckequip = karin.command(/^#替换(幸运)?字符(\d+)$/, async (e) => {
  const info = await e.bot.getGroupMemberInfo(e.groupId, e.selfId)
  if (!(['owner', 'admin'].includes(info.role))) {
    await e.reply('少女做不到呜呜~(>_<)~')
    return true
  }
  const id = e.msg.replace(/^#替换(幸运)?字符/, '').trim()
  if (!id) return e.reply('❌请输入正确的字符ID')
  const data = await new QQApi(e).luckequip(e.groupId, id)
  if (!data) return e.reply('❌请稍后再试')
  if (data.retcode === 11106 && data.retmsg === 'word not draw') return e.reply('❌未拥有当前id的幸运字符')
  if (data.retcode === 11201 && data.retmsg === 'word same with equiped') return e.reply('❌已经装备了当前id的幸运字符')
  if (data.retcode !== 0) return e.reply('❌发送数据错误')
  return e.reply('✅替换成功')
}, { name: aPath + '替换幸运字符', priority: -1, event: 'message.group', perm: 'group.admin' })
