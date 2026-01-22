import { karin } from 'node-karin'
import { cfg } from '@/config'

export const groupApplySwitch = karin.command(/^#(开启|关闭)加群通知$/, async (e) => {
  const opts = await cfg.get('group')
  if (e.msg.includes('关闭')) {
    if (!opts.Apply_list.includes(e.groupId)) {
      await e.reply('本群暂未开启加群申请通知')
      return true
    }
    await cfg.set('group', 'del', 'Apply_list', e.groupId)
  } else {
    if (opts.Apply_list.includes(e.groupId)) {
      await e.reply('本群已开启加群申请通知')
      return true
    }
    await cfg.set('group', 'add', 'Apply_list', e.groupId)
  }
  await e.reply(`已${e.msg.includes('关闭') ? '关闭' : '开启'}[${e.groupId}]的加群申请通知`)
  return true
}, { name: '加群通知开关', priority: -1, event: 'message.group', perm: 'group.admin' })

export const test = karin.command(/^#(开启|关闭)进群验证$/, async (e) => {
  const opt = await cfg.get('group')
  if (e.msg.includes('关闭')) {
    if (!opt.MemberChange.joinVerify.includes(e.groupId)) {
      await e.reply('\n进群验证已经处于关闭状态', { at: true })
      return true
    }
    await cfg.set('group', 'del', 'MemberChange.joinVerify', e.groupId)
    await e.reply('\n已关闭进群验证', { at: true })
    return true
  }

  if (opt.MemberChange.joinVerify.includes(e.groupId)) {
    await e.reply('\n进群验证已经处于开启状态', { at: true })
    return true
  }
  cfg.set('group', 'add', 'MemberChange.joinVerify', e.groupId)
  await e.reply('\n已开启进群验证', { at: true })
  return true
}, { name: '进群验证', perm: 'group.admin', event: 'message.group' })
