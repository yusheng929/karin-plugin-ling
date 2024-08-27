import crypto from 'crypto'
import { YamlEditor, karin, logger, segment } from 'node-karin'

export const Master = karin.command(/^#设置主人$/, async (e) => {
  const sign = {}
  if (e.isMaster) return e.reply(`[${e.user_id}] 已经是主人`, true)
  const user_id = e.user_id
  /** 生成验证码 */
  sign[e.user_id] = { user_id, sign: crypto.randomUUID() }
  logger.mark(`设置主人验证码：${logger.green(sign[e.user_id].sign)}`)
  await e.reply([segment.at(e.user_id), '请输入控制台的验证码'])
  const event = await karin.ctx(e)
  if (event.msg === sign[e.user_id]?.sign) {
    const yaml = new YamlEditor('config/config/config.yaml')
    yaml.append('master', String(user_id))
    yaml.save()
    return e.reply([segment.at(user_id), '设置主人成功'])
  } else {
    return e.reply([segment.at(e.user_id), '验证码错误'])
  }
}, { name: '设置主人', priority: '-1' })
