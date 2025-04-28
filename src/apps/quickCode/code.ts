import { RunJs } from '@/components/runcode'
import * as karin from 'node-karin'

export const runjs = karin.karin.command(/^rjs/, async (e) => {
  const code = e.msg.replace(/^rjs/, '').trim()
  if (!code) return false
  Object.defineProperty(global, 'Function', {
    value: undefined,
    configurable: false,
    writable: false,
    enumerable: false
  })
  try {
    const sandbox = {
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
      process: {
        env: process.env,
        pid: process.pid,
        argv: process.argv,
        platform: process.platform,
        version: process.version,
        versions: process.versions
      },
    }
    const result = await RunJs(code, sandbox)
    if (result === '') return e.reply('没有返回值')
    const msg = typeof result === 'object' && result !== null ? JSON.stringify(result, null, 2) : String(result)
    return e.reply(msg, { reply: true })
  } catch (error) {
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
