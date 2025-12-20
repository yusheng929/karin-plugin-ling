import { render } from '@/utils/render'
import { RunJs } from '@/models/runcode'
import os from 'os'
import * as karin from 'node-karin'
import hljs from 'highlight.js'
import shell from 'highlight.js/lib/languages/powershell'
hljs.registerLanguage('powershell', shell)

const createTitle = (user: string, host: string, path: string) => {
  const isWindows = os.platform() === 'win32'
  const Path = isWindows ? path + '>' : path.replace(/^\/root/, '~')
  const symbol = user === 'root' ? '#' : '$'
  return `${user}@${host}:${Path}${symbol} `
}
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

export const runcode = karin.karin.command(/^rc(p)?(.*)$/, async (e) => {
  const [, isPic, code] = e.msg.match(/^rc(p)?(.*)$/) || []
  if (!code) return false
  const username = os.userInfo().username
  const hostname = os.hostname()
  const Path = process.cwd()
  const { error, stdout, stderr } = await karin.exec(code, { timeout: 60000 })
  let output = stderr + (error || stdout)
  if (isPic) {
    const cmd = hljs.highlight(code, { language: 'powershell' }).value
    const data = {
      title: createTitle(username, hostname, Path),
      cmd,
      output: output.split('\n').filter(i => i.trim() !== '')
    }
    const img = await render('runcode/index', { data })
    e.reply(img, { reply: true })
  } else {
    output = createTitle(username, hostname, Path) + code + '\n' + output
    e.reply(output, { reply: true })
  }
  return true
}, { name: 'RunCode', permission: 'master', priority: -1 })
