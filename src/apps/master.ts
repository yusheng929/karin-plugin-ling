import { YamlEditor, karin, logger, segment, Cfg } from 'node-karin'
import crypto from 'crypto' // 确保您导入了 crypto

interface SignEntry {
  user_id: string
  sign: string
}

const sign: Record<string, SignEntry> = {} // 使用 Record 定义

export const Master = karin.command(/^#设置主人$/, async (e) => {
  if (e.isMaster) {
    e.reply(`[${e.userId}] 已经是主人`, { reply: false })
    return true
  }
  const user_id = e.userId
  /** 生成验证码 */
  sign[e.userId] = { user_id, sign: crypto.randomUUID() }
  logger.mark(`设置主人验证码：${logger.green(sign[e.userId].sign)}`)
  await e.reply([segment.at(e.userId), '请输入控制台的验证码'])
  const event = await karin.ctx(e)
  if (event.msg === sign[e.userId]?.sign) {
    const yaml = new YamlEditor('config/config/config.yaml')
    yaml.append('master', String(user_id))
    yaml.save()
    e.reply([segment.at(user_id), '设置主人成功'])
    return true
  } else {
    e.reply([segment.at(e.userId), '验证码错误'])
    return true
  }
}, { name: '设置主人', priority: -1 })

export const addMaster = karin.command(/^#新增主人/, async (e) => {
  const user_id = e.at[0]
  if (!user_id) {
    e.reply('请艾特需要添加的主人')
    return true
  }
  const master_list = Cfg.master
  if (master_list.includes(user_id)) {
    e.reply(`[${user_id}] 已经是主人`, { reply: true })
    return true
  }
  const yaml = new YamlEditor('config/config/config.yaml')
  yaml.append('master', String(user_id))
  yaml.save()
  e.reply(`已将用户[${user_id}]设置为主人`, { reply: true })
  return true
}, { name: '添加主人', priority: -1, permission: 'master' })

export const delMaster = karin.command(/^#删除主人/, async (e) => {
  const user_id = e.at[0]
  if (!user_id) {
    e.reply('请艾特需要删除的主人')
    return true
  }
  const master_list = Cfg.master
  if (!master_list.includes(user_id)) {
    e.reply(`[${user_id}] 非主人`, { reply: true })
    return true
  }
  const yaml = new YamlEditor('config/config/config.yaml')
  yaml.remove('master', String(user_id))
  yaml.save()
  e.reply(`已将用户[${user_id}]从主人列表中移除`, { reply: true })
  return true
}, { name: '删除主人', priority: -1, permission: 'master' })
