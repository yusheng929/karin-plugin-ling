import { karin, YamlEditor, logger } from 'node-karin'
import { Config, Edit } from '#components'

export const test = karin.command(/^#(上班|下班)$/, async (e) => {
if (!e.isGroup) return e.reply('请在群聊中执行')
  if (e.msg.includes('上班')) {
    return await Edit.EditRemove(e, '开始上班(T^T)', '已经是上班状态咯~', 'NoWork', e.group_id, 'other')
  }
  if (e.msg.includes('下班')) {
    return await Edit.EditAddend(e, '下班咯~', '已经是下班状态咯~', 'NoWork', e.group_id, 'other')
  }
  return true
}, { permission: 'master' })
