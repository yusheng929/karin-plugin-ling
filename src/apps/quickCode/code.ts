import { RunJs } from '@/components/runcode'
import * as karin from 'node-karin'

export const runjs = karin.karin.command(/^rjs/, async (e) => {
  const code = e.msg.replace(/^rjs/, '').trim()
  if (!code) return false
  try {
    const sandbox = {
      im: async (module: string) => {
        // eslint-disable-next-line no-eval
        return await eval(`import('${module}')`)
      },
      ...karin,
      ...global,
      ...globalThis,
      e,
      console,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Buffer,
      global,
      globalThis,
      process,
    }
    const result = await RunJs(code, sandbox)
    if (result === '') return e.reply('没有返回值')
    const msg = typeof result === 'object' && result !== null ? JSON.stringify(result, null, 2) : String(result)
    return e.reply(msg, { reply: true })
  } catch (error) {
    if (String(error).includes('Script execution timed out')) return await e.reply('运行超时30秒,已终止运行', { reply: true })
    await e.reply(`错误：\n${error}`, { reply: true })
    karin.logger.error(error)
  }
  return true
}, { name: 'RunJs', permission: 'master', priority: -1 })

export const runcode = karin.karin.command(/^rc/, async (e) => {
  const code = e.msg.replace(/^rc/, '').trim()
  if (!code) return false

  const { status, error, stdout, stderr } = await karin.exec(code)
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
}, { name: 'RunCode', permission: 'master', priority: -1 })
