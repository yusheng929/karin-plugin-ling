import { addYaml, delYaml, other } from '@/utils/config'
import karin from 'node-karin'

export const work = karin.command(/^#?(上班|下班)$/, async (e) => {
  const cfg = other()
  if (e.msg.includes('上班')) {
    if (!cfg.noWork.includes(e.groupId)) return e.reply('已经在工作了')
    delYaml('other', 'noWork', e.groupId)
    return e.reply('开始上班')
  }
  if (e.msg.includes('下班')) {
    if (cfg.noWork.includes(e.groupId)) return e.reply('已经在下班状态了')
    addYaml('other', 'noWork', e.groupId)
    return e.reply('开始下班')
  }
}, { event: 'message.group', perm: 'master' })
