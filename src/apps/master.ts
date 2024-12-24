import crypto from 'crypto'
import { karin, logger, config } from 'node-karin'

export const Master = karin.command(/^#(设置|新增)主人/, async (e) => {
  const userId = e.at[0] || e.msg.replace(/^#(设置|新增)主人/, '').trim() || e.userId
  if (userId === e.userId) {
    if (e.isMaster) {
      await e.reply(`\n[${e.userId}] 已经是主人`, { at: true })
      return true
    }
  } else if (config.master().includes(userId)) {
    await e.reply(`\n[${e.userId}] 已经是主人`, { at: true })
    return true
  }

  const sign = crypto.randomUUID()
  logger.mark(`设置主人验证码：${logger.green(sign)}`)
  const event = await karin.ctx(e)
  await e.reply('\n请输入控制台验证码', { at: true })

  if (sign !== event.msg.trim()) {
    await e.reply('验证码错误', { at: true })
    return true
  }

  const name = 'config' as const
  const data = config.getYaml(name, 'user').value
  data.master.push(userId)
  config.setYaml(name, data)

  await e.reply(`\n新增主人: ${userId}`, { at: true })
  return true
}, { name: '设置主人', priority: -1 })

export const delMaster = karin.command(/^#删除主人/, async (e) => {
  const userId = e.at[0] || e.msg.replace(/^#删除主人/, '').trim() || e.userId
  if (userId === e.userId) {
    if (e.isMaster) {
      await e.reply(`\n[${e.userId}] 不可以删除自己`, { at: true })
      return true
    }
  } else if (!config.master().includes(userId)) {
    await e.reply(`\n[${userId}] 不是主人`, { at: true })
    return true
  }

  const name = 'config' as const
  const data = config.getYaml(name, 'user').value
  data.master = data.master.filter((v: string) => v !== userId)
  config.setYaml(name, data)

  await e.reply(`\n删除主人: ${userId}`, { at: true })
  return true
}, { name: '删除主人', priority: -1, permission: 'master' })
