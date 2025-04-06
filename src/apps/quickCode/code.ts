import { karin, exec, logger } from 'node-karin'

export const codejs = karin.command(/^js/, async (e) => {
  const code = e.msg.replace(/^js/, '').trim()
  if (!code) return false
  try {
    // eslint-disable-next-line no-eval
    let msg = eval(code)
    if (!msg) return e.reply('没有返回值')
    msg = typeof msg === 'object' && msg !== null ? JSON.stringify(msg, null, 2) : String(msg)
    await e.reply(msg)
  } catch (error) {
    await e.reply(`错误：\n${error}`)
    logger.error(error)
  }
  return true
}, { name: 'CodeJs', permission: 'master', priority: -1 })

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
