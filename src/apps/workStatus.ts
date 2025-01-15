import { other, setYaml } from '@/utils/config'
import { karin } from 'node-karin'

export const test = karin.command(/^#(上班|下班)$/, async (e) => {
  const cfg = other()
  if (e.msg.includes('上班')) {
    if (!cfg.noWork.includes(e.groupId)) {
      await e.reply('已经是上班状态咯~')
      return true
    }

    cfg.noWork = cfg.noWork.filter((v) => v !== e.groupId)
    setYaml('other.yaml', cfg)
    await e.reply('开始上班(T^T)')
    return true
  }

  if (cfg.noWork.includes(e.groupId)) {
    await e.reply('已经是下班状态咯~')
    return true
  }

  cfg.noWork.push(e.groupId)
  setYaml('other.yaml', cfg)
  await e.reply('开始下班(￣▽￣)~*')
  return true
}, { permission: 'master', event: 'message.group' })
