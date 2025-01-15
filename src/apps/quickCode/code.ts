import { karin, common, exec, logger, segment } from 'node-karin'

export const codejs = karin.command(/^rjs/, async (e) => {
  const code = e.msg.replace(/^rjs/, '').trim()
  if (!code) return false
  try {
    // eslint-disable-next-line no-eval
    const msg = eval(code)
    await e.reply(msg)
  } catch (error) {
    await e.reply(`错误：\n${error}`)
    logger.error(error)
  }
  return true
}, { name: 'CodeJs', permission: 'master', priority: -1 })

export const forwardMsg = karin.command(/^fm/, async (e) => {
  const msgs = e.msg.replace(/^fm/, '').trim()
  if (!msgs) return false
  try {
    const elements = segment.text(msgs)
    const msg = common.makeForward(elements, e.selfId, e.bot.selfName)
    await e.bot.sendForwardMsg(e.contact, msg)
  } catch (error) {
    await e.reply(`错误：\n${error}`)
    logger.error(error)
  }
  return true
}, { name: 'ForwardMsg', permission: 'master', priority: -1 })

export const code = karin.command(/^rc/, async (e) => {
  const code = e.msg.replace(/^rc/, '').trim()
  if (!code) return false

  const { status, error, stdout, stderr } = await exec(code)
  if (status) {
    await e.reply(stdout)
    return true
  }

  if (error) {
    await e.reply('执行错误: \n' + error.message)
    return true
  }

  if (stderr) {
    await e.reply('标准错误输出: \n' + stderr)
    return true
  }

  return true
}, { name: 'Code', permission: 'master', priority: -1 })
