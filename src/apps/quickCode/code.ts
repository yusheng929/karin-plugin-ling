import { render } from '@/components/puppeteer'
import { RunJs } from '@/components/runcode'
import os from 'os'
import * as karin from 'node-karin'
import hljs from 'highlight.js'
import shell from 'highlight.js/lib/languages/powershell'
hljs.registerLanguage('powershell', shell)

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
  const isWindows = os.platform() === 'win32'
  const username = os.userInfo().username
  const hostname = os.hostname()
  const Path = process.cwd()
  let title
  if (isWindows) {
    title = `${username}@${hostname} ${Path}>`
  } else {
    title = `${username}@${hostname}:${Path.replace(/^\/root/, '~')}${username === 'root' ? '#' : '$'}`
  }
  const { error, stdout, stderr } = await karin.exec(code)
  let output = stderr + (error || stdout)
  if (isPic) {
    const highlightedCode = hljs.highlight(code, { language: 'powershell' }).value
    output = title + ` ${highlightedCode}\n` + output
    const img = await render('runcode/index', { data: { output } })
    e.reply(img)
  } else {
    output = title + code + '\n' + output
    e.reply(output, { reply: true })
  }
  return true
}, { name: 'RunCode', permission: 'master', priority: -1 })
