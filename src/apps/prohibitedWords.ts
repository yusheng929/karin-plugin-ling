import { group } from '@/utils/config'
import { karin, segment, common } from 'node-karin'

export const ProhibitedWords = karin.command(/^#查看(所有)?违禁词/, async (e) => {
  const data = group()
  if (e.msg.includes('所有')) {
    const list: string[] = []
    Object.keys(data).forEach((id) => {
      list.push([
        `群号: ${id}`,
        `是否启用: ${data[id]['enable']}`,
        `拦截规则: ${Number(data[id]['rule']) === 0 ? '模糊拦截' : '精准拦截'}`,
        `是否禁言: ${data[id]['ban']}`,
        `禁言时长: ${data[id]['time']}`,
        `违禁词列表: ${data[id]['words'].join('\n')}`,
      ].join('\n'))
    })

    const message = list.map((v) => segment.text(v))
    const msg = common.makeForward(message, e.selfId, e.bot.account.name)
    await e.bot.sendForwardMsg(e.contact, msg)
    return true
  }

  if (!e.isGroup) {
    await e.reply('请在群聊中使用', { at: true })
    return false
  }

  const key = data[e.groupId] ? e.groupId : 'default'
  const { enable, rule, ban, time, words } = data[key]
  const message = [
    '\n' + key === e.groupId ? `群号: ${e.groupId}` : '当前群未配置违禁词，将使用默认违禁词',
    `是否启用: ${enable}`,
    `拦截规则: ${Number(rule) === 0 ? '模糊拦截' : '精准拦截'}`,
    `是否禁言: ${ban}`,
    `禁言时长: ${time}`,
    `违禁词列表: ${words.join('\n')}`,
  ].join('\n')

  await e.reply(message, { at: true })
  return true
}, { name: '查看违禁词', priority: -1, perm: 'master' })
